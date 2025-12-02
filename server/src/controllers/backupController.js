import asyncHandler from "express-async-handler";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { appAssert } from "../errors/appAssert.js";
import mongoose from "mongoose";
import zlib from "zlib";
import { promisify } from "util";

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backup directory
const BACKUP_DIR = path.join(__dirname, "../../backups");

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create database backup
export const createBackup = asyncHandler(async (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFileName = `backup-${timestamp}.gz`;
  const backupPath = path.join(BACKUP_DIR, backupFileName);

  try {
    // Get all collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const backupData = {
      timestamp: new Date(),
      collections: {},
    };

    // Export each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = mongoose.connection.db.collection(collectionName);
      const data = await collection.find({}).toArray();
      backupData.collections[collectionName] = data;
    }

    // Convert to JSON and compress
    const jsonData = JSON.stringify(backupData);
    const compressed = await gzip(jsonData);

    // Write to file
    fs.writeFileSync(backupPath, compressed);

    // Get file stats
    const stats = fs.statSync(backupPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    res.status(200).json({
      message: "Backup created successfully",
      backup: {
        fileName: backupFileName,
        path: backupPath,
        size: `${fileSizeInMB} MB`,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Backup error:", error);

    // Clean up failed backup file
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }

    res.status(500).json({
      message: "Failed to create backup",
      error: error.message,
    });
  }
});

// Get all backups
export const getBackups = asyncHandler(async (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR);

    const backups = files
      .filter((file) => file.endsWith(".gz"))
      .map((file) => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

        return {
          fileName: file,
          size: `${fileSizeInMB} MB`,
          createdAt: stats.mtime,
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(backups);
  } catch (error) {
    console.error("Error reading backups:", error);
    res.status(500).json({
      message: "Failed to retrieve backups",
      error: error.message,
    });
  }
});

// Download backup
export const downloadBackup = asyncHandler(async (req, res) => {
  const { fileName } = req.params;
  const backupPath = path.join(BACKUP_DIR, fileName);

  appAssert(fs.existsSync(backupPath), "Backup file not found", 404);
  appAssert(fileName.endsWith(".gz"), "Invalid backup file", 400);

  res.download(backupPath, fileName, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).json({
        message: "Failed to download backup",
        error: err.message,
      });
    }
  });
});

// Delete backup
export const deleteBackup = asyncHandler(async (req, res) => {
  const { fileName } = req.params;
  const backupPath = path.join(BACKUP_DIR, fileName);

  appAssert(fs.existsSync(backupPath), "Backup file not found", 404);
  appAssert(fileName.endsWith(".gz"), "Invalid backup file", 400);

  try {
    fs.unlinkSync(backupPath);
    res.status(200).json({
      message: "Backup deleted successfully",
      fileName,
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      message: "Failed to delete backup",
      error: error.message,
    });
  }
});

// Restore from backup
export const restoreBackup = asyncHandler(async (req, res) => {
  const { fileName } = req.params;
  const backupPath = path.join(BACKUP_DIR, fileName);

  appAssert(fs.existsSync(backupPath), "Backup file not found", 404);
  appAssert(fileName.endsWith(".gz"), "Invalid backup file", 400);

  try {
    // Read and decompress backup file
    const compressed = fs.readFileSync(backupPath);
    const decompressed = await gunzip(compressed);
    const backupData = JSON.parse(decompressed.toString());

    // Restore each collection
    for (const [collectionName, data] of Object.entries(
      backupData.collections
    )) {
      const collection = mongoose.connection.db.collection(collectionName);

      // Drop existing collection and restore
      await collection.drop().catch(() => {}); // Ignore if collection doesn't exist
      if (data.length > 0) {
        await collection.insertMany(data);
      }
    }

    res.status(200).json({
      message: "Database restored successfully",
      fileName,
      restoredAt: new Date(),
    });
  } catch (error) {
    console.error("Restore error:", error);
    res.status(500).json({
      message: "Failed to restore backup",
      error: error.message,
    });
  }
});

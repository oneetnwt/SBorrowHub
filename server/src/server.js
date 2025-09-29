import express from "express"
import cors from "cors";
import {config} from "dotenv";
import {errorHandler} from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js"

// Loading the environmental variables
config();

const app = express()

// Middlewares
app.use(express.json());
app.use(cors());

// Error Middleware
app.use(errorHandler)

// Running a server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    connectDB();
})
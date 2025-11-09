/**
 * Generate a unique borrow request code
 * Format: BR-YYYYMMDD-XXXX (e.g., BR-20251106-A3F9)
 */
export const generateRequestCode = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Generate random 4-character alphanumeric string
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomStr = "";
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `BR-${year}${month}${day}-${randomStr}`;
};

export const appAssert = (condition, message, statusCode) => {
  if (!condition) {
    const err = new Error(message);
    err.status = statusCode;
    throw err;
  }
};

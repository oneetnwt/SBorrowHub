export const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // log error for debugging

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Something went wrong",
        stack: process.env.NODE_ENV === "production" ? null : err.stack, // hide stack in prod
    });
};

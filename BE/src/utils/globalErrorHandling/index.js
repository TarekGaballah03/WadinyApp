// src/utils/globalErrorHandling/index.js
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      next(err);
    });
  };
};

export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.cause || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.MODE === "DEV" ? err.stack : undefined,
  });
};
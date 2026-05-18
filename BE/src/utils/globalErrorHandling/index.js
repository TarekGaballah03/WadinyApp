// src/utils/globalErrorHandling/index.js
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      next(err);
    });
  };
};

export const globalErrorHandler = (err, req, res, next) => {
  console.error("DEBUG [Global Error Handler] Error received:", err);

  let statusCode = 500;
  if (typeof err.cause === 'number' && err.cause >= 100 && err.cause < 600) {
    statusCode = err.cause;
  } else if (typeof err.cause === 'string') {
    const parsed = parseInt(err.cause, 10);
    if (!isNaN(parsed) && parsed >= 100 && parsed < 600) {
      statusCode = parsed;
    }
  } else if (err.status && typeof err.status === 'number' && err.status >= 100 && err.status < 600) {
    statusCode = err.status;
  } else if (err.statusCode && typeof err.statusCode === 'number' && err.statusCode >= 100 && err.statusCode < 600) {
    statusCode = err.statusCode;
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.MODE === "DEV" ? err.stack : undefined,
  });
};
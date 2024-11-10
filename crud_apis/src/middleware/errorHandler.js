export const errorHandler = (err, req, res, next) => {
  const { message = "Internal Server Error", statusCode = 500 } = err;
  console.error(`Error: ${message}`);
  return res.status(statusCode).json({
    success: false,
    // to differentiate between server and client errors
    message: err?.clientError ? message : "Server Error",
  });
};

export default errorHandler;

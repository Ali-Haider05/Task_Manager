function notFound(req, res) {
  res.status(404).json({ message: "Route not found" });
}

function errorHandler(error, req, res, next) {
  let statusCode = 500;
  let message = "Internal server error";

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    statusCode = 400;
    message = "Invalid JSON";
  } else if (error && error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
  } else if (error && error.name === "CastError") {
    statusCode = 400;
    message = "Invalid value";
  } else if (error && error.code === 11000) {
    statusCode = 400;
    message = "Duplicate value";
  } else if (error && error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  } else if (error && error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (error && error.statusCode >= 400 && error.statusCode < 500) {
    statusCode = error.statusCode;
    message = error.message || "Request failed";
  }

  res.status(statusCode).json({ message });
}

module.exports = {
  notFound,
  errorHandler,
};

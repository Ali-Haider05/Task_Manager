const jwt = require("jsonwebtoken");

const User = require("../models/User");

function createAuthError(message) {
  const error = new Error(message);
  error.statusCode = 401;
  return error;
}

async function protect(req, res, next) {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    next(createAuthError("Not authorized, token required"));
    return;
  }

  if (!process.env.JWT_SECRET) {
    next(new Error("JWT_SECRET is not configured"));
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || typeof decoded !== "object" || typeof decoded.id !== "string") {
      next(createAuthError("Not authorized, invalid token"));
      return;
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      next(createAuthError("Not authorized, user no longer exists"));
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (
      error instanceof jwt.TokenExpiredError
    ) {
      next(error);
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(error);
      return;
    }

    next(error);
  }
}

module.exports = { protect };

const jwt = require("jsonwebtoken");

const User = require("../models/User");

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
}

function createToken(userId) {
  return jwt.sign(
    { id: userId.toString() },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
}

function userResponse(user, token) {
  const response = {
    _id: user._id,
    name: user.name,
    email: user.email,
  };

  if (token) {
    response.token = token;
  }

  return response;
}

function validateCredentials({ name, email, password }, includeName = false) {
  if (
    (includeName && typeof name !== "string") ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return "Name, email, and password are required";
  }

  if (includeName && (name.trim().length < 2 || name.trim().length > 100)) {
    return "Name must be between 2 and 100 characters";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return "Please provide a valid email address";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  return null;
}

async function registerUser(req, res, next) {
  try {
    const { name, email, password } =
      req.body && typeof req.body === "object" ? req.body : {};
    const validationMessage = validateCredentials(
      { name, email, password },
      true,
    );

    if (validationMessage) {
      res.status(400).json({ message: validationMessage });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      res.status(400).json({ message: "Email is already registered" });
      return;
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    res.status(201).json(userResponse(user, createToken(user._id)));
  } catch (error) {
    if (error && error.code === 11000) {
      res.status(400).json({ message: "Email is already registered" });
      return;
    }

    if (error && error.name === "ValidationError") {
      res.status(400).json({ message: "Invalid user data" });
      return;
    }

    next(error);
  }
}

async function loginUser(req, res, next) {
  try {
    const { email, password } =
      req.body && typeof req.body === "object" ? req.body : {};
    const validationMessage = validateCredentials({ email, password });

    if (validationMessage) {
      res.status(400).json({ message: validationMessage });
      return;
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    res.status(200).json(userResponse(user, createToken(user._id)));
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
};

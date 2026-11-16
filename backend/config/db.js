const dns = require("node:dns");
const mongoose = require("mongoose");

const DEFAULT_DATABASE_NAME = "codenest_taskmanager";

function getDatabaseName(connectionString) {
  try {
    const databasePath = new URL(connectionString).pathname;
    return databasePath && databasePath !== "/" ? databasePath.slice(1) : "";
  } catch {
    return "";
  }
}

function sanitizeDiagnosticMessage(message, connectionString) {
  return String(message || "Unknown error")
    .replace(connectionString, "[redacted connection string]")
    .replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, "[redacted connection string]");
}

function logConnectionError(error, connectionString) {
  const errorName = error instanceof Error ? error.name : "UnknownError";
  const errorCode =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "none";
  const diagnosticMessage = sanitizeDiagnosticMessage(
    error instanceof Error ? error.message : error,
    connectionString,
  );

  console.error(
    `MongoDB connection failed: name=${errorName}, code=${errorCode}, message=${diagnosticMessage}`,
  );
}

function logConnectionConfiguration(connectionString, databaseName) {
  const hasValidScheme = /^mongodb(?:\+srv)?:\/\//.test(connectionString);
  const hasExpectedDatabase = databaseName === DEFAULT_DATABASE_NAME;

  console.log(`MongoDB URI format check: ${hasValidScheme ? "valid" : "invalid"}`);
  console.log(
    `MongoDB database check: ${
      hasExpectedDatabase ? DEFAULT_DATABASE_NAME : "unexpected database"
    }`,
  );
}

async function connectDB() {
  const connectionString = process.env.MONGO_URI;

  if (!connectionString) {
    throw new Error("MONGO_URI is not configured");
  }

  try {
    const configuredDatabaseName = getDatabaseName(connectionString);
    const databaseName = configuredDatabaseName || DEFAULT_DATABASE_NAME;
    const options = configuredDatabaseName
      ? {}
      : { dbName: DEFAULT_DATABASE_NAME };

    logConnectionConfiguration(connectionString, databaseName);
    if (connectionString.startsWith("mongodb+srv://")) {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    }
    await mongoose.connect(connectionString, options);
    console.log("MongoDB connected successfully");
  } catch (error) {
    logConnectionError(error, connectionString);
    throw new Error("MongoDB connection failed");
  }
}

module.exports = connectDB;

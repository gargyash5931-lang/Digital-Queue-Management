
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "digital_queue_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
});

pool.on("connect", () => {
  console.log("PostgreSQL client connected");
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err.message);
});

const testConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected successfully!");
    console.log("Database:", process.env.DB_NAME);
    return result.rows[0];
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

module.exports = pool;
module.exports.testConnection = testConnection;

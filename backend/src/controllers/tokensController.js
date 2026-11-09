const pool = require("../config/db");

// Generate a new queue token
exports.generateToken = async (req, res) => {
  const client = await pool.connect();

  try {
    const { service_id } = req.body;

    if (!service_id) {
      return res.status(400).json({
        success: false,
        message: "Please select a service"
      });
    }

    await client.query("BEGIN");

    // Check whether service exists
    const service = await client.query(
      `SELECT id, service_name
       FROM services
       WHERE id = $1 AND is_active = TRUE`,
      [service_id]
    );

    if (service.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    // Prevent duplicate token numbers during simultaneous requests
    await client.query(
      "SELECT pg_advisory_xact_lock($1::int, hashtext(CURRENT_DATE::text))",
      [Number(service_id)]
    );

    // Count today's tokens for this service
    const countResult = await client.query(
      `SELECT COUNT(*) AS total
       FROM tokens
       WHERE service_id = $1
       AND queue_date = CURRENT_DATE`,
      [service_id]
    );

    const tokenCount = Number(countResult.rows[0].total) + 1;

    const tokenNumber = "Q" + String(tokenCount).padStart(3, "0");

    const estimatedWait = (tokenCount - 1) * 5;

    // Save token in PostgreSQL
    const result = await client.query(
      `INSERT INTO tokens
       (token_number, service_id, status, queue_date,
        estimated_wait_minutes, created_at)
       VALUES ($1, $2, 'waiting', CURRENT_DATE, $3, NOW())
       RETURNING *`,
      [tokenNumber, service_id, estimatedWait]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Token generated successfully",
      token: result.rows[0]
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Token generation error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to generate token",
      error: error.message
    });

  } finally {
    client.release();
  }
};


// Get token details
exports.getToken = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM tokens WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Token not found"
      });
    }

    res.json({
      success: true,
      token: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
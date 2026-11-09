const pool = require("../config/db");

exports.getServices = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, service_name, description
             FROM services
             WHERE is_active = TRUE
             ORDER BY id ASC`
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            services: result.rows
        });

    } catch (error) {
        console.error("Get services error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch services"
        });
    }
};
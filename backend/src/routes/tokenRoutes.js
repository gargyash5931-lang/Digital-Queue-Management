const express = require("express");

const router = express.Router();

const {
  generateToken,
  getToken
} = require("../controllers/tokensController");

router.post("/", generateToken);

router.get("/:id", getToken);

module.exports = router;
const express = require("express");
const router = express.Router();

const db = require("../models/index.js");

// Create a candidate
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    // Validate the request body
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Create a new candidate in the database
    const candidate = await db.candidate.create({
      name,
    });

    res.status(201).json(candidate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;

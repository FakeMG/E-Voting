const express = require("express");
const router = express.Router();

const db = require("../models/index.js");

// Create a voter
router.post("/", async (req, res) => {
  try {
    const { name, age, email } = req.body;

    // Validate the request body
    if (!name || !age || !email) {
      return res
        .status(400)
        .json({ message: "Name, age, and email are required" });
    }

    // Create a new voter in the database
    const newVoter = await db.voter.create({ name, age, email });

    res.status(201).json(newVoter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all election that a voter id can vote
router.get("/:id/elections", async (req, res) => {
  try {
    const voterId = req.params.id;

    // Find the voter
    const voter = await db.voter.findOne({ where: { id: voterId } });
    if (!voter) {
      return res.status(404).json({ message: "Voter not found" });
    }

    // Find all elections that the voter can vote
    const elections = await db.election.findAll({
      include: [
        {
          model: db.voter,
          as: "voters", // Specify the alias for the association
          where: { id: voterId },
        },
      ],
    });

    res.json(elections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

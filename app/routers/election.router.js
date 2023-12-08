const express = require("express");
const router = express.Router();

const db = require("../models/index.js");

// Create Election
router.post("/", async (req, res) => {
  const { name, startDate, endDate, candidates, voters } = req.body;
  const newElection = {
    name,
    startDate: new Date(startDate), // Convert startDate to Date object
    endDate: new Date(endDate), // Convert endDate to Date object
    isActived:
      new Date(startDate) <= new Date() && new Date(endDate) >= new Date(),
  };

  try {
    // Check if candidates are available in the candidate table
    const existingCandidates = await db.candidate.findAll({
      id: { $in: candidates },
    });
    if (existingCandidates.length !== candidates.length) {
      return res.status(404).send("Candidates not found");
    }

    // Check if voters are available in the voter table
    const votersCheck = await db.voter.findAll({ id: { $in: voters } });
    if (votersCheck.length !== voters.length) {
      return res.status(404).send("Voters not found");
    }

    // Create a new election
    const createdElection = await db.election.create(newElection);

    // Add candidates to the electionCandidate table
    candidates.forEach((candidateId) => {
      db.electionCandidate.create({
        electionId: createdElection.id,
        candidateId: candidateId,
      });
    });

    // Add voters to the electionVoter table
    voters.forEach((voterId) => {
      db.electionVoter.create({
        electionId: createdElection.id,
        voterId: voterId,
      });
    });

    res.send({
      election: createdElection,
      candidates: existingCandidates,
      voters: votersCheck,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Close Election
router.put("/:id/close", (req, res) => {
  const electionId = req.params.id;

  db.election.update(
    {
      isActived: false,
    },
    { where: { id: electionId } }
  );
  res.send(`Election ${electionId} closed`);
});

// Get All Elections
router.get("/", async (req, res) => {
  try {
    const elections = await db.election.findAll();
    res.status(200).json(elections);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get candidates of an election
router.get("/:id/candidates", async (req, res) => {
  const electionId = req.params.id;

  try {
    const election = await db.election.findOne({
      where: { id: electionId },
      include: [
        {
          model: db.candidate,
          as: "candidates",
        },
      ],
    });
    if (!election) {
      return res.status(404).send("Election not found");
    }

    res.status(200).json(election.candidates);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get all candidates of an election and their total votes
router.get("/:id/results", async (req, res) => {
  const electionId = req.params.id;

  try {
    const election = await db.election.findOne({
      where: { id: electionId },
      include: [
        {
          model: db.candidate,
          as: "candidates",
        },
      ],
    });
    if (!election) {
      return res.status(404).send("Election not found");
    }

    const results = [];
    election.candidates.forEach((candidate) => {
      results.push({
        candidateId: candidate.id,
        candidateName: candidate.name,
        totalVotes: candidate.ElectionCandidate.votes,
      });
    });

    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const BigInt = require("big-integer");

const db = require("../models/index.js");
const ECC = require("../../ECC.js");

// Create Election
router.post("/", async (req, res) => {
  const { name, startDate, endDate, candidates, voters } = req.body;

  const a = BigInt("20");
  const b = BigInt("35");
  const p = BigInt("1278670465490779485398033124764314055598236800421");
  const order = BigInt("1278670465490779485398032008834870176885194993279");

  const P = ECC.makeGeneratePoint(p, a, b);
  const d = ECC.randomPrivateKey(order);
  const Q = ECC.multiplication(P, d, a, p);

  const numberOfCandidate = candidates.length;
  const maximumOfVote = BigInt(500);
  const Ms = ECC.generatePointForCandidates(
    numberOfCandidate,
    maximumOfVote,
    P,
    a,
    p,
    order
  );

  const newElection = {
    name,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    isActived:
      new Date(startDate) <= new Date() && new Date(endDate) >= new Date(),
    a: a.toString(),
    b: b.toString(),
    p: p.toString(),
    order: order.toString(),
    bigPx: P.x.toString(),
    bigPy: P.y.toString(),
    Qx: Q.x.toString(),
    Qy: Q.y.toString(),
    numberOfCandidate: numberOfCandidate,
    maximumOfVote: maximumOfVote,
  };

  const candidatesAfterInsertedInDB = [];

  try {
    candidates.forEach(async (candidate) => {
      // Create a new candidate in the database
      const newCandidate = await db.candidate.create({
        name: candidate.name,
      });
      candidatesAfterInsertedInDB.push(newCandidate);
    });

    // Check if voters are available in the voter table
    const votersCheck = await db.voter.findAll({ id: { $in: voters } });
    if (votersCheck.length !== voters.length) {
      return res.status(404).send("Voters not found");
    }

    // Create a new election
    const createdElection = await db.election.create(newElection);

    // Add candidates to the electionCandidate table
    candidatesAfterInsertedInDB.forEach((candidate) => {
      const index = candidatesAfterInsertedInDB.indexOf(candidate);

      db.electionCandidate.create({
        electionId: createdElection.id,
        candidateId: candidate.id,
        Mx: Ms[index].x.toString(),
        My: Ms[index].y.toString(),
      });
    });

    // Add voters to the electionVoter table
    voters.forEach((voter) => {
      db.electionVoter.create({
        electionId: createdElection.id,
        voterId: voter.id,
      });
    });

    res.send({
      election: createdElection,
      candidates: candidatesAfterInsertedInDB,
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

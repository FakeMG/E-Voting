const express = require("express");
const router = express.Router();
const BigInt = require("big-integer");

const db = require("../models/index.js");
const ECC = require("../../ECC.js");

// Create Election
router.post("/", async (req, res) => {
  const { name, startDate, endDate, candidates, voters } = req.body;

  // Set up ECC parameters
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
    d: d.toString(),
    Qx: Q.x.toString(),
    Qy: Q.y.toString(),
    numberOfCandidate: numberOfCandidate,
    maximumOfVote: maximumOfVote,
  };
  // ---------------------------------------------------------

  try {
    // Check if all voters are available in the voter table
    let missingVoters = [];
    for (const voter of voters) {
      const voterInDB = await db.voter.findOne({
        where: { id: voter.id },
      });
      if (!voterInDB) {
        missingVoters.push(voter.id);
      }
    }
    if (missingVoters.length > 0) {
      return res
        .status(404)
        .send({ message: `Voters ${missingVoters} not found` });
    }
    //------------------------------------------------------------

    // Create a new candidate in the database
    const candidatesAfterInsertedInDB = [];
    candidates.forEach(async (candidate) => {
      const newCandidate = await db.candidate.create({
        name: candidate.name,
      });
      candidatesAfterInsertedInDB.push(newCandidate);
    });
    //------------------------------------------------------------

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
      voters: voters,
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
    // Get the votes ------------------------------------------
    const electionWithVoters = await db.election.findOne({
      where: { id: electionId },
      include: [
        {
          model: db.voter,
          as: "voters",
        },
      ],
    });
    if (!electionWithVoters) {
      return res.status(404).send("Election not found");
    }
    // get all the encryptMess value of the electionVoter table
    const votes = [];
    electionWithVoters.voters.forEach((voter) => {
      if (voter.ElectionVoter.encryptMessAx === "") {
        return;
      }
      const vote = {
        encryptMess: {
          A: {
            x: BigInt(voter.ElectionVoter.Ax),
            y: BigInt(voter.ElectionVoter.Ay),
            isFinite: true,
          },
          B: {
            x: BigInt(voter.ElectionVoter.Bx),
            y: BigInt(voter.ElectionVoter.By),
            isFinite: true,
          },
        },
      };
      votes.push(vote);
    });
    if (votes.length === 0) {
      return res.status(404).send({ message: "No votes found" });
    }
    // ---------------------------------------------------------

    // Get server full key-------------------------------------
    const electionWithCandidates = await db.election.findOne({
      where: { id: electionId },
      include: [
        {
          model: db.candidate,
          as: "candidates",
        },
      ],
    });
    const Ms = [];
    electionWithCandidates.candidates.forEach((candidate) => {
      Ms.push({
        x: BigInt(candidate.ElectionCandidate.Mx),
        y: BigInt(candidate.ElectionCandidate.My),
        isFinite: true,
      });
    });

    const serverFullKey = {
      a: BigInt(electionWithCandidates.a),
      b: BigInt(electionWithCandidates.b),
      p: BigInt(electionWithCandidates.p),
      q: BigInt(electionWithCandidates.order),
      P: {
        x: BigInt(electionWithCandidates.bigPx),
        y: BigInt(electionWithCandidates.bigPy),
      },
      Q: {
        x: BigInt(electionWithCandidates.Qx),
        y: BigInt(electionWithCandidates.Qy),
        isFinite: true,
      },
      numberOfCandidate: electionWithCandidates.numberOfCandidate,
      maximumOfVote: electionWithCandidates.maximumOfVote,
      Ms: Ms,
      d: BigInt(electionWithCandidates.d),
    };
    // ---------------------------------------------------------

    res.status(200).json(ECC.openVote(votes, serverFullKey));
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;

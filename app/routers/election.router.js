const express = require("express");
const router = express.Router();
const BigInt = require("big-integer");
const bcrypt = require("bcrypt");

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
    maximumOfVote: maximumOfVote.toString(),
  };
  // ---------------------------------------------------------


  try {
    // add default voter
    for (let i = 1; i <= 50; i++) {
      voters.push({email: "user" + i.toString() + "@gmail.com"})
    }
    // Check if all voters are available in the voter table
    let missingVoters = [];
    let voterIds = [];
    for (const voter of voters) {
      const voterInDB = await db.voter.findOne({
        where: { email: voter.email },
      });
      if (!voterInDB) {
        missingVoters.push({email: voter.email});
      } else {
        voterIds.push({id: voterInDB.id})
      }
    }
    if (missingVoters.length > 0) {
      for (const voter of missingVoters) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync("1", salt);
        voter.password_hash = hash;
      }      
      const voterData = await db.voter.bulkCreate(missingVoters)
      for (let voter of voterData) {
        voterIds.push({id: voter.id})
      }
      //console.log(voterData);
    }
    //console.log(voterIds);
    // Create a new election
    const createdElection = await db.election.create(newElection);
    //console.log(createdElection)
    // Create a new candidate in the database
    const candidatesAfterInsertedInDB = [];
    for (let i = 0; i < candidates.length; i++) {
      candidates[i].electionId = createdElection.id,
      candidates[i].number = i;
      candidates[i].Mx = Ms[i].x.toString(),
      candidates[i].My = Ms[i].y.toString()
    }
    const createdCandidates = await db.candidate.bulkCreate(candidates)

    // Add voters to the electionVoter table
    voterIds.forEach((voter) => {
      db.electionVoter.create({
        electionId: createdElection.id,
        voterId: voter.id,
      });
    });

    return res.send({
      election: createdElection,
      candidates: createdCandidates,
      voters: voters,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});


// Get All Elections
router.get("/", async (req, res) => {
  try {
    const elections = await db.election.findAll();
    for (let election of elections) {
      delete election.dataValues.a;
      delete election.dataValues.b;
      delete election.dataValues.p;
      delete election.dataValues.order;
      delete election.dataValues.bigPx;
      delete election.dataValues.bigPy;
      delete election.dataValues.d;
      delete election.dataValues.Qx;
      delete election.dataValues.Qy;
      delete election.dataValues.createdAt;
      delete election.dataValues.updatedAt;
    }
    return res.status(200).json(elections);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

// Get candidates of an election
router.get("/:id", async (req, res) => {
  const electionId = req.params.id;

  try {
    const election = await db.election.findOne({where: {id: electionId}});
    if (!election) {
      return res.status(400).send("Election not found");
    }
    const candidates = await db.candidate.findAll({
      where: { electionId: electionId },
    })
    let Ms = [];
    for (let i = 0; i < candidates.length; i++) { 
      for (let j = 0; j < candidates.length; j++) {
        if (candidates[j].dataValues.number === i) {
          Ms.push({x: candidates[j].dataValues.Mx, y: candidates[j].dataValues.My, isFinite: true})
        }
      } 
    }
    let serverPublicKey = {
      a: election.dataValues.a,
      b: election.dataValues.b,
      p: election.dataValues.p,
      q: election.dataValues.order,
      P: {
        x: election.dataValues.bigPx,
        y: election.dataValues.bigPy,
        isFinite: true
      },
      Q: {
        x: election.dataValues.Qx,
        y: election.dataValues.Qy,
        isFinite: true
      },
      numberOfCandidate: election.dataValues.numberOfCandidate,
      maximumOfVote: election.dataValues.maximumOfVote,
      Ms: Ms
    }
    delete election.dataValues.a;
    delete election.dataValues.b;
    delete election.dataValues.p;
    delete election.dataValues.order;
    delete election.dataValues.bigPx;
    delete election.dataValues.bigPy;
    delete election.dataValues.d;
    delete election.dataValues.Qx;
    delete election.dataValues.Qy;
    delete election.dataValues.createdAt;
    delete election.dataValues.updatedAt;
    for (let candidate of candidates) {
      delete candidate.dataValues.number;
      delete candidate.dataValues.Mx;
      delete candidate.dataValues.My;
      delete candidate.dataValues.createdAt;
      delete candidate.dataValues.updatedAt;
      delete candidate.dataValues.numberOfVote;

    }
    return res.status(200).json({election: election, serverPublicKey: serverPublicKey, candidates: candidates});
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});


router.put("/:id/close", async (req, res) => {
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
    //console.log(electionWithVoters.dataValues.voters[4].ElectionVoter)
    // get all the encryptMess value of the electionVoter table
    const votes = [];
    electionWithVoters.dataValues.voters.forEach((voter) => {
      if (voter.ElectionVoter.dataValues.encryptMessAx === "") {
        return;
      }
      const vote = {
        encryptMess: {
          A: {
            x: BigInt(voter.ElectionVoter.dataValues.encryptMessAx),
            y: BigInt(voter.ElectionVoter.dataValues.encryptMessAy),
            isFinite: true,
          },
          B: {
            x: BigInt(voter.ElectionVoter.dataValues.encryptMessBx),
            y: BigInt(voter.ElectionVoter.dataValues.encryptMessBy),
            isFinite: true,
          },
        },
      };
      votes.push(vote);
    });
    if (votes.length === 0) {
      return res.status(404).send({ message: "No votes found" });
    }
    //---------------------------------------------------------
    
    // Get server full key-------------------------------------
    const election = await db.election.findOne({where: {id: electionId}});
    if (!election) {
      return res.status(400).send("Election not found");
    }
    const candidates = await db.candidate.findAll({
      where: { electionId: electionId },
    })
    let Ms = [];
    for (let i = 0; i < candidates.length; i++) {
      for (let j = 0; j < candidates.length; j++) {
        if (candidates[j].dataValues.number === i) {
          Ms.push({x: BigInt(candidates[j].dataValues.Mx), y: BigInt(candidates[j].dataValues.My), isFinite: true})
        }
      } 
    }

    const serverFullKey = {
      a: BigInt(election.dataValues.a),
      b: BigInt(election.dataValues.b),
      p: BigInt(election.dataValues.p),
      q: BigInt(election.dataValues.order),
      P: {
        x: BigInt(election.dataValues.bigPx),
        y: BigInt(election.dataValues.bigPy),
      },
      Q: {
        x: BigInt(election.dataValues.Qx),
        y: BigInt(election.dataValues.Qy),
        isFinite: true,
      },
      numberOfCandidate: election.dataValues.numberOfCandidate,
      maximumOfVote: BigInt(election.dataValues.maximumOfVote),
      Ms: Ms,
      d: BigInt(election.dataValues.d),
    };
    // let votess = [];
    // let vote2 = ECC.newVote(1, serverFullKey);
    // let vote3 = ECC.newVote(0, serverFullKey);
    // console.log(vote1.encryptMess.A.x.toString())
    // console.log(vote1.encryptMess.A.y.toString())
    // console.log(vote1.encryptMess.B.x.toString())
    // console.log(vote1.encryptMess.B.y.toString());
    // console.log(vote2.encryptMess.A.x.toString())
    // console.log(vote2.encryptMess.A.y.toString());
    // console.log(vote2.encryptMess.B.x.toString())
    // console.log(vote2.encryptMess.B.y.toString()); 
    // console.log(vote3.encryptMess.A.x.toString())
    // console.log(vote3.encryptMess.A.y.toString());
    // console.log(vote3.encryptMess.B.x.toString())
    // console.log(vote3.encryptMess.B.y.toString());
    // votess.push(vote1);
    // votess.push(vote2);
    // votess.push(vote3);

    // ---------------------------------------------------------
    // for (let v of votess) {
    //   console.log(v.encryptMess.A.x.toString())
    //   console.log(v.encryptMess.A.y.toString())
    //   console.log(v.encryptMess.B.x.toString())
    //   console.log(v.encryptMess.B.y.toString());
    // }
    // console.log(votes)
    // console.log(votess)

    let resultVoting = ECC.openVote(votes, serverFullKey)
    if (resultVoting === null) {
      return res.status(500).send({ message: "Unable calculate numberOfVote" }); 
    }
    for (let i = 0; i < candidates.length; i++) {
      let result = await db.candidate.update({numberOfVote: resultVoting[i]},{where: {electionId: electionId, number: i}})
      if (!result) {
        return res.status(500).send({ message: "Unable update numberOfVote" });
      }
    }
    let updateElection = await db.election.update({ isActived: false}, { where: { id: electionId } })
    if (!updateElection) {
      return res.status(500).send({ message: "Unable update state of election" });
    }
    const candidatesAfterUpdate = await db.candidate.findAll({
      where: { electionId: electionId },
    })
    delete election.dataValues.a;
    delete election.dataValues.b;
    delete election.dataValues.p;
    delete election.dataValues.order;
    delete election.dataValues.bigPx;
    delete election.dataValues.bigPy;
    delete election.dataValues.d;
    delete election.dataValues.Qx;
    delete election.dataValues.Qy;
    delete election.dataValues.createdAt;
    delete election.dataValues.updatedAt;
    for (let candidate of candidatesAfterUpdate) {
      delete candidate.dataValues.number;
      delete candidate.dataValues.Mx;
      delete candidate.dataValues.My;
      delete candidate.dataValues.createdAt;
      delete candidate.dataValues.updatedAt;

    }
    return res.status(200).json({election: election, candidates: candidatesAfterUpdate });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
 
});
// Get all candidates of an election and their total votes
router.get("/:id/results", async (req, res) => {
  const electionId = req.params.id;

  try {
    const election = await db.election.findOne({where: {id: electionId}});
    if (!election) {
      return res.status(400).send("Election not found");
    }
    const candidates = await db.candidate.findAll({
      where: { electionId: electionId },
    })

    delete election.dataValues.a;
    delete election.dataValues.b;
    delete election.dataValues.p;
    delete election.dataValues.order;
    delete election.dataValues.bigPx;
    delete election.dataValues.bigPy;
    delete election.dataValues.d;
    delete election.dataValues.Qx;
    delete election.dataValues.Qy;
    delete election.dataValues.createdAt;
    delete election.dataValues.updatedAt;
    for (let candidate of candidates) {
      delete candidate.dataValues.number;
      delete candidate.dataValues.Mx;
      delete candidate.dataValues.My;
      delete candidate.dataValues.createdAt;
      delete candidate.dataValues.updatedAt;

    }
    return res.status(200).json({election: election, candidates: candidates});
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const BigInt = require("big-integer");

const db = require("../models/index.js");
const ECC = require("../../ECC.js");


router.post("/init", async (req, res) => {
  try {
    // add default voter
    let voters = [];
    for (let i = 1; i <= 50; i++) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync("1", salt);
      voters.push({email: "user" + i.toString() + "@gmail.com", password_hash: hash})
    }
    const voterData = await db.voter.bulkCreate(voters)
    return res.status(200).send("ok")
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
      
})
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate the request body
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // check if the email is already in the database
    let results = await db.voter.findAll({ where: { email: email } });
    //console.log(results)
    if (results.length > 0) {
      const validPassword = bcrypt.compareSync(
        password,
        results[0].password_hash
      );
      console.log(validPassword);
      if (!validPassword) {
        return res
          .status(400)
          .jsonp({ message: "Your email or password is incorrect" });
      }
    } else {
      return res
        .status(400)
        .jsonp({ message: "Your email or password is incorrect" });
    }

    // save user's data in session memory
    req.session.voter = {
      voterId: results[0].id,
    };

    // send session data to client
    return res.status(201).jsonp(req.session.voter);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// //route for signup
// router.post("/signup", async (req, res) => {
//   try {
//     // get user data from req.body
//     const { email, password, name, age } = req.body;

//     // Validate the request body
//     if (!name || !age || !email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Name, age, email and password are required" });
//     }

//     // check if the email is already in the database
//     let results = await db.voter.findAll({ where: { email: email } });
//     if (results.length > 0) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     // Create a new voter in the database
//     const salt = bcrypt.genSaltSync(10);
//     const hash = bcrypt.hashSync(password, salt);
//     const newVoter = await db.voter.create({
//       name,
//       age,
//       email,
//       password_hash: hash,
//     });

//     req.session.voter = {
//       id: newVoter.id,
//       name: name,
//     };

//     // send session data to client
//     res.status(200).jsonp(req.session.voter);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

router.get("/logout", (req, res) => {
  if (req.session.voter) {
    req.session.destroy();
    return res.status(200).jsonp({ message: "Logout successfully" });
  } else {
    return res.status(200).jsonp({ message: "You have not logged in" });
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
      election.dataValues.isVoted = true;
      if (election.dataValues.voters[0].ElectionVoter.encryptMessAx === "") {
        election.dataValues.isVoted = false;
      }
      delete election.dataValues.voters;
    }
    return res.json(elections);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Vote for a candidate
router.post("/vote/:electionId", async (req, res) => {
  try {
    // check if the encryptMessAx in the electionVoter table is 0
    const electionVoter = await db.electionVoter.findOne({
      where: {
        electionId: req.params.electionId,
        voterId: req.session.voter.voterId,
      },
    });
    if (electionVoter.encryptMessAx !== "") {
      return res.status(400).json({ message: "You have already voted" });
    }

    const vote = req.body;

    convertJsonToBigInt(vote);

    const electionId = req.params.electionId;
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
    
    const serverPublicKey = {
      a: BigInt(election.a),
      b: BigInt(election.b),
      p: BigInt(election.p),
      q: BigInt(election.order),
      P: {
        x: BigInt(election.bigPx),
        y: BigInt(election.bigPy),
      },
      Q: {
        x: BigInt(election.Qx),
        y: BigInt(election.Qy),
        isFinite: true,
      },
      numberOfCandidate: election.numberOfCandidate,
      maximumOfVote: election.maximumOfVote,
      Ms: Ms,
    };

    if (ECC.verifyVote(vote, serverPublicKey)) {
      // update the electionVoter table
      electionVoter.encryptMessAx = vote.encryptMess.A.x.toString();
      electionVoter.encryptMessAy = vote.encryptMess.A.y.toString();
      electionVoter.encryptMessBx = vote.encryptMess.B.x.toString();
      electionVoter.encryptMessBy = vote.encryptMess.B.y.toString();

      await electionVoter.save();
      res.status(201).json({ message: "Vote successfully" });
    } else {
      res.status(400).json({ message: "Can not verify the vote" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

function convertJsonToBigInt(json) {
  const convertToBigInteger = (value) => BigInt(value);

  const recursiveConvert = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "object") {
        recursiveConvert(obj[key]);
      } else if (typeof obj[key] === "string") {
        obj[key] = convertToBigInteger(obj[key]);
      }
    }
  };

  recursiveConvert(json);
  return json;
}

module.exports = router;

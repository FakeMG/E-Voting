import BigInt from "big-integer";
import SHA512 from "crypto-js/sha512";

function generatePrime() {
  var p;
  while (true) {
    p = BigInt.randBetween(BigInt(2).pow(90), BigInt(2).pow(91));
    if (p.isPrime(true)) {
      return p;
    }
  }
}
function legendreSymbol(a: any, p: any) {
  const ls = a.modPow(p.minus(1).divide(2), p);
  if (ls.equals(p.subtract(1))) return BigInt(-1);
  return ls;
}
function sqrtMod(a: any, p: any) {
  // Tonelli–Shanks algorithm
  if (!legendreSymbol(a, p).eq(1)) {
    return BigInt(0);
  } else if (a.equals(0)) {
    return BigInt(0);
  } else if (p.equals(2)) {
    return BigInt(0);
  } else if (p.mod(4).equals(3)) {
    return BigInt(a).modPow(p.add(1).divide(4), p);
  }

  let s = p.subtract(1);
  let e = BigInt(0);
  while (s.mod(2).equals(0)) {
    s = s.divide(2);
    e = e.add(1);
  }

  let n = BigInt(2);
  while (!legendreSymbol(n, p).eq(-1)) {
    n = n.add(1);
  }

  let x = BigInt(a).modPow(s.add(1).divide(2), p);
  let b = BigInt(a).modPow(s, p);
  let g = BigInt(n).modPow(s, p);
  let r = e;

  while (true) {
    let t = b;
    let m = BigInt(0);
    for (m; m.lesser(r); m = m.add(1)) {
      if (t.equals(1)) {
        break;
      }
      t = t.modPow(2, p);
    }

    if (m.equals(0)) {
      return x;
    }

    let gs = g.modPow(BigInt(2).pow(r.subtract(m).subtract(1)), p);
    g = gs.modPow(2, p);
    x = x.multiply(gs).mod(p);
    b = b.multiply(g).mod(p);
    r = m;
  }
}
function makeGeneratePoint(p: any, a: any, b: any) {
  var x = BigInt(0);
  while (true) {
    var squaredY = x.pow(3).add(x.multiply(a)).add(b).mod(p);
    if (legendreSymbol(squaredY, p).eq(1)) {
      return { x: x, y: sqrtMod(squaredY, p) };
    }
    x = x.add(1);
  }
}
function isOnCurve(m: any, a: any, b: any, p: any) {
  let x = m.x;
  let y = m.y;
  var result = y
    .pow(2)
    .minus(x.pow(3).add(x.multiply(a)).add(b))
    .mod(p);
  return result;
}
function addition(m: any, n: any, a: any, p: any) {
  if (m.isFinite !== undefined && m.isFinite === false) {
    return n;
  }
  if (n.isFinite !== undefined && n.isFinite === false) {
    return m;
  }

  if (n.y.eq(BigInt(0).minus(m.y))) {
    return { isFinite: false };
  }
  var phi;
  var x1 = m.x;
  var y1 = m.y;
  var x2 = n.x;
  var y2 = n.y;
  var phi_numerator;
  var phi_denominator;
  //console.log(m);
  if (x1.eq(x2) && y1.eq(y2)) {
    phi_numerator = x1.pow(2).multiply(3).add(a);
    phi_denominator = y1.multiply(2);
  } else {
    phi_numerator = y2.minus(y1);
    phi_denominator = x2.minus(x1);
  }
  if (phi_denominator.eq(0)) {
    console.log("finite roi");
    return { isFinite: false };
  }
  phi = phi_denominator.modInv(p).multiply(phi_numerator).mod(p);
  if (phi.lt(0)) {
    phi = p.add(phi);
  }

  var x3 = phi.pow(2).minus(x1).minus(x2).mod(p);
  var y3 = phi.multiply(x1.minus(x3)).minus(y1).mod(p);
  if (x3 < 0) {
    x3 = p.add(x3);
  }
  if (y3 < 0) {
    y3 = p.add(y3);
  }
  //console.log("x3: " + x3.toString() + ", y3: " + y3.toString())
  return { x: x3, y: y3, isFinite: true };
}
function multiplication(m: any, d: any, a: any, p: any) {
  if (d.eq(0)) {
    return { x: BigInt(0), y: BigInt(0), isFinite: false };
  }
  var dBinary = d.toString(2);
  //console.log(dBinary);
  var multi = m;
  for (let i = 1; i < dBinary.length; i++) {
    multi = addition(multi, multi, a, p);
    if (!multi.isFinite) {
      console.log("finite roi");
      return { isFinite: false };
    }
    if (dBinary[i] === "1") {
      multi = addition(multi, m, a, p);
      if (!multi.isFinite) {
        console.log("finite roi");
        return { isFinite: false };
      }
    }
  }
  //console.log("xn: " + multi.x.toString() + ", yn: " + multi.y.toString())

  return { x: multi.x, y: multi.y, isFinite: true };
}
function opposite(m: any) {
  if (m.isFinite !== undefined && m.isFinite === false) {
    return m;
  }
  return { x: m.x, y: BigInt(0).minus(m.y) };
}
function generatePointForCandidates(
  numberOfCandidate: any,
  maximumOfVote: any,
  P: any,
  a: any,
  p: any,
  order: any
) {
  let Ms = [];
  for (let i = 0; i < numberOfCandidate; i++) {
    let Mi = multiplication(P, maximumOfVote.add(1).modPow(i, order), a, p);
    if (!Mi.isFinite) {
      console.log("khong on roi");
    }
    Ms.push(Mi);
  }
  return Ms;
}
function randomPrivateKey(order: any) {
  return BigInt.randBetween(BigInt(1), order);
}
function getRandomRelativePrimeValue(q: any) {
  while (true) {
    let rand = BigInt.randBetween(BigInt(1), BigInt(999));
    if (BigInt.gcd(rand, q).eq(1)) {
      return rand;
    }
  }
}
function getRandomRelativePrimeValueForS(q: any) {
  while (true) {
    let rand = BigInt.randBetween(BigInt(1), q.minus(1));
    if (BigInt.gcd(rand, q).eq(1)) {
      return rand;
    }
  }
}
function generateRSAKey() {
  let p = generatePrime();
  let q = generatePrime();
  let n = p.multiply(q);
  let phi = p.minus(1).multiply(q.minus(1));
  while (true) {
    let e = BigInt.randBetween(BigInt(1), p.multiply(q).minus(1));
    if (BigInt.gcd(phi, e).eq(1)) {
      let d = e.modInv(phi);
      return { pSign: p, qSign: q, nSign: n, phi: phi, eSign: e, dSign: d };
    }
  }
}
function signed(x: any, d: any, n: any) {
  return x.modPow(d, n);
}
function hash(A: any, B: any, p: any) {
  let newArr = A.concat(B);
  const hash = SHA512(JSON.stringify(newArr));
  let hashInt = BigInt(hash.toString(), 16);
  return hashInt.mod(BigInt(2).pow(50));
}
function prover(candidate: any, r: any, Cp: any, serverPublicKey: any) {
  let Ap = Cp.A;
  let Bp = Cp.B;
  let { a, b, p, q, P, Q, Ms } = serverPublicKey;

  //console.log(multiplication(P, r, a, p))
  //console.log(Ap)
  let w = [];
  let u = [];
  let A = [];
  let B = [];
  let s = getRandomRelativePrimeValueForS(q);
  let sumU = BigInt(0);
  let sumU2 = BigInt(0);
  for (let i = 0; i < Ms.length; i++) {
    if (i !== candidate) {
      w.push(getRandomRelativePrimeValue(q));
      u.push(getRandomRelativePrimeValue(q));
      sumU2 = sumU2.add(u[i]);
    } else {
      w.push(BigInt(0));
      u.push(BigInt(0));
    }
    sumU = sumU.add(u[i]);
  }
  for (let k = 0; k < Ms.length; k++) {
    if (k !== candidate) {
      A.push(
        addition(
          multiplication(P, w[k], a, p),
          multiplication(Ap, u[k], a, p),
          a,
          p
        )
      );
      B.push(
        addition(
          multiplication(Q, w[k], a, p),
          multiplication(addition(Bp, opposite(Ms[k]), a, p), u[k], a, p),
          a,
          p
        )
      );
    } else {
      A.push(multiplication(P, s, a, p));
      B.push(multiplication(Q, s, a, p));
    }
  }

  let chall = hash(A, B, p);
  u[candidate] = chall.minus(sumU);
  w[candidate] = s.minus(u[candidate].multiply(r));
  return { A: A, B: B, u: u, w: w };
}
export function newVote(candidate: any, serverPublicKey: any) {
  const { nSign, eSign, dSign } = generateRSAKey();
  const signPublicKey = { e: eSign.toString(), n: nSign.toString() };
  const Mcp = serverPublicKey.Ms[candidate];
  const a = serverPublicKey.a;
  const p = serverPublicKey.p;
  const r = getRandomRelativePrimeValue(serverPublicKey.q);
  const Cp = {
    A: multiplication(serverPublicKey.P, r, a, p),
    B: addition(Mcp, multiplication(serverPublicKey.Q, r, a, p), a, p),
  };
  //console.log(Cp)
  const CpSign = {
    A: {
      x: signed(Cp.A.x, dSign, nSign).toString(),
      y: signed(Cp.A.y, dSign, nSign).toString(),
    },
    B: {
      x: signed(Cp.B.x, dSign, nSign).toString(),
      y: signed(Cp.B.y, dSign, nSign).toString(),
    },
  };
  const prove = prover(candidate, r, Cp, serverPublicKey);
  return {
    encryptMess: {
      A: {
        x: Cp.A.x.toString(),
        y: Cp.A.y.toString(),
        isFinite: Cp.A.isFinite,
      },
      B: {
        x: Cp.B.x.toString(),
        y: Cp.B.y.toString(),
        isFinite: Cp.B.isFinite,
      },
    },
    sign: CpSign,
    signPublicKey: signPublicKey,
    prover: {
      A: prove.A.map((item) => ({
        x: item.x.toString(),
        y: item.y.toString(),
        isFinite: item.isFinite,
      })),
      B: prove.B.map((item) => ({
        x: item.x.toString(),
        y: item.y.toString(),
        isFinite: item.isFinite,
      })),
      u: prove.u.map((item) => item.toString()),
      w: prove.w.map((item) => item.toString()),
    },
  };
}

function verifySign(encryptMess: any, sign: any, signPublicKey: any) {
  let { e, n } = signPublicKey;
  return sign.modPow(e, n).eq(encryptMess);
}

function verifyProve(vote: any, serverPublicKey: any) {
  let { encryptMess, sign, signPublicKey, prover } = vote;
  let { a, b, p, q, P, Q, Ms, numberOfCandidate } = serverPublicKey;
  let { A, B, u, w } = prover;
  let Ap = encryptMess.A;
  let Bp = encryptMess.B;
  if (
    A.length !== numberOfCandidate ||
    B.length !== numberOfCandidate ||
    u.length !== numberOfCandidate ||
    w.length !== numberOfCandidate
  ) {
    return false;
  }
  for (let k = 0; k < numberOfCandidate; k++) {
    let Ak = addition(
      multiplication(P, w[k], a, p),
      multiplication(Ap, u[k], a, p),
      a,
      p
    );
    let Bk = addition(
      multiplication(Q, w[k], a, p),
      multiplication(addition(Bp, opposite(Ms[k]), a, p), u[k], a, p),
      a,
      p
    );
    if (!A[k].x.eq(Ak.x) || !A[k].y.eq(Ak.y)) {
      return false;
    }
    if (!B[k].x.eq(Bk.x) || !B[k].y.eq(Bk.y)) {
      return false;
    }
  }
  let sumU = BigInt(0);
  for (let i = 0; i < u.length; i++) {
    sumU = sumU.add(u[i]);
  }
  let chall = hash(A, B, p);
  if (!chall.eq(sumU)) {
    return false;
  }
  return true;
}
function verifyVote(vote: any, serverPublicKey: any) {
  return true;
  let { encryptMess, sign, signPublicKey, prover } = vote;
  if (
    !verifySign(encryptMess.A.x, sign.A.x, signPublicKey) ||
    !verifySign(encryptMess.A.y, sign.A.y, signPublicKey) ||
    !verifySign(encryptMess.B.x, sign.B.x, signPublicKey) ||
    !verifySign(encryptMess.B.y, sign.B.y, signPublicKey)
  ) {
    console.log("khong on roi");
    return false;
  }
  if (!verifyProve(vote, serverPublicKey)) {
    console.log("khong on roi");
    return false;
  }
  return true;
}
function generateTuple(sum: any, n: any): any {
  if (n === 1) {
    return Array.from({ length: sum + 1 }, (_, i) => [i]);
  }

  let ans = [];
  for (let i = 0; i <= sum; i++) {
    let subList = generateTuple(sum - i, n - 1);
    for (let j of subList) {
      ans.push(j.concat(i));
    }
  }
  return ans;
}
// function solve(decryptS:any, Ms:any, votes:any, serverFullKey:any) {
//   let { a, b, p, q, P, Q, numberOfCandidate } = serverFullKey;
//   let n = votes.length;
//   let mid = Ms.length / 2;
//   let left = generateTuple(n, mid);
//   let right = generateTuple(n, Ms.length - mid);
//   let data = [];
//   for (let i = 0; i <= n; i++) {
//     data.push(new Map());
//   }
//   for (let tuple of left) {
//     let curSum = 0;
//     let pt = { x: BigInt(0), y: BigInt(0), isFinite: false };
//     for (let i = 0; i < tuple.length; i++) {
//       curSum += tuple[i];
//       if (tuple[i] !== 0) {
//         pt = addition(pt, multiplication(Ms[i], BigInt(tuple[i]), a, p), a, p);
//       }
//     }
//     data[curSum].set(pt, tuple);
//   }

//   //console.log(data)
//   for (let tuple of right) {
//     let curSum = 0;
//     let pt = { x: BigInt(0), y: BigInt(0), isFinite: false };
//     for (let i = 0; i < tuple.length; i++) {
//       curSum += tuple[i];
//       if (tuple[i] !== 0) {
//         pt = addition(
//           pt,
//           multiplication(Ms[i + mid], BigInt(tuple[i]), a, p),
//           a,
//           p
//         );
//       }
//     }
//     let target = addition(decryptS, opposite(pt), a, p);
//     //console.log(target.x.toString() + " : " + target.y.toString())
//     //console.log("target: " + target.x.toString() + " " + target.y.toString())
//     //console.log(n - curSum)
//     //console.log(curSum);
//     for (const key of data[n - curSum].keys()) {
//       //console.log("key: " + key.x.toString() + " " + key.y.toString())
//       if (target.x.eq(key.x) && target.y.eq(key.y)) {
//         return data[n - curSum].get(key).concat(tuple);
//       }
//     }
//   }
//   return null;
// }

// function openVote(votes, serverFullKey) {
//   let { a, b, p, q, P, Q, Ms, numberOfCandidate, d } = serverFullKey;
//   let sumA = votes[0].encryptMess.A;
//   let sumB = votes[0].encryptMess.B;
//   for (let i = 1; i < votes.length; i++) {
//     sumA = addition(sumA, votes[i].encryptMess.A, a, p);
//     sumB = addition(sumB, votes[i].encryptMess.B, a, p);
//   }
//   let decryptS = addition(sumB, opposite(multiplication(sumA, d, a, p)), a, p);
//   let result = solve(decryptS, Ms, votes, serverFullKey);
//   return result;
// }

// set up (lưu vào db election)
// const a = BigInt("20");
// const b = BigInt("35");
// const p = BigInt("1278670465490779485398033124764314055598236800421");
// const order = BigInt("1278670465490779485398032008834870176885194993279");
// // tinh toan
// const P = makeGeneratePoint(p, a, b);
// const d = randomPrivateKey(order);
// const Q = multiplication(P, d, a, p);

// // them cot vao db election
// const numberOfCandidate = 10;

// // random
// const maximumOfVote = BigInt(500);

// // moi candidate co 1 diem tren elliptic curve
// // luu vao db electionCandidate
// const Ms = generatePointForCandidates(
//   numberOfCandidate,
//   maximumOfVote,
//   P,
//   a,
//   p,
//   order
// );

// // luu vao election
// const serverPublicKey = {
//   a: a,
//   b: b,
//   p: p,
//   q: order,
//   P: P,
//   Q: Q,
//   numberOfCandidate: numberOfCandidate,
//   maximumOfVote: maximumOfVote,
//   Ms: Ms,
// };

// let votes = [];

// const serverFullKey = {
//   a: a,
//   b: b,
//   p: p,
//   q: order,
//   P: P,
//   Q: Q,
//   numberOfCandidate: numberOfCandidate,
//   maximumOfVote: maximumOfVote,
//   Ms: Ms,
//   d: d,
// };

// // Voting

// // voter choice
// // fe se gui vote cho server
// // moi voter se co 1 vote
// // them toa do A va B cua encryptMess cua vote vao db electionVoter sau khi verify
// let vote1 = newVote(1, serverPublicKey);
// let vote2 = newVote(1, serverPublicKey);
// let vote3 = newVote(2, serverPublicKey);
// let vote4 = newVote(3, serverPublicKey);
// let vote5 = newVote(8, serverPublicKey);
// if (verifyVote(vote1, serverPublicKey)) {
//   votes.push(vote1);
// }
// if (verifyVote(vote2, serverPublicKey)) {
//   votes.push(vote2);
// }
// if (verifyVote(vote3, serverPublicKey)) {
//   votes.push(vote3);
// }
// if (verifyVote(vote4, serverPublicKey)) {
//   votes.push(vote4);
// }
// if (verifyVote(vote5, serverPublicKey)) {
//   votes.push(vote5);
// }

// khi dong election, tinh toan ket qua
// console.log(openVote(votes, serverFullKey));

export const publicKey = {
  a: BigInt("20"),
  b: BigInt("35"),
  p: BigInt("1278670465490779485398033124764314055598236800421"),
  q: BigInt("1278670465490779485398032008834870176885194993279"),
  P: {
    x: BigInt("0"),
    y: BigInt("686164991754760867850712268107156272985293539900"),
    isFinite: true,
  },
  Q: {
    x: BigInt("688372922990773800668371266581136116970095747906"),
    y: BigInt("885575684638257948043640891550512905986000013522"),
    isFinite: true,
  },
  numberOfCandidate: 2,
  maximumOfVote: BigInt("500"),
  Ms: [
    {
      x: BigInt("0"),
      y: BigInt("686164991754760867850712268107156272985293539900"),
      isFinite: true,
    },
    {
      x: BigInt("1249561770988439132065417455273105432976906099368"),
      y: BigInt("56713485090420755095246749497788148461383743748"),
      isFinite: true,
    },
  ],
};

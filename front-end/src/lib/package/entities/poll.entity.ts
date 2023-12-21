export interface Poll {
  id: string;
  name: string;
  candidates: Candidate[];
  voters: string[];
  status: "open" | "closed";
  endTime: Date;
  createdAt: Date;
  startDate?: Date;
  endDate?: Date;
  isActived?: boolean;
  isVoted: boolean;
  numberOfCandidate: number;
}

export interface Election {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActived: boolean;
  numberOfCandidate: number;
  maximumOfVote: any;
  isVoted: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  electionID?: any;
  number?: number;
}

export interface CandidateWithResult extends Candidate {
  numberOfVote: number;
}

export interface BallotFullResult {
  election?: Election;
  candidates: CandidateWithResult[];
}

export interface BallotInfo {
  election: Election;
  serverPublicKey?: any;
  candidates: Candidate[];
}

import { Candidate } from "@/lib/package/entities/poll.entity";
import { useState } from "react";

export default function useCreatePollPage() {
  const [tabIndex, setTabIndex] = useState(0);
  const [pollName, setPollName] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voters, setVoters] = useState<string[]>([]);
  const [votingTime, setVotingTime] = useState(30);

  return {
    tabIndex,
    pollName,
    candidates,
    voters,
    votingTime,
    setCandidates,
    setPollName,
    setTabIndex,
    setVoters,
    setVotingTime,
  };
}

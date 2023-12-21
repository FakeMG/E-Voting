import { Candidate } from "@/lib/package/entities/poll.entity";
import { useState } from "react";

export default function useUserVote() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate>();

  return { selectedCandidate, setSelectedCandidate };
}

import { shortId } from "@/lib/common/helper";
import { Candidate } from "@/lib/package/entities/poll.entity";

type CandidatesHookProps = {
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
};

export default function useCandidates(props: CandidatesHookProps) {
  const { candidates, setCandidates } = props;

  const addCandidate = (name: string) => {
    setCandidates([...candidates, { id: shortId(), name }]);
  };

  const handleInputChange = (index: number, value: string) => {
    const newCandidates = candidates;
    newCandidates[index].name = value;

    setCandidates([...newCandidates]);
  };

  return { addCandidate, handleInputChange };
}

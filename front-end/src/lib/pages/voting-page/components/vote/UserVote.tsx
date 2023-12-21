import { Candidate } from "@/lib/package/entities/poll.entity";
import AppButton from "@/lib/package/global-components/AppButton";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import BallotItem from "./components/ballot-item/BallotItem";
import useUserVote from "./hooks/UserVote.hook";

type UserVoteProps = {
  pollId: string;
  candidates: Candidate[];
  publicKey: any;
};

export default function UserVote(props: UserVoteProps) {
  const { pollId, candidates, publicKey } = props;
  const { selectedCandidate, setSelectedCandidate } = useUserVote();
  const router = useRouter();

  const handleVote = async () => {
    try {
      console.log(selectedCandidate);
      await fetch(`/api/vote/${pollId}`, {
        method: "POST",
        body: JSON.stringify({
          candidateNumber: selectedCandidate?.number,
          publicKey,
        }),
      });
      await toast.success("Submit successfully!");
      router.push("/voter-dashboard");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="px-8">
        {candidates.map((candidate) => {
          return (
            <BallotItem
              key={candidate.id}
              candidate={candidate}
              isSelected={
                selectedCandidate
                  ? selectedCandidate.id === candidate.id
                  : false
              }
              onClick={() => {
                setSelectedCandidate(candidate);
              }}
            />
          );
        })}
      </div>

      <div className="fixed flex justify-between items-center w-full h-20 border-gray-200 border-t-[1px] bottom-0 px-8">
        <div>
          <div className="">
            Selected:{" "}
            <span className="text-xl text-gray-700 font-semibold">
              {selectedCandidate ? selectedCandidate.name : ""}
            </span>
          </div>
        </div>
        <AppButton title="Submit" handler={handleVote} />
      </div>
    </div>
  );
}

import { Candidate } from "@/lib/package/entities/poll.entity";
import { CheckCircleOutline, NotInterested } from "@mui/icons-material";

type BallotItemProps = {
  candidate: Candidate;
  isSelected: boolean;
  onClick: () => void;
};

export default function BallotItem(props: BallotItemProps) {
  const { candidate, isSelected, onClick } = props;

  return (
    <div
      className="w-full bg-white rounded-md my-4 py-3 px-4 flex justify-between items-center border-1 border-gray-200
    drop-shadow-md hover:drop-shadow-xl scale-95 hover:scale-100 ease-in duration-100 "
      onClick={onClick}
    >
      <div className="text-lg text-gray-700">{candidate.name}</div>
      <div className="">
        {isSelected ? (
          <CheckCircleOutline sx={{ color: "green" }} />
        ) : (
          <NotInterested sx={{ color: "red" }} />
        )}
      </div>
    </div>
  );
}

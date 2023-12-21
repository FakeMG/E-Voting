import { Poll } from "@/lib/package/entities/poll.entity";
import AppButton from "@/lib/package/global-components/AppButton";
import useVoterPollCard from "./hooks/VoterPollCard.hook";

type PollCardProps = {
  poll: Poll;
};

export default function VoterPollCard(props: PollCardProps) {
  const { poll } = props;
  const { onButtonClicked } = useVoterPollCard({ poll });

  return (
    <div
      className="w-full sm:w-1/2 md:w-1/4 lg:w-1/4 xl:w-1/4 px-4 mb-4
        drop-shadow-md rounded-md
        hover:drop-shadow-xl"
    >
      <div className="bg-white p-4 h-full flex flex-col justify-between rounded-md">
        <p className="text-lg font-semibold text-gray-800">
          {poll.name.length > 24 ? poll.name.slice(0, 21) + "..." : poll.name}
        </p>

        <div className="w-full h-full my-4">
          <div className="text-sm flex justify-between mr-4">
            <div>
              status:&nbsp;
              <span
                className={`font-semibold border-2 ${
                  poll.isActived && poll.isActived
                    ? "border-blue-600"
                    : "border-yellow-600"
                } py-0.5 px-1 rounded-md`}
              >
                {poll.isActived ? "Open" : "Closed"}
              </span>{" "}
            </div>

            {/* <div>
              voters:{" "}
              <span className="font-semibold">{poll.voters.length}</span>
            </div>

            <div>
              Ballots:{" "}
              <span className="font-semibold">{poll.ballots.length}</span>
            </div> */}
          </div>

          <div className="pt-5">
            <div className="text-sm  mr-4">
              <div>
                <span className="font-semibold">Start:&nbsp;</span>
                <span className="">
                  {poll.startDate && new Date(poll.startDate).toLocaleString()}
                </span>
              </div>

              <div className="mt-1">
                <span className="font-semibold">End:&nbsp;</span>
                <span className="">
                  {poll.endDate && new Date(poll.endDate).toLocaleString()}
                </span>
              </div>

              <div className="mt-1">
                <span className="font-semibold">Candidates:&nbsp;</span>
                <span className="">
                  {poll.numberOfCandidate && poll.numberOfCandidate}
                </span>
              </div>

              {/* <div className="mt-2">
                <span className="font-semibold">Created At:&nbsp;</span>
                <span className="">
                  {new Date(poll.createdAt).toLocaleString()}
                </span>
              </div> */}
            </div>
          </div>
        </div>

        <div className="h-18 ">
          <AppButton
            title={
              poll.isActived && poll.isActived ? "Start Vote" : "View Results"
            }
            handler={onButtonClicked}
          />
        </div>
      </div>
    </div>
  );
}

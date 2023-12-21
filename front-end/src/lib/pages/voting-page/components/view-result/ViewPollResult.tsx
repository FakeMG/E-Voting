import { BallotFullResult } from "@/lib/package/entities/poll.entity";
import { BarChart } from "@mui/x-charts";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ViewPollResultProps = {
  pollId: string;
  pollName: string;
};

export default function ViewPollResult(props: ViewPollResultProps) {
  const { pollName, pollId } = props;
  const [loading, setLoading] = useState(false);
  const [ pollResult, setPollResult] = useState<BallotFullResult>();
  const router = useRouter();

  useEffect(() => {
    getPollResult()
  }, [])

  const getPollResult = async () => {
    try {
      setLoading(true);
      const voter = localStorage.getItem("voter");
      if (!voter) router.push("/login");
      else {
        await fetch(`/api/election-result/${pollId}`)
          .then((res) => res.json())
          .then((res) => {
            console.log(res);
            setPollResult(res);
            setLoading(false);
          });
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {
        loading ? <p>Loading...</p> :
        <div className="w-full h-full">
          <div className="w-full h-full px-24">
            { pollResult &&
              <BarChart
                xAxis={[
                  {
                    id: "barCategories",
                    data: pollResult.candidates.map((ballot) => {
                      return ballot.name;
                    }),
                    scaleType: "band",
                  },
                ]}
                series={[
                  {
                    data: pollResult.candidates.map((ballot) => {
                      return ballot.numberOfVote;
                    }),
                  },
                ]}
                height={700}
              />
            }
            <div className="text-center text-2xl">{pollName} votes result</div>
          </div>
        </div>
      }
    </>
  );
}

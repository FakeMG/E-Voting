import { Poll } from "@/lib/package/entities/poll.entity";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import VoterPollCard from "./components/voter-poll-card/VoterPollCard";

export default function VoterPollList() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    getElections();
  }, []);

  const getElections = async () => {
    try {
      setLoading(true);
      const voter = localStorage.getItem("voter");
      if (!voter) router.push("/login");
      else {
        const voterInfo = JSON.parse(voter);
        await fetch(`/api/election/${voterInfo.voterId}`)
          .then((res) => res.json())
          .then((res) => {
            setPolls(res);
            setLoading(false);
          });
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <div className="w-full h-full">
            <div className="flex flex-wrap mx-4 mt-6">
              {polls &&
                polls.map((poll: any) => {
                  return <VoterPollCard poll={poll} key={poll.id} />;
                })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

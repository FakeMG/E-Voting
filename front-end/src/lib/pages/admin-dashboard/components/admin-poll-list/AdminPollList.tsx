import { Poll } from "@/lib/package/entities/poll.entity";
import { useEffect, useState } from "react";
import AdminPollCard from "./components/admin-poll-card/AdminPollCard";

export default function AdminPollList() {
  const [polls, setPolls] = useState<Poll[]>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getElections();
  }, []);

  const getElections = async () => {
    try {
      setLoading(true);
      await fetch("/api/admin-election")
        .then((res) => res.json())
        .then((res) => {
          setPolls(res);
          setLoading(false);
        });
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="w-full h-full">
          <div className="flex flex-wrap mx-4 mt-6">
            {polls &&
              polls.map((poll) => {
                return <AdminPollCard poll={poll} key={poll.id} />;
              })}
          </div>
        </div>
      )}
    </>
  );
}

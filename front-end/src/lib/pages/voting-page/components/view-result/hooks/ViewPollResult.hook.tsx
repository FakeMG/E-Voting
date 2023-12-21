import { CandidateWithResult } from "@/lib/package/entities/poll.entity";
import { useEffect, useState } from "react";

export default function useViewPollResult(pollResult: CandidateWithResult[]) {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const labels = pollResult.map((ballot) => ballot.name);
    const data = pollResult.map((ballot) => ballot.numberOfVote);

    setChartData({
      labels,
      datasets: [
        {
          label: "Number of votes",
          data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",

            "rgba(255, 206, 86, 0.2)",

            "rgba(75, 192, 192, 0.2)",

            "rgba(153, 102, 255, 0.2)",

            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",

            "rgba(54, 162, 235, 1)",

            "rgba(255, 206, 86, 1)",

            "rgba(75, 192, 192, 1)",

            "rgba(153, 102, 255, 1)",

            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    });
  }, []);

  return { chartData };
}

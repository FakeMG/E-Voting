import { Candidate } from "@/lib/package/entities/poll.entity";
import { useEffect, useState } from "react";
type GeneralSettingHookProps = {
  pollName: string;
  candidates: Candidate[];
  voters: string[];
  votingTime: number;
};

export default function useGeneralSetting(props: GeneralSettingHookProps) {
  const { pollName, candidates, voters, votingTime } = props;

  const [tableContentParams, setTableContentParams] = useState([
    { id: "pollName", title: "Poll Name", value: pollName, afterFix: "" },
    {
      id: "candidates",
      title: "Number of Candidates",
      value: candidates,
      afterFix: "",
    },
    { id: "voters", title: "Voters", value: voters, afterFix: "" },
    {
      id: "votingTime",
      title: "Voting Time",
      value: votingTime,
      afterFix: "minutes",
    },
  ]);

  useEffect(() => {
    const newTableContent: any = [];

    Object.entries(props).forEach(([key, value]) => {
      if (key === "value" || key === "index") return;

      newTableContent.push({
        id: tableContentParams.find((item) => item.id === key)!.id,
        title: tableContentParams.find((item) => item.id === key)!.title,
        value: value,
        afterFix: tableContentParams.find((item) => item.id === key)!.afterFix,
      });
    });

    setTableContentParams(newTableContent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollName, candidates, voters, votingTime]);

  return { tableContentParams };
}

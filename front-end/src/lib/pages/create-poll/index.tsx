import AppButton from "@/lib/package/global-components/AppButton";
import {
  GroupRounded,
  ReceiptRounded,
  SettingsRounded,
} from "@mui/icons-material";
import { Box, Tab, Tabs } from "@mui/material";
import { useRouter } from "next/navigation";
import Candidates from "./components/candidates/Candidates";
import GeneralSetting from "./components/general/GeneralSetting";
import EligibleVoters from "./components/voters/EligibleVoter";
import useCreatePollPage from "./hooks/CreatePollPage.hook";

export default function CreatePollPage() {
  const {
    tabIndex,
    pollName,
    candidates,
    voters,
    votingTime,
    setCandidates,
    setPollName,
    setTabIndex,
    setVoters,
    setVotingTime,
  } = useCreatePollPage();

  const router = useRouter();

  const createElectionHandler = async () => {
    if (!pollName || !candidates.length) return;

    const date = new Date();
    const endDate = new Date(date.getTime() + 30 * 60 * 1000);

    const election = {
      name: pollName,
      startDate: date.toISOString(),
      endDate: endDate.toISOString(),
      candidates: candidates.map((item) => {
        return { name: item.name };
      }),
      voters: voters.map((item) => ({ email: item })),
    };

    try {
      const res = await fetch("/api/election", {
        method: "POST",
        body: JSON.stringify(election),
      });
      router.push("/admin-dashboard");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="w-full h-full bg-bg-primary">
      <div className="px-4 py-4">
        <div className="font-semibold">Voting Name:</div>
        <input
          type="text"
          className="w-full h-12 outline-none bg-bg-primary font-semibold text-xl text-gray-700"
          placeholder="Unnamed Voting..."
          onChange={(event) => {
            setPollName(event.target.value);
          }}
        />

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabIndex}
            onChange={(event, newValue) => {
              setTabIndex(newValue);
            }}
            aria-label="basic tabs example"
          >
            <Tab
              icon={<SettingsRounded />}
              iconPosition="start"
              label="General"
            />
            <Tab
              icon={<ReceiptRounded />}
              iconPosition="start"
              label="Candidates"
            />
            <Tab
              icon={<GroupRounded />}
              iconPosition="start"
              label="Eligible voters"
            />
          </Tabs>
        </Box>

        <div className="pt-4 w-full h-full">
          <GeneralSetting
            value={tabIndex}
            index={0}
            pollName={pollName}
            candidates={candidates}
            voters={voters}
            votingTime={30}
          />
          <Candidates
            value={tabIndex}
            index={1}
            candidates={candidates}
            setCandidates={setCandidates}
          />
          <EligibleVoters
            value={tabIndex}
            index={2}
            voters={voters}
            setVoters={setVoters}
          />
        </div>
      </div>
      <div className="fixed flex justify-between items-center px-4 w-full h-20 border-gray-200 border-t-[1px] bottom-0">
        <div></div>
        <AppButton
          title="Start Poll"
          handler={() => {
            createElectionHandler();
          }}
        />
      </div>
    </div>
  );
}

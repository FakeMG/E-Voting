import VoterPollList from "./components/voter-poll-list/VoterPollList";

export default function VoterDashboardPage() {
  return (
    <div className="w-full h-full">
      <div className="mx-8 text-center font-semibold text-xl text-gray-800 py-3 flex justify-between">
        <div></div>
        <div>Welcome to LVHUY</div>
        <div></div>
      </div>

      <VoterPollList />
    </div>
  );
}

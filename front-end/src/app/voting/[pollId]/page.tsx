"use client";

import VotingPage from "@/lib/pages/voting-page/VotingPage";

type VotingPageProps = {
  params: { pollId: string };
};

export default function Page({ params }: VotingPageProps) {
  return (
    <div className="w-full h-full">
      <VotingPage pollId={params.pollId} />
    </div>
  );
}

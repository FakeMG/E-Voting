import { Poll } from "@/lib/package/entities/poll.entity";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type PollCardHookProps = {
  poll: Poll;
};

export default function useVoterPollCard({ poll }: PollCardHookProps) {
  const router = useRouter();
  const onButtonClicked = () => {
    if (poll && poll.isActived === true && poll.isVoted === true) {
      toast.error("Bạn đã vote cho cuộc bầu cử này!");
    } else router.push(`voting/${poll.id}`);
  };

  return { onButtonClicked };
}

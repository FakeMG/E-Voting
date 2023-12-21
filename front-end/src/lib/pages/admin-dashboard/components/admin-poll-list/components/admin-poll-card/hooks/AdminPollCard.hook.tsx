import { Poll } from "@/lib/package/entities/poll.entity";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type PollCardHookProps = {
  poll: Poll;
};

export default function useAdminPollCard({ poll }: PollCardHookProps) {
  const router = useRouter()
  const closeElectionHandler = async (id: any) => {
    const res = await fetch(`/api/close-election/${id}`, {
          method: "PUT",
        })
        .then((res) => res.json())
        .then((res) => {
          if(res.message) {
            toast.error(res.message)
          }
          else toast.success("Đóng cuộc bầu cử thành công!")
        })
  }

  const onButtonClicked = () => {
    console.log("Button Clicked");
    if (poll.isActived) {
      try {
        closeElectionHandler(poll.id);
      } catch (err: any) {
        toast.error("Có lỗi xảy ra")
      }
    }
    else {
      router.push(`/voting/${poll.id}`)
    }
  };

  return { onButtonClicked };
}

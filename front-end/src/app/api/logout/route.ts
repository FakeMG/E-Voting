export const fetchCache = "force-no-store";
import { cookies } from "next/headers";

export const GET = async (req: Request) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/voter/logout`, {
    headers: {
      Cookie: cookies().toString(),
    },
  });
  return res;
};

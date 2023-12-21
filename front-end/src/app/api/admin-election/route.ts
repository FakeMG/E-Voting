export const fetchCache = "force-no-store";
import { cookies } from "next/headers";

export const GET = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/election`, {
    headers: {
      Cookie: cookies().toString(),
    },
  });
  return res;
};

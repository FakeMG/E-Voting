import { cookies } from "next/headers";

export const GET = async (
  req: Request,
  { params }: { params: { electionID: string } }
) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/election/${params.electionID}`,
    {
      headers: {
        Cookie: cookies().toString(),
      },
    }
  );
  return res;
};

export const fetchCache = "force-no-store";

export const GET = async (
  req: Request,
  { params }: { params: { electionID: string } }
) => {
  const electionID = params.electionID;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/election/${electionID}/results`,
    {
      method: "GET",
    }
  );
  return res;
};

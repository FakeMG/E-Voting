export const PUT = async (
  req: Request,
  { params }: { params: { electionID: string } }
) => {
  const electionID = params.electionID;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/election/${electionID}/close`,
    {
      method: "PUT",
    }
  );
  return res;
};

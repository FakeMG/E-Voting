export const fetchCache = "force-no-store";

export const GET = async (
  req: Request,
  { params }: { params: { voterId: string } }
) => {
  const voterId = params.voterId;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/voter/${voterId}/elections`
  );
  return res;
};

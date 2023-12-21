export const POST = async (req: Request) => {
  const data = await req.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/election`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res;
};

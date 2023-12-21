export const POST = async (req: Request) => {
  const data = await req.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/voter/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      email: data.email,
      password: data.password,
    }),
  });
  return res;
};

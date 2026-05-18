export default async (req: any, res: any) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString() || '{}';

  res.setHeader('content-type', 'application/json');
  res.status(200).end(
    JSON.stringify({
      ok: true,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
        JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      },
      body,
      path: req.url,
      method: req.method,
    }),
  );
};

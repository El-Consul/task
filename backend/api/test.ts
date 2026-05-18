export default async (req: any, res: any) => {
  res.status(200).json({ ok: true, message: 'hello from minimal handler' });
};

import handler from '../src/main';

export default async (req: any, res: any) => {
  try {
    await handler(req, res);
  } catch (err: any) {
    console.error('Handler error:', err?.message, err?.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err?.message || String(err),
    });
  }
};

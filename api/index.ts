import { testFunc } from '../backend/src/test-me';

export default async (req: any, res: any) => {
  res.status(200).json(testFunc());
};

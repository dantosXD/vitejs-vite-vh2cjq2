import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isAdmin) {
    throw new ApiError(403, 'Admin access required');
  }
  next();
};
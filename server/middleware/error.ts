import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        status: err.status,
      },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: 'Validation error',
        errors: err.errors,
      },
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: {
          message: 'A record with this value already exists',
        },
      });
    }
  }

  return res.status(500).json({
    error: {
      message: 'Internal server error',
    },
  });
};
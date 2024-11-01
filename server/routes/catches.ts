import { Router } from 'express';
import { prisma } from '../utils/db';
import { catchSchema } from '../utils/validation';
import { ApiError } from '../utils/errors';

export const catchesRouter = Router();

// Get all catches for the authenticated user
catchesRouter.get('/', async (req, res) => {
  const catches = await prisma.catch.findMany({
    where: {
      userId: req.user!.id,
    },
    include: {
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  res.json(catches);
});

// Get a specific catch
catchesRouter.get('/:id', async (req, res) => {
  const catch_ = await prisma.catch.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  if (!catch_) {
    throw new ApiError(404, 'Catch not found');
  }

  if (catch_.userId !== req.user!.id) {
    throw new ApiError(403, 'Not authorized');
  }

  res.json(catch_);
});

// Create a new catch
catchesRouter.post('/', async (req, res) => {
  const data = catchSchema.parse(req.body);

  const catch_ = await prisma.catch.create({
    data: {
      ...data,
      userId: req.user!.id,
    },
    include: {
      comments: true,
    },
  });

  res.status(201).json(catch_);
});

// Update a catch
catchesRouter.put('/:id', async (req, res) => {
  const data = catchSchema.parse(req.body);

  const catch_ = await prisma.catch.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!catch_) {
    throw new ApiError(404, 'Catch not found');
  }

  if (catch_.userId !== req.user!.id) {
    throw new ApiError(403, 'Not authorized');
  }

  const updatedCatch = await prisma.catch.update({
    where: {
      id: req.params.id,
    },
    data,
    include: {
      comments: true,
    },
  });

  res.json(updatedCatch);
});

// Delete a catch
catchesRouter.delete('/:id', async (req, res) => {
  const catch_ = await prisma.catch.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!catch_) {
    throw new ApiError(404, 'Catch not found');
  }

  if (catch_.userId !== req.user!.id) {
    throw new ApiError(403, 'Not authorized');
  }

  await prisma.catch.delete({
    where: {
      id: req.params.id,
    },
  });

  res.status(204).end();
});

// Add a comment to a catch
catchesRouter.post('/:id/comments', async (req, res) => {
  const { content } = req.body;

  if (!content || typeof content !== 'string') {
    throw new ApiError(400, 'Content is required');
  }

  const catch_ = await prisma.catch.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!catch_) {
    throw new ApiError(404, 'Catch not found');
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      userId: req.user!.id,
      catchId: req.params.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  res.status(201).json(comment);
});
import { Router } from 'express';
import { prisma } from '../utils/db';
import { eventSchema } from '../utils/validation';
import { ApiError } from '../utils/errors';

export const eventsRouter = Router();

// Get all events for the authenticated user
eventsRouter.get('/', async (req, res) => {
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { userId: req.user!.id },
        {
          participants: {
            some: {
              id: req.user!.id,
            },
          },
        },
      ],
    },
    include: {
      participants: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  res.json(events);
});

// Create a new event
eventsRouter.post('/', async (req, res) => {
  const data = eventSchema.parse(req.body);

  const event = await prisma.event.create({
    data: {
      ...data,
      userId: req.user!.id,
      participants: {
        connect: { id: req.user!.id },
      },
    },
    include: {
      participants: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  res.status(201).json(event);
});

// Get a specific event
eventsRouter.get('/:id', async (req, res) => {
  const event = await prisma.event.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      participants: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  const isParticipant = event.participants.some(p => p.id === req.user!.id);
  if (!isParticipant && event.userId !== req.user!.id) {
    throw new ApiError(403, 'Not authorized');
  }

  res.json(event);
});

// Update an event
eventsRouter.put('/:id', async (req, res) => {
  const data = eventSchema.parse(req.body);

  const event = await prisma.event.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  if (event.userId !== req.user!.id) {
    throw new ApiError(403, 'Not authorized');
  }

  const updatedEvent = await prisma.event.update({
    where: {
      id: req.params.id,
    },
    data,
    include: {
      participants: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  res.json(updatedEvent);
});

// Delete an event
eventsRouter.delete('/:id', async (req, res) => {
  const event = await prisma.event.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  if (event.userId !== req.user!.id) {
    throw new ApiError(403, 'Not authorized');
  }

  await prisma.event.delete({
    where: {
      id: req.params.id,
    },
  });

  res.status(204).end();
});

// Add a participant to an event
eventsRouter.post('/:id/participants', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const event = await prisma.event.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      participants: true,
    },
  });

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (event.participants.some(p => p.id === user.id)) {
    throw new ApiError(409, 'User is already a participant');
  }

  const updatedEvent = await prisma.event.update({
    where: {
      id: req.params.id,
    },
    data: {
      participants: {
        connect: { id: user.id },
      },
    },
    include: {
      participants: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  res.json(updatedEvent);
});

// Remove a participant from an event
eventsRouter.delete('/:id/participants/:userId', async (req, res) => {
  const event = await prisma.event.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  // Allow event creator to remove participants or participants to remove themselves
  if (event.userId !== req.user!.id && req.user!.id !== req.params.userId) {
    throw new ApiError(403, 'Not authorized');
  }

  const updatedEvent = await prisma.event.update({
    where: {
      id: req.params.id,
    },
    data: {
      participants: {
        disconnect: { id: req.params.userId },
      },
    },
    include: {
      participants: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  res.json(updatedEvent);
});
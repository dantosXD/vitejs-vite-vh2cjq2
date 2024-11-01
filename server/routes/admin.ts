import { Router } from 'express';
import { prisma } from '../utils/db';
import { ApiError } from '../utils/errors';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';

export const adminRouter = Router();

// Apply middleware to all admin routes
adminRouter.use(authenticateToken, requireAdmin);

// Get all users
adminRouter.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          catches: true,
          groups: true,
          comments: true,
        },
      },
    },
  });

  res.json(users);
});

// Get user details with all related data
adminRouter.get('/users/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      catches: {
        include: {
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
        },
      },
      groups: true,
      comments: {
        include: {
          catch: true,
        },
      },
      events: true,
      ownedEvents: true,
      invitations: {
        include: {
          group: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json(user);
});

// Update user (including admin status)
adminRouter.put('/users/:id', async (req, res) => {
  const { isAdmin, ...data } = req.body;

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      ...data,
      isAdmin,
    },
  });

  res.json(user);
});

// Delete user
adminRouter.delete('/users/:id', async (req, res) => {
  await prisma.user.delete({
    where: { id: req.params.id },
  });

  res.status(204).end();
});

// Get all groups with detailed information
adminRouter.get('/groups', async (req, res) => {
  const groups = await prisma.group.findMany({
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      catches: {
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
      },
      challenges: true,
      invitations: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  res.json(groups);
});

// Add user to group
adminRouter.post('/groups/:groupId/members/:userId', async (req, res) => {
  const group = await prisma.group.update({
    where: { id: req.params.groupId },
    data: {
      members: {
        connect: { id: req.params.userId },
      },
    },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  res.json(group);
});

// Remove user from group
adminRouter.delete('/groups/:groupId/members/:userId', async (req, res) => {
  const group = await prisma.group.update({
    where: { id: req.params.groupId },
    data: {
      members: {
        disconnect: { id: req.params.userId },
      },
      admins: {
        set: await prisma.group
          .findUnique({ where: { id: req.params.groupId } })
          .then((g) => g?.admins.filter((id) => id !== req.params.userId) || []),
      },
    },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  res.json(group);
});

// Get all catches with detailed information
adminRouter.get('/catches', async (req, res) => {
  const catches = await prisma.catch.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
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
      group: true,
    },
  });

  res.json(catches);
});

// Get system statistics
adminRouter.get('/statistics', async (req, res) => {
  const [
    userCount,
    groupCount,
    catchCount,
    commentCount,
    eventCount,
    challengeCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.group.count(),
    prisma.catch.count(),
    prisma.comment.count(),
    prisma.event.count(),
    prisma.challenge.count(),
  ]);

  const recentActivity = await prisma.catch.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
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

  const topUsers = await prisma.user.findMany({
    take: 10,
    include: {
      _count: {
        select: {
          catches: true,
          comments: true,
        },
      },
    },
    orderBy: {
      catches: {
        _count: 'desc',
      },
    },
  });

  res.json({
    counts: {
      users: userCount,
      groups: groupCount,
      catches: catchCount,
      comments: commentCount,
      events: eventCount,
      challenges: challengeCount,
    },
    recentActivity,
    topUsers,
  });
});

// Delete inappropriate content (catches, comments, etc.)
adminRouter.delete('/content/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  switch (type) {
    case 'catch':
      await prisma.catch.delete({ where: { id } });
      break;
    case 'comment':
      await prisma.comment.delete({ where: { id } });
      break;
    case 'group':
      await prisma.group.delete({ where: { id } });
      break;
    case 'event':
      await prisma.event.delete({ where: { id } });
      break;
    default:
      throw new ApiError(400, 'Invalid content type');
  }

  res.status(204).end();
});
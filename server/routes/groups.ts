import { Router } from 'express';
import { prisma } from '../utils/db';
import { groupSchema, invitationSchema } from '../utils/validation';
import { ApiError } from '../utils/errors';
import { addDays } from 'date-fns';

export const groupsRouter = Router();

// Get all groups for the authenticated user
groupsRouter.get('/', async (req, res) => {
  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: {
          id: req.user!.id,
        },
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
      catches: {
        include: {
          comments: true,
        },
      },
      challenges: true,
      invitations: {
        where: {
          status: 'pending',
        },
      },
    },
  });

  res.json(groups);
});

// Get pending invitations for the authenticated user
groupsRouter.get('/invitations', async (req, res) => {
  const invitations = await prisma.invitation.findMany({
    where: {
      email: req.user!.email,
      status: 'pending',
    },
    include: {
      group: {
        include: {
          members: {
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

  res.json(invitations);
});

// Create a new group
groupsRouter.post('/', async (req, res) => {
  const data = groupSchema.parse(req.body);

  const group = await prisma.group.create({
    data: {
      ...data,
      members: {
        connect: { id: req.user!.id },
      },
      admins: [req.user!.id],
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

  res.status(201).json(group);
});

// Send an invitation to join a group
groupsRouter.post('/:id/invite', async (req, res) => {
  const { email, expiresIn } = invitationSchema.parse(req.body);

  const group = await prisma.group.findUnique({
    where: { id: req.params.id },
    include: { members: true },
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  if (!group.admins.includes(req.user!.id)) {
    throw new ApiError(403, 'Not authorized');
  }

  // Check if user is already a member
  if (group.members.some(member => member.email === email)) {
    throw new ApiError(400, 'User is already a member of this group');
  }

  // Check for existing pending invitation
  const existingInvitation = await prisma.invitation.findFirst({
    where: {
      email,
      groupId: group.id,
      status: 'pending',
    },
  });

  if (existingInvitation) {
    throw new ApiError(400, 'An invitation has already been sent to this email');
  }

  const invitation = await prisma.invitation.create({
    data: {
      email,
      groupId: group.id,
      expiresAt: addDays(new Date(), expiresIn),
    },
    include: {
      group: {
        include: {
          members: {
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

  res.status(201).json(invitation);
});

// Accept a group invitation
groupsRouter.post('/invitations/:id/accept', async (req, res) => {
  const invitation = await prisma.invitation.findUnique({
    where: { id: req.params.id },
    include: { group: true },
  });

  if (!invitation) {
    throw new ApiError(404, 'Invitation not found');
  }

  if (invitation.email !== req.user!.email) {
    throw new ApiError(403, 'Not authorized');
  }

  if (invitation.status !== 'pending') {
    throw new ApiError(400, 'Invitation has already been processed');
  }

  if (new Date() > invitation.expiresAt) {
    throw new ApiError(400, 'Invitation has expired');
  }

  const updatedGroup = await prisma.$transaction(async (prisma) => {
    // Update invitation status
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { 
        status: 'accepted',
        userId: req.user!.id,
      },
    });

    // Add user to group
    return prisma.group.update({
      where: { id: invitation.groupId },
      data: {
        members: {
          connect: { id: req.user!.id },
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
  });

  res.json(updatedGroup);
});

// Decline a group invitation
groupsRouter.post('/invitations/:id/decline', async (req, res) => {
  const invitation = await prisma.invitation.findUnique({
    where: { id: req.params.id },
  });

  if (!invitation) {
    throw new ApiError(404, 'Invitation not found');
  }

  if (invitation.email !== req.user!.email) {
    throw new ApiError(403, 'Not authorized');
  }

  if (invitation.status !== 'pending') {
    throw new ApiError(400, 'Invitation has already been processed');
  }

  const updatedInvitation = await prisma.invitation.update({
    where: { id: invitation.id },
    data: { 
      status: 'declined',
      userId: req.user!.id,
    },
  });

  res.json(updatedInvitation);
});

// Get a specific group
groupsRouter.get('/:id', async (req, res) => {
  const group = await prisma.group.findUnique({
    where: {
      id: req.params.id,
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
      catches: {
        include: {
          comments: true,
        },
      },
      challenges: true,
      invitations: {
        where: {
          status: 'pending',
        },
      },
    },
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  const isMember = group.members.some(member => member.id === req.user!.id);
  if (!isMember) {
    throw new ApiError(403, 'Not authorized');
  }

  res.json(group);
});

// Update a group
groupsRouter.put('/:id', async (req, res) => {
  const data = groupSchema.parse(req.body);

  const group = await prisma.group.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      members: true,
    },
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  if (!group.admins.includes(req.user!.id)) {
    throw new ApiError(403, 'Not authorized');
  }

  const updatedGroup = await prisma.group.update({
    where: {
      id: req.params.id,
    },
    data,
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

  res.json(updatedGroup);
});

// Delete a group
groupsRouter.delete('/:id', async (req, res) => {
  const group = await prisma.group.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  if (!group.admins.includes(req.user!.id)) {
    throw new ApiError(403, 'Not authorized');
  }

  await prisma.group.delete({
    where: {
      id: req.params.id,
    },
  });

  res.status(204).end();
});

// Remove a member from a group
groupsRouter.delete('/:id/members/:userId', async (req, res) => {
  const group = await prisma.group.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      members: true,
    },
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  // Allow admins to remove members or members to remove themselves
  if (!group.admins.includes(req.user!.id) && req.user!.id !== req.params.userId) {
    throw new ApiError(403, 'Not authorized');
  }

  // Prevent removing the last admin
  if (
    group.admins.includes(req.params.userId) &&
    group.admins.length === 1
  ) {
    throw new ApiError(400, 'Cannot remove the last admin');
  }

  const updatedGroup = await prisma.group.update({
    where: {
      id: req.params.id,
    },
    data: {
      members: {
        disconnect: { id: req.params.userId },
      },
      admins: group.admins.filter(id => id !== req.params.userId),
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

  res.json(updatedGroup);
});
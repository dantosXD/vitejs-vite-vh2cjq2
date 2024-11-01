// Update the auth routes to include isAdmin in the response
import { Router } from 'express';
import { prisma } from '../utils/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginSchema, registerSchema } from '../utils/validation';
import { ApiError } from '../utils/errors';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const { name, email, password } = registerSchema.parse(req.body);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      avatar,
      isAdmin: false, // Ensure new users aren't admins by default
    },
  });

  const token = jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.isAdmin },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isAdmin: user.isAdmin,
    },
    token,
  });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, isAdmin: user.isAdmin },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isAdmin: user.isAdmin,
    },
    token,
  });
});
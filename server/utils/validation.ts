import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const catchSchema = z.object({
  species: z.string().min(1),
  weight: z.number().positive(),
  length: z.number().positive(),
  location: z.object({
    name: z.string().min(1),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
  }),
  date: z.string().datetime(),
  photos: z.array(z.string()),
  featurePhotoIndex: z.number().min(0),
  weather: z
    .object({
      temperature: z.number(),
      conditions: z.string(),
    })
    .optional(),
  notes: z.string().optional(),
  sharedWithGroups: z.array(z.string()),
});

export const groupSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

export const invitationSchema = z.object({
  email: z.string().email(),
  expiresIn: z.number().min(1).max(30).default(7), // Days until expiration
});

export const eventSchema = z.object({
  title: z.string().min(1),
  date: z.string().datetime(),
  location: z.string().min(1),
  description: z.string().optional(),
});
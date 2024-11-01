import { Permission, Role } from 'appwrite';

export const collections = {
  users: {
    name: 'users',
    permissions: {
      read: [Permission.read(Role.users())],
      write: [Permission.write(Role.user('${document.userId}'))],
    },
    attributes: [
      {
        key: 'email',
        type: 'string',
        required: true,
        size: 255,
      },
      {
        key: 'name',
        type: 'string',
        required: true,
        size: 100,
      },
      {
        key: 'avatar',
        type: 'string',
        required: false,
        size: 255,
      },
      {
        key: 'preferences',
        type: 'object',
        required: false,
      },
    ],
    indexes: [
      {
        key: 'email',
        type: 'unique',
        attributes: ['email'],
      },
    ],
  },
  catches: {
    name: 'catches',
    permissions: {
      read: [Permission.read(Role.users())],
      write: [Permission.write(Role.user('${document.userId}'))],
    },
    attributes: [
      {
        key: 'species',
        type: 'string',
        required: true,
        size: 100,
      },
      {
        key: 'weight',
        type: 'double',
        required: true,
      },
      {
        key: 'length',
        type: 'double',
        required: true,
      },
      {
        key: 'location',
        type: 'object',
        required: true,
      },
      {
        key: 'date',
        type: 'string',
        required: true,
      },
      {
        key: 'photos',
        type: 'string[]',
        required: true,
        size: 255,
      },
      {
        key: 'featurePhotoIndex',
        type: 'integer',
        required: true,
        min: 0,
      },
      {
        key: 'weather',
        type: 'object',
        required: false,
      },
      {
        key: 'userId',
        type: 'string',
        required: true,
        size: 36,
      },
      {
        key: 'groupId',
        type: 'string',
        required: false,
        size: 36,
      },
      {
        key: 'sharedWithGroups',
        type: 'string[]',
        required: true,
        size: 36,
      },
      {
        key: 'notes',
        type: 'string',
        required: false,
        size: 1000,
      },
    ],
    indexes: [
      {
        key: 'user_date',
        type: 'key',
        attributes: ['userId', 'date'],
      },
      {
        key: 'group_date',
        type: 'key',
        attributes: ['groupId', 'date'],
      },
    ],
  },
  // Add other collections with the same structure...
};
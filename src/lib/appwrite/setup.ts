import { ID, Permission, Role } from 'appwrite';
import { client } from './client';
import { databases, storage } from './services';
import { DATABASE_ID, COLLECTIONS, BUCKETS } from './config';

export async function setupAppwrite() {
  try {
    // Create database
    try {
      await databases.create(DATABASE_ID, 'FishLog Database');
      console.log('Database created successfully');
    } catch (error: any) {
      if (error.code !== 409) {
        throw error;
      }
      console.log('Database already exists');
    }

    // Create collections
    const collections = [
      {
        id: COLLECTIONS.USERS,
        name: 'Users',
        permissions: [Permission.read(Role.users())],
      },
      {
        id: COLLECTIONS.CATCHES,
        name: 'Catches',
        permissions: [Permission.read(Role.users()), Permission.write(Role.users())],
      },
      {
        id: COLLECTIONS.GROUPS,
        name: 'Groups',
        permissions: [Permission.read(Role.users()), Permission.write(Role.users())],
      },
      {
        id: COLLECTIONS.EVENTS,
        name: 'Events',
        permissions: [Permission.read(Role.users()), Permission.write(Role.users())],
      },
      {
        id: COLLECTIONS.COMMENTS,
        name: 'Comments',
        permissions: [Permission.read(Role.users()), Permission.write(Role.users())],
      },
      {
        id: COLLECTIONS.CHALLENGES,
        name: 'Challenges',
        permissions: [Permission.read(Role.users()), Permission.write(Role.users())],
      },
    ];

    for (const collection of collections) {
      try {
        await databases.createCollection(
          DATABASE_ID,
          collection.id,
          collection.name,
          collection.permissions
        );
        console.log(`Collection ${collection.id} created successfully`);
      } catch (error: any) {
        if (error.code !== 409) {
          throw error;
        }
        console.log(`Collection ${collection.id} already exists`);
      }
    }

    // Create storage buckets
    const buckets = [
      {
        id: BUCKETS.CATCH_PHOTOS,
        name: 'Catch Photos',
        permissions: [Permission.read(Role.users()), Permission.write(Role.users())],
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
        allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp'],
      },
      {
        id: BUCKETS.GROUP_AVATARS,
        name: 'Group Avatars',
        permissions: [Permission.read(Role.users()), Permission.write(Role.users())],
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp'],
      },
      {
        id: BUCKETS.USER_AVATARS,
        name: 'User Avatars',
        permissions: [Permission.read(Role.users()), Permission.write(Role.users())],
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp'],
      },
    ];

    for (const bucket of buckets) {
      try {
        await storage.createBucket(
          bucket.id,
          bucket.name,
          bucket.permissions,
          bucket.fileSizeLimit,
          bucket.allowedFileExtensions
        );
        console.log(`Bucket ${bucket.id} created successfully`);
      } catch (error: any) {
        if (error.code !== 409) {
          throw error;
        }
        console.log(`Bucket ${bucket.id} already exists`);
      }
    }

    console.log('Appwrite setup completed successfully');
  } catch (error) {
    console.error('Error setting up Appwrite:', error);
    throw error;
  }
}
import {
  Client,
  Account,
  Databases,
  Storage,
  Functions,
  Avatars,
  ID,
} from 'appwrite';

// Initialize the Appwrite client
const client = new Client();

// Set the endpoint and project ID from environment variables
client
  .setEndpoint(
    import.meta.env.VITE_APPWRITE_ENDPOINT ||
      'https://mentor-db.sustainablegrowthlabs.com/v1'
  )
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT || '6723a47b7732b1007525');

// Initialize services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);
const avatars = new Avatars(client);

// Database and collection IDs
const DATABASE_ID = 'fishlog';
const COLLECTIONS = {
  USERS: 'users',
  CATCHES: 'catches',
  GROUPS: 'groups',
  EVENTS: 'events',
  COMMENTS: 'comments',
  CHALLENGES: 'challenges',
} as const;

// Storage bucket IDs
const BUCKETS = {
  CATCH_PHOTOS: 'catch-photos',
  GROUP_AVATARS: 'group-avatars',
  USER_AVATARS: 'user-avatars',
} as const;

// Helper functions
async function uploadFile(bucketId: string, file: File) {
  try {
    const response = await storage.createFile(bucketId, ID.unique(), file);
    return response.$id;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

async function getFilePreview(bucketId: string, fileId: string) {
  try {
    return storage.getFilePreview(bucketId, fileId);
  } catch (error) {
    console.error('Error getting file preview:', error);
    throw error;
  }
}

async function deleteFile(bucketId: string, fileId: string) {
  try {
    await storage.deleteFile(bucketId, fileId);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

async function generateAvatar(name: string) {
  try {
    return avatars.getInitials(name);
  } catch (error) {
    console.error('Error generating avatar:', error);
    throw error;
  }
}

export {
  client,
  account,
  databases,
  storage,
  functions,
  avatars,
  DATABASE_ID,
  COLLECTIONS,
  BUCKETS,
  uploadFile,
  getFilePreview,
  deleteFile,
  generateAvatar,
  ID,
};

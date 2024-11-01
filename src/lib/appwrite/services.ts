import { Account, Databases, Storage, Functions, Avatars } from 'appwrite';
import { client } from './client';

// Initialize all Appwrite services with the configured client
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);
const avatars = new Avatars(client);

// Export initialized services
export {
  account,
  databases,
  storage,
  functions,
  avatars,
};
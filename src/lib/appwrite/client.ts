import { Client } from 'appwrite';
import { ENDPOINTS } from './config';

const client = new Client()
  .setEndpoint(ENDPOINTS.API)
  .setProject(ENDPOINTS.PROJECT);

export { client };
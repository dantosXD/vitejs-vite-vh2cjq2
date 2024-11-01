import { Client, Teams } from 'appwrite';
import { ENDPOINTS } from './config';

// Create a separate admin client with API key
const adminClient = new Client()
  .setEndpoint(ENDPOINTS.API)
  .setProject(ENDPOINTS.PROJECT);

if (ENDPOINTS.API_KEY) {
  adminClient.setKey(ENDPOINTS.API_KEY);
}

const teams = new Teams(adminClient);

export { adminClient, teams };
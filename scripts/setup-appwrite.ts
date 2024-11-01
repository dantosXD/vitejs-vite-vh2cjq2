import { Client } from 'appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
    try {
        console.log('Starting...');
        
        // Print environment check
        console.log('Environment variables loaded:');
        console.log('APPWRITE_ENDPOINT:', process.env.APPWRITE_ENDPOINT);
        console.log('APPWRITE_PROJECT:', process.env.APPWRITE_PROJECT);
        console.log('APPWRITE_API_KEY exists:', !!process.env.APPWRITE_API_KEY);

        // Create client
        const client = new Client();
        console.log('Client created');

        // Set endpoint
        client.setEndpoint(process.env.APPWRITE_ENDPOINT || '');
        console.log('Endpoint set');

        // Set project
        client.setProject(process.env.APPWRITE_PROJECT || '');
        console.log('Project set');

        // Set API key
        client.setKey(process.env.APPWRITE_API_KEY || '');
        console.log('API key set');

        console.log('Setup complete');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Run with basic error handling
main().catch(error => {
    console.error('Uncaught error:', error);
    process.exit(1);
});
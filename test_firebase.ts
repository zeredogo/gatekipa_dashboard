import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load .env.local manually for this standalone script BEFORE importing admin
const envConfig = dotenv.parse(fs.readFileSync('./.env.local'));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

async function testConnection() {
    console.log("Testing connection to Firestore...");
    try {
        const { adminDb } = await import('./src/lib/firebase/admin');
        const collections = await adminDb.listCollections();
        console.log("Connected successfully! Found collections:");
        collections.forEach(c => console.log("- " + c.id));
        process.exit(0);
    } catch (error) {
        console.error("Connection failed:", error);
        process.exit(1);
    }
}

testConnection();

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

// Get __dirname equivalent in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure AWS
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function uploadFiles(files) {
    const results = [];
    
    for (const file of files) {
        try {
            const uploadParams = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: file.filename,
                Body: file.data,
                ContentType: 'text/calendar'
            };

            const command = new PutObjectCommand(uploadParams);
            await s3Client.send(command);
            
            const fileUrl = `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            results.push({ filename: file.filename, url: fileUrl, success: true });
            console.log(`⬆️ ${file.filename} uploaded to S3`);
        } catch (error) {
            results.push({ 
                filename: file.filename, 
                error: error.message, 
                success: false 
            });
        }
    }

    return results;
}

// Change exports to ES module syntax
export {
    uploadFiles
};
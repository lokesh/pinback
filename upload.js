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

async function uploadFile(startYear, endYear) {
    const fileName = `calendar-${startYear}-${endYear}.ics`;

    try {
        const filePath = path.join(__dirname, fileName);
        if (!fs.existsSync(filePath)) {
            throw new Error(`File ${fileName} not found`);
        }

        const fileContent = fs.readFileSync(filePath);
        const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
            Body: fileContent,
            ContentType: 'text/calendar'
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);
        
        const fileUrl = `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
        console.log(`Successfully uploaded ${fileName} to S3:`, fileUrl);
        return fileUrl;
    } catch (error) {
        console.error(`Error uploading ${fileName}:`, error.message);
        throw error;
    }
}

async function uploadCurrentPeriodFile() {
    const currentYear = new Date().getFullYear();
    const startYear = Math.floor(currentYear / 5) * 5;
    const endYear = startYear + 4;
    return uploadFile(startYear, endYear);
}

async function uploadAllFiles() {
    const currentYear = new Date().getFullYear();
    const currentPeriodStart = Math.floor(currentYear / 5) * 5;
    const results = [];

    // Start from 20050 and go up to current period
    for (let startYear = 2000; startYear <= currentPeriodStart; startYear += 5) {
        const endYear = startYear + 4;
        const fileName = `calendar-${startYear}-${endYear}.ics`;
        const filePath = path.join(__dirname, fileName);

        // Check if file exists before attempting upload
        if (!fs.existsSync(filePath)) {
            results.push({ 
                startYear, 
                endYear, 
                error: `File ${fileName} does not exist`, 
                success: false 
            });
            continue; // Skip to next iteration
        }

        try {
            const url = await uploadFile(startYear, endYear);
            results.push({ startYear, endYear, url, success: true });
        } catch (error) {
            results.push({ 
                startYear, 
                endYear, 
                error: error.message, 
                success: false 
            });
        }
    }

    return results;
}

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
    uploadCurrentPeriodFile,
    uploadAllFiles,
    uploadFiles
};

// Update the main module check for ES modules
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    const uploadAll = args.includes('--all');

    if (uploadAll) {
        console.log('Uploading all files...');
        uploadAllFiles()
            .then(results => {
                console.log('\nUpload Summary:');
                results.forEach(result => {
                    if (result.success) {
                        console.log(`✓ ${result.startYear}-${result.endYear}: ${result.url}`);
                    } else {
                        console.log(`✗ ${result.startYear}-${result.endYear}: ${result.error}`);
                    }
                });
            })
            .catch(error => {
                console.error('Upload failed:', error);
                process.exit(1);
            });
    } else {
        uploadCurrentPeriodFile()
            .then(url => console.log('Upload complete. File available at:', url))
            .catch(error => {
                console.error('Upload failed:', error);
                process.exit(1);
            });
    }
}

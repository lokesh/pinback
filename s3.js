const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

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
            Bucket: 'checkins-calendar',
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

    // Start from 2005 and go up to current period
    for (let startYear = 2005; startYear <= currentPeriodStart; startYear += 5) {
      try {
            const endYear = startYear + 4;
            const url = await uploadFile(startYear, endYear);
            results.push({ startYear, endYear, url, success: true });
        } catch (error) {
            results.push({ startYear, endYear: startYear + 4, error: error.message, success: false });
        }
    }

    return results;
}

// Export the functions
module.exports = {
    uploadCurrentPeriodFile,
    uploadAllFiles
};

// If running directly (not imported as a module)
if (require.main === module) {
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

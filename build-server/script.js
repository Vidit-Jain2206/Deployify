require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");

const PROJECTID = process.env.projectID;

const client = new S3Client({
  region: process.env.REGION || "",
  credentials: {
    accessKeyId: process.env.ACCESSKEYID || "",
    secretAccessKey: process.env.SECRETACCESSKEY || "",
  },
});

async function uploadFileToS3(Key, file) {
  const fileContent = fs.readFileSync(file);

  const params = {
    Bucket: process.env.BUCKETNAME || "",
    Key: `${PROJECTID}/${Key}`,
    Body: fileContent,
    ContentType: mime.lookup(file),
  };

  const command = new PutObjectCommand(params);
  await client.send(command);
}

function getAllFiles(folderPath) {
  let response = [];

  const allFilesAndFolders = fs.readdirSync(folderPath);
  allFilesAndFolders.forEach((file) => {
    const fullFilePath = path.join(folderPath, file);
    if (fs.statSync(fullFilePath).isDirectory()) {
      response = response.concat(getAllFiles(fullFilePath));
    } else {
      response.push(fullFilePath);
    }
  });
  return response;
}

async function main() {
  console.log("deploying to s3");
  const buildFolderPath = path.join(__dirname, "output/build");
  const buildFiles = getAllFiles(buildFolderPath);
  const uploadedPromises = buildFiles.map((file) => {
    const objectKey = path
      .relative(path.join(__dirname, "output/build"), file)
      .replace(/\\/g, "/");
    return uploadFileToS3(objectKey, file);
  });

  await Promise.all(uploadedPromises);
  console.log("deployment to s3 complete");
}

main();

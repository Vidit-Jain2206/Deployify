#!/bin/bash

export GITHUB_REPOSITORY="${GITHUB_REPOSITORY}"


git clone ${GITHUB_REPOSITORY} /home/app/output
# Change directory to the cloned repository
cd /home/app/output

# Install dependencies
npm install

# # Build the project
npm run build

# Run the script
cd ../

npm install @aws-sdk/client-s3 dotenv mime-types

node script.js
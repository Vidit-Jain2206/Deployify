require("dotenv").config();
const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");
const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");
const app = express();
app.use(express.json());
app.use(cors());

const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const REGION = process.env.REGION;
const BUCKET_NAME = process.env.BUCKET_NAME;
const TASK_DEFINITION = process.env.TASK_DEFINITION;
const CLUSTER_DEFINITION = process.env.CLUSTER_DEFINITION;

const ecsclient = new ECSClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

async function runContainer(githubUrl, projectId) {
  try {
    console.log("container running");

    const command = new RunTaskCommand({
      taskDefinition: TASK_DEFINITION,
      cluster: CLUSTER_DEFINITION,
      launchType: "FARGATE",
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: [
            "subnet-0f49497714cce8fe9",
            "subnet-0775cfcd8b914acf1",
            "subnet-01789ff620c4168dc",
          ],
          securityGroups: ["sg-0a778da5075d00589"],
          assignPublicIp: "ENABLED",
        },
      },

      overrides: {
        containerOverrides: [
          {
            name: "vercel-build-server-container",
            environment: [
              {
                name: "ACCESS_KEY_ID",
                value: ACCESS_KEY_ID,
              },
              {
                name: "SECRET_ACCESS_KEY",
                value: SECRET_ACCESS_KEY,
              },
              {
                name: "REGION",
                value: REGION,
              },
              {
                name: "BUCKET_NAME",
                value: BUCKET_NAME,
              },
              {
                name: "PROJECT_ID",
                value: projectId,
              },
              {
                name: "GITHUB_REPOSITORY",
                value: githubUrl,
              },
            ],
          },
        ],
      },
    });
    console.log(command);
    const response = await ecsclient.send(command);
    console.log("Task started:", response);
    return response;
  } catch (error) {
    console.log(error);
    throw new Error(`Task failed: ${error.message}`);
  }
}

app.post("/deploy", async (req, res) => {
  const githubUrl = req.body.githubUrl;
  const projectId = Math.floor(Math.random() * 1000000);
  // run a container
  runContainer(githubUrl, projectId)
    .then((response) => {
      return res.status(200).json({
        projectId,
        url: `http://${projectId}.localhost:8000/index.html`,
      });
    })
    .catch((err) => {
      return res.status(500).json({ err });
    });
});
app.get("/", (req, res) => {
  res.send("Deployify Server");
});
app.listen(9000, () => {
  console.log("Server started on port 9000");
});

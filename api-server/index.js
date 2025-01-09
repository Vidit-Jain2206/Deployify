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
const SUBNETS = process.env.SUBNETS.split(",");
const SECURITY_GROUPS = process.env.SECURITY_GROUPS.split(",");
const ecsclient = new ECSClient({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

async function runContainer(githubUrl, projectId) {
  try {
    const command = new RunTaskCommand({
      taskDefinition: TASK_DEFINITION,
      cluster: CLUSTER_DEFINITION,
      launchType: "FARGATE",
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: SUBNETS,
          securityGroups: SECURITY_GROUPS,
          assignPublicIp: "ENABLED",
        },
      },

      overrides: {
        containerOverrides: [
          {
            name: "vercel-build-server",
            environment: [
              {
                name: "ACCESS_KEY_ID",
                value: String(ACCESS_KEY_ID),
              },
              {
                name: "SECRET_ACCESS_KEY",
                value: String(SECRET_ACCESS_KEY),
              },
              {
                name: "REGION",
                value: String(REGION),
              },
              {
                name: "BUCKET_NAME",
                value: String(BUCKET_NAME),
              },
              {
                name: "PROJECT_ID",
                value: String(projectId),
              },
              {
                name: "GITHUB_REPOSITORY",
                value: String(githubUrl),
              },
            ],
          },
        ],
      },
    });
    const response = await ecsclient.send(command);
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
  res.send("Deployify Api-Server");
});
app.listen(9000, () => {
  console.log("Server started on port 9000");
});

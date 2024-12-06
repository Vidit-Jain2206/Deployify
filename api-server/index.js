require("dotenv").config();
const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const ACCESSKEYID = process.env.ACCESS_KEY;
const SECRETACCESSKEY = process.env.SECRET_KEY;
const REGION = process.env.REGION;
const BUCKETNAME = process.env.BUCKET_NAME;

function runContainer(githubUrl, projectId) {
  return new Promise((resolve, reject) => {
    const child = spawn("docker", [
      "run",
      "--rm",
      "-d",
      "-e",
      `GITHUB_REPOSITORY=${githubUrl}`,
      "-e",
      `projectID=${projectId}`,
      "-e",
      `REGION=${REGION}`,
      "-e",
      `ACCESSKEYID=${ACCESSKEYID}`,
      "-e",
      `SECRETACCESSKEY=${SECRETACCESSKEY}`,
      "-e",
      `BUCKETNAME=${BUCKETNAME}`,
      "build-server-image2",
    ]);
    child.stdout?.on("data", function (data) {
      //   console.log("stdout: " + data);
    });
    child.stderr?.on("data", function (data) {
      //   console.log("stderr: " + data);
      reject(data);
    });

    child.on("close", function (code) {
      resolve("deployment complete");
    });
  });
}

app.post("/deploy", async (req, res) => {
  const githubUrl = req.body.githubUrl;
  const projectId = Math.floor(Math.random() * 1000000);
  // run a container
  runContainer(githubUrl, projectId)
    .then((response) => {
      console.log(response);
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

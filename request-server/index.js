require("dotenv").config();
const express = require("express");
const httpProxy = require("http-proxy");

const app = express();

const proxy = httpProxy.createProxy();
const BASE_URL = process.env.BASE_URL;

app.get("/", (req, res) => {
  res.send("Welcomne to web page");
});

app.use((req, res, next) => {
  const projectId = req.hostname.split(".")[0];
  // Custom Domain - DB Query
  const resolvesTo = `${BASE_URL}/${projectId}`;
  console.log(`Redirecting request from ${req.url} to ${resolvesTo}`);
  return proxy.web(req, res, { target: resolvesTo, changeOrigin: true });
});
proxy.on("proxyReq", (proxyReq, req, res) => {
  const url = req.url;
  if (url === "/") {
    proxyReq.path += "index.html";
  }
});
app.listen(8000, () => {
  console.log("Request server started on port 8000");
});

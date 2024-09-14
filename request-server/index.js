require("dotenv").config();
const express = require("express");
const httpProxy = require("http-proxy");

const app = express();

const proxy = httpProxy.createProxy();
const BASE_URL = process.env.BASE_URL;

app.use((req, res, next) => {
  const projectId = req.hostname.split(".")[0];
  // Custom Domain - DB Query
  const resolvesTo = `${BASE_URL}/${projectId}`;
  return proxy.web(req, res, { target: resolvesTo, changeOrigin: true });
});

app.listen(8000, () => {
  console.log("Request server started on port 8000");
});

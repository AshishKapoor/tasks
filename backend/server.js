const express = require("express");
const cors = require("cors");
const { requestLogger } = require("./middleware/logger");
const { MICROSERVICE_URL } = require("./utils/proxy");
const tasksRouter = require("./routes/tasks");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(requestLogger);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    service: "Task Backend",
    version: "1.0.0",
    microserviceUrl: MICROSERVICE_URL,
  });
});

app.use("/api", tasksRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Microservice URL: ${MICROSERVICE_URL}`);
});

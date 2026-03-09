const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3000;
const MICROSERVICE_URL =
  process.env.MICROSERVICE_URL || "http://0.0.0.0:3001/dev";

app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    service: "Task Backend",
    version: "1.0.0",
    microserviceUrl: MICROSERVICE_URL,
  });
});

app.post("/api/add-task", async (req, res) => {
  try {
    const response = await fetch(`${MICROSERVICE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Error creating task:", err.message);
    res.status(502).json({ error: "Microservice unavailable" });
  }
});

app.get("/api/tasks", async (_req, res) => {
  try {
    const response = await fetch(`${MICROSERVICE_URL}/tasks`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Error fetching tasks:", err.message);
    res.status(502).json({ error: "Microservice unavailable" });
  }
});

app.patch("/api/task/:id", async (req, res) => {
  try {
    const response = await fetch(
      `${MICROSERVICE_URL}/tasks/${encodeURIComponent(req.params.id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Error updating task:", err.message);
    res.status(502).json({ error: "Microservice unavailable" });
  }
});

app.delete("/api/task/:id", async (req, res) => {
  try {
    const response = await fetch(
      `${MICROSERVICE_URL}/tasks/${encodeURIComponent(req.params.id)}`,
      { method: "DELETE" }
    );
    if (response.status === 204) {
      return res.status(204).send();
    }
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Error deleting task:", err.message);
    res.status(502).json({ error: "Microservice unavailable" });
  }
});

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

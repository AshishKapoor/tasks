const express = require("express");
const serverless = require("serverless-http");
const tasksRouter = require("./routes/tasks");

function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      service: "Task Microservice",
      version: "1.0.0",
      endpoints: {
        "POST /tasks": "Create a new task",
        "GET /tasks": "List all tasks",
        "GET /tasks/:id": "Get a task by ID",
        "PATCH /tasks/:id": "Update a task status",
        "DELETE /tasks/:id": "Delete a task",
      },
    });
  });

  app.use("/tasks", tasksRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ error: "Invalid JSON" });
    }
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

const app = createApp();
const handler = serverless(app);

module.exports = { createApp, handler };

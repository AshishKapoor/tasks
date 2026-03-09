const { Router } = require("express");
const { proxyRequest, microserviceUrl } = require("../utils/proxy");

const router = Router();

router.post("/add-task", async (req, res) => {
  try {
    const { status, data } = await proxyRequest(microserviceUrl("/tasks"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    res.status(status).json(data);
  } catch (err) {
    console.error("Error creating task:", err.message);
    res.status(502).json({ error: "Microservice unavailable" });
  }
});

router.get("/tasks", async (_req, res) => {
  try {
    const { status, data } = await proxyRequest(microserviceUrl("/tasks"));
    res.status(status).json(data);
  } catch (err) {
    console.error("Error fetching tasks:", err.message);
    res.status(502).json({ error: "Microservice unavailable" });
  }
});

router.patch("/task/:id", async (req, res) => {
  try {
    const { status, data } = await proxyRequest(
      microserviceUrl(`/tasks/${encodeURIComponent(req.params.id)}`),
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      },
    );
    res.status(status).json(data);
  } catch (err) {
    console.error("Error updating task:", err.message);
    res.status(502).json({ error: "Microservice unavailable" });
  }
});

router.delete("/task/:id", async (req, res) => {
  try {
    const { status, data } = await proxyRequest(
      microserviceUrl(`/tasks/${encodeURIComponent(req.params.id)}`),
      { method: "DELETE" },
    );
    if (status === 204) {
      return res.status(204).send();
    }
    res.status(status).json(data);
  } catch (err) {
    console.error("Error deleting task:", err.message);
    res.status(502).json({ error: "Microservice unavailable" });
  }
});

module.exports = router;

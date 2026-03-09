const { Router } = require("express");
const crypto = require("crypto");
const store = require("../store");

const router = Router();

router.post("/", async (req, res) => {
  const { title, status } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res
      .status(400)
      .json({ error: "title is required and must be a non-empty string" });
  }

  const validStatuses = ["pending", "done"];
  if (status !== undefined && !validStatuses.includes(status)) {
    return res
      .status(400)
      .json({ error: 'status must be "pending" or "done"' });
  }

  const task = {
    id: crypto.randomUUID(),
    title: title.trim(),
    status: status || "pending",
    createdAt: new Date().toISOString(),
  };

  await store.create(task);
  res.status(201).json(task);
});

router.get("/", async (_req, res) => {
  res.json(await store.getAll());
});

router.get("/:id", async (req, res) => {
  const task = await store.getById(req.params.id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.json(task);
});

router.patch("/:id", async (req, res) => {
  const { status } = req.body;

  const validStatuses = ["pending", "done"];
  if (!status || !validStatuses.includes(status)) {
    return res
      .status(400)
      .json({ error: 'status must be "pending" or "done"' });
  }

  const task = await store.update(req.params.id, { status });
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.json(task);
});

router.delete("/:id", async (req, res) => {
  const deleted = await store.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.status(204).send();
});

module.exports = router;

const request = require("supertest");
const { createApp } = require("../app");
const store = require("../store");

let app;

beforeEach(() => {
  store.clear();
  app = createApp();
});

describe("POST /tasks", () => {
  it("should create a task with default pending status", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Test task" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: "Test task",
      status: "pending",
    });
    expect(res.body.id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
  });

  it("should create a task with specified status", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Done task", status: "done" });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("done");
  });

  it("should return 400 when title is missing", async () => {
    const res = await request(app).post("/tasks").send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("should return 400 when title is empty", async () => {
    const res = await request(app).post("/tasks").send({ title: "" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("should return 400 when title is not a string", async () => {
    const res = await request(app).post("/tasks").send({ title: 123 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("should return 400 for invalid status value", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Test", status: "invalid" });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("status");
  });
});

describe("GET /tasks", () => {
  it("should return empty array when no tasks exist", async () => {
    const res = await request(app).get("/tasks");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("should return all tasks", async () => {
    await request(app).post("/tasks").send({ title: "Task 1" });
    await request(app).post("/tasks").send({ title: "Task 2" });

    const res = await request(app).get("/tasks");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("GET /tasks/:id", () => {
  it("should return a task by id", async () => {
    const createRes = await request(app)
      .post("/tasks")
      .send({ title: "Find me" });

    const res = await request(app).get(`/tasks/${createRes.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Find me");
    expect(res.body.id).toBe(createRes.body.id);
  });

  it("should return 404 for non-existent task", async () => {
    const res = await request(app).get("/tasks/non-existent-id");

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

describe("PATCH /tasks/:id", () => {
  it("should update task status to done", async () => {
    const createRes = await request(app)
      .post("/tasks")
      .send({ title: "Toggle me" });

    const res = await request(app)
      .patch(`/tasks/${createRes.body.id}`)
      .send({ status: "done" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("done");
    expect(res.body.title).toBe("Toggle me");
  });

  it("should update task status back to pending", async () => {
    const createRes = await request(app)
      .post("/tasks")
      .send({ title: "Toggle back", status: "done" });

    const res = await request(app)
      .patch(`/tasks/${createRes.body.id}`)
      .send({ status: "pending" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("pending");
  });

  it("should return 400 for invalid status", async () => {
    const createRes = await request(app)
      .post("/tasks")
      .send({ title: "Bad status" });

    const res = await request(app)
      .patch(`/tasks/${createRes.body.id}`)
      .send({ status: "invalid" });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("status");
  });

  it("should return 400 when status is missing", async () => {
    const createRes = await request(app)
      .post("/tasks")
      .send({ title: "No status" });

    const res = await request(app)
      .patch(`/tasks/${createRes.body.id}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("should return 404 for non-existent task", async () => {
    const res = await request(app)
      .patch("/tasks/non-existent-id")
      .send({ status: "done" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /tasks/:id", () => {
  it("should delete an existing task", async () => {
    const createRes = await request(app)
      .post("/tasks")
      .send({ title: "Delete me" });

    const res = await request(app).delete(`/tasks/${createRes.body.id}`);
    expect(res.status).toBe(204);

    const getRes = await request(app).get(`/tasks/${createRes.body.id}`);
    expect(getRes.status).toBe(404);
  });

  it("should return 404 when deleting non-existent task", async () => {
    const res = await request(app).delete("/tasks/non-existent-id");
    expect(res.status).toBe(404);
  });
});

describe("Invalid requests", () => {
  it("should return 404 for unknown routes", async () => {
    const res = await request(app).get("/unknown");
    expect(res.status).toBe(404);
  });

  it("should return 400 for invalid JSON body", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Content-Type", "application/json")
      .send("{ invalid json }");

    expect(res.status).toBe(400);
  });
});

describe("Root endpoint", () => {
  it("should return service info", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body.service).toBe("Task Microservice");
    expect(res.body.endpoints).toBeDefined();
  });
});

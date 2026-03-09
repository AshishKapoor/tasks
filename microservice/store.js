const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "tasks.db");

let db;
let ready;

function init() {
  if (!ready) {
    ready = initSqlJs().then((SQL) => {
      let data;
      try {
        data = fs.readFileSync(DB_PATH);
      } catch {
        // file doesn't exist yet
      }
      db = data ? new SQL.Database(data) : new SQL.Database();
      db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          createdAt TEXT NOT NULL
        )
      `);
      save();
      return db;
    });
  }
  return ready;
}

function save() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

class TaskStore {
  async getAll() {
    await init();
    const stmt = db.prepare("SELECT * FROM tasks ORDER BY createdAt DESC");
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  async getById(id) {
    await init();
    const stmt = db.prepare("SELECT * FROM tasks WHERE id = ?");
    stmt.bind([id]);
    const row = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    return row;
  }

  async create(task) {
    await init();
    db.run(
      "INSERT INTO tasks (id, title, status, createdAt) VALUES (?, ?, ?, ?)",
      [task.id, task.title, task.status, task.createdAt]
    );
    save();
    return task;
  }

  async update(id, fields) {
    await init();
    db.run("UPDATE tasks SET status = ? WHERE id = ?", [fields.status, id]);
    const changes = db.getRowsModified();
    if (changes === 0) return null;
    return this.getById(id);
  }

  async delete(id) {
    await init();
    db.run("DELETE FROM tasks WHERE id = ?", [id]);
    const deleted = db.getRowsModified() > 0;
    if (deleted) save();
    return deleted;
  }

  async clear() {
    await init();
    db.run("DELETE FROM tasks");
    save();
  }
}

module.exports = new TaskStore();

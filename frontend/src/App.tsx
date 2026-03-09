import { useState, useEffect, useCallback } from "react";

interface Task {
  id: string;
  title: string;
  status: "pending" | "done";
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/tasks`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/add-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add task");
      }
      setTitle("");
      setError("");
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task");
    }
  };

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === "pending" ? "done" : "pending";
    try {
      const res = await fetch(`${API_URL}/api/task/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      setError("");
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/task/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
      setError("");
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "40px auto",
        fontFamily: "sans-serif",
        padding: "0 16px",
      }}
    >
      <h1>Task Manager</h1>

      <form
        onSubmit={addTask}
        style={{ display: "flex", gap: 8, marginBottom: 24 }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          style={{ flex: 1, padding: 8, fontSize: 14 }}
        />
        <button type="submit" style={{ padding: "8px 16px", fontSize: 14 }}>
          Add Task
        </button>
      </form>

      {error && <p style={{ color: "red", marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks yet. Add one above.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "2px solid #ccc",
                  padding: 8,
                }}
              >
                Title
              </th>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "2px solid #ccc",
                  padding: 8,
                }}
              >
                Status
              </th>
              <th
                style={{
                  textAlign: "left",
                  borderBottom: "2px solid #ccc",
                  padding: 8,
                }}
              >
                Created
              </th>
              <th style={{ borderBottom: "2px solid #ccc", padding: 8 }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                  {task.title}
                </td>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                  {task.status}
                </td>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                  {new Date(task.createdAt).toLocaleString()}
                </td>
                <td
                  style={{
                    padding: 8,
                    borderBottom: "1px solid #eee",
                    textAlign: "center",
                  }}
                >
                  <button
                    onClick={() => toggleStatus(task)}
                    style={{ marginRight: 8, cursor: "pointer" }}
                  >
                    {task.status === "pending" ? "Mark Done" : "Mark Pending"}
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    style={{ color: "red", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;

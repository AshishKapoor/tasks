import { useState, useEffect, useCallback, useMemo } from "react";

interface Task {
  id: string;
  title: string;
  status: "pending" | "done";
  createdAt: string;
}

type FilterType = "all" | "pending" | "done";
type SortType =
  | "date-desc"
  | "date-asc"
  | "title-asc"
  | "title-desc"
  | "status-pending"
  | "status-done";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("date-desc");

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

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    // Filter tasks
    let filtered = tasks;
    if (filter === "pending") {
      filtered = tasks.filter((task) => task.status === "pending");
    } else if (filter === "done") {
      filtered = tasks.filter((task) => task.status === "done");
    }

    // Sort tasks
    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case "date-desc":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "date-asc":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "status-pending":
          if (a.status === "pending" && b.status === "done") return -1;
          if (a.status === "done" && b.status === "pending") return 1;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "status-done":
          if (a.status === "done" && b.status === "pending") return -1;
          if (a.status === "pending" && b.status === "done") return 1;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    return sorted;
  }, [tasks, filter, sort]);

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

      {/* Filter and Sort Controls */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 24,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label htmlFor="filter" style={{ fontSize: 14, fontWeight: "bold" }}>
            Filter:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            style={{ padding: 6, fontSize: 14 }}
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending Only</option>
            <option value="done">Done Only</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label htmlFor="sort" style={{ fontSize: 14, fontWeight: "bold" }}>
            Sort by:
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            style={{ padding: 6, fontSize: 14 }}
          >
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="status-pending">Status (Pending First)</option>
            <option value="status-done">Status (Done First)</option>
          </select>
        </div>

        <div style={{ fontSize: 14, color: "#666" }}>
          {filteredAndSortedTasks.length} of {tasks.length} tasks
        </div>
      </div>

      {error && <p style={{ color: "red", marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : filteredAndSortedTasks.length === 0 ? (
        <p>
          {filter === "all"
            ? "No tasks yet. Add one above."
            : `No ${filter} tasks found.`}
        </p>
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
            {filteredAndSortedTasks.map((task) => (
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

import type { Task, TaskStatus } from "@/lib/types";

const API_URL = "";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(errorBody?.error || "Request failed");
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${API_URL}/api/tasks`);
  return parseResponse<Task[]>(response);
}

export async function createTask(title: string): Promise<Task> {
  const response = await fetch(`${API_URL}/api/add-task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  return parseResponse<Task>(response);
}

export async function patchTaskStatus(
  id: string,
  status: TaskStatus
): Promise<Task> {
  const response = await fetch(`${API_URL}/api/task/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  return parseResponse<Task>(response);
}

export async function removeTask(id: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/task/${id}`, {
    method: "DELETE",
  });

  return parseResponse<{ message: string }>(response);
}

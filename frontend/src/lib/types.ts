export type TaskStatus = "pending" | "done";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
}

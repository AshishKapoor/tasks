import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, fetchTasks, patchTaskStatus, removeTask } from "@/lib/api";
import type { Task, TaskStatus } from "@/lib/types";

export const TASKS_QUERY_KEY = ["tasks"];

export function useTasks() {
  return useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: fetchTasks,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => createTask(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useToggleTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: Task) => {
      const nextStatus: TaskStatus = task.status === "pending" ? "done" : "pending";
      return patchTaskStatus(task.id, nextStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

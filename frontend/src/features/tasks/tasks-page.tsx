import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskForm } from "@/features/tasks/task-form";
import { TasksTable } from "@/features/tasks/tasks-table";
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useToggleTaskStatus,
} from "@/hooks/use-tasks";
import type { Task } from "@/lib/types";

export function TasksPage() {
  const tasksQuery = useTasks();
  const createTaskMutation = useCreateTask();
  const toggleTaskMutation = useToggleTaskStatus();
  const deleteTaskMutation = useDeleteTask();

  const isMutating =
    createTaskMutation.isPending ||
    toggleTaskMutation.isPending ||
    deleteTaskMutation.isPending;

  async function handleCreateTask(title: string) {
    await createTaskMutation.mutateAsync(title);
  }

  function handleToggleTask(task: Task) {
    toggleTaskMutation.mutate(task);
  }

  function handleDeleteTask(id: string) {
    deleteTaskMutation.mutate(id);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Card className="border-white/70 bg-white/60 shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl tracking-tight">Task Control Center</CardTitle>
          <CardDescription>
            A refactored frontend using React Query, TanStack Table, and shadcn UI components.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <TaskForm onSubmit={handleCreateTask} isSubmitting={createTaskMutation.isPending} />

          {tasksQuery.isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading tasks...
            </div>
          )}

          {tasksQuery.isError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {(tasksQuery.error as Error).message || "Failed to load tasks"}
            </div>
          )}

          {createTaskMutation.isError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {(createTaskMutation.error as Error).message || "Failed to create task"}
            </div>
          )}

          {!tasksQuery.isLoading && !tasksQuery.isError && (
            <TasksTable
              tasks={tasksQuery.data ?? []}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              isMutating={isMutating}
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}

import { ArrowUpDown, Check, Trash2, Undo2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/types";

interface TaskColumnsParams {
  onToggleTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  isMutating: boolean;
}

export function getTaskColumns({
  onToggleTask,
  onDeleteTask,
  isMutating,
}: TaskColumnsParams): ColumnDef<Task>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[340px] truncate font-medium text-foreground">{row.original.title}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isDone = row.original.status === "done";
        return (
          <Badge variant={isDone ? "secondary" : "default"}>
            {isDone ? "Done" : "Pending"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      ),
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const task = row.original;
        const markAsDone = task.status === "pending";

        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isMutating}
              onClick={() => onToggleTask(task)}
              className="gap-1"
            >
              {markAsDone ? <Check className="size-4" /> : <Undo2 className="size-4" />}
              {markAsDone ? "Done" : "Undo"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isMutating}
              onClick={() => onDeleteTask(task.id)}
              className="gap-1"
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        );
      },
    },
  ];
}

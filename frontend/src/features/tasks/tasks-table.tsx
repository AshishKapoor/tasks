import {
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTaskColumns } from "@/features/tasks/task-columns";
import type { Task } from "@/lib/types";

interface TasksTableProps {
  tasks: Task[];
  onToggleTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  isMutating: boolean;
}

export function TasksTable({
  tasks,
  onToggleTask,
  onDeleteTask,
  isMutating,
}: TasksTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "createdAt",
      desc: true,
    },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo(
    () =>
      getTaskColumns({
        onToggleTask,
        onDeleteTask,
        isMutating,
      }),
    [onDeleteTask, onToggleTask, isMutating]
  );

  const table = useReactTable({
    data: tasks,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search tasks..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
          className="sm:max-w-sm"
        />
        <select
          className="h-10 rounded-md border border-input bg-white/95 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
          onChange={(event) => {
            const value = event.target.value;
            table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value);
          }}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div className="rounded-md border bg-white/75 backdrop-blur-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No matching tasks.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {table.getRowModel().rows.length} of {tasks.length} task{tasks.length === 1 ? "" : "s"}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

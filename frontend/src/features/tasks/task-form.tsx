import { FormEvent, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TaskFormProps {
  onSubmit: (title: string) => Promise<void>;
  isSubmitting: boolean;
}

export function TaskForm({ onSubmit, isSubmitting }: TaskFormProps) {
  const [title, setTitle] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) {
      return;
    }

    await onSubmit(nextTitle);
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Add a task with clear intent"
        aria-label="Task title"
        className="h-11 bg-white/95"
      />
      <Button type="submit" className="h-11 gap-2" disabled={isSubmitting || !title.trim()}>
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Add Task
      </Button>
    </form>
  );
}

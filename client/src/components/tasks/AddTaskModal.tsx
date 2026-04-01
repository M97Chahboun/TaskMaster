import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import TaskForm from "./TaskForm";
import { useState } from "react";
import { Task } from "@shared/schema";

interface TaskModalProps {
  onTaskAdded: () => void;
  trigger?: React.ReactNode;
  task?: Task;
  mode?: "add" | "edit";
}

export default function TaskModal({
  onTaskAdded,
  trigger,
  task,
  mode = "add",
}: TaskModalProps) {
  const [open, setOpen] = useState(false);

  const handleTaskAdded = () => {
    onTaskAdded();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary hover:bg-primary-dark">
            {mode === "add" ? (
              <>
                <Plus className="mr-1 h-4 w-4" />
                Add Task
              </>
            ) : (
              <>
                <Pencil className="mr-1 h-4 w-4" />
                Edit Task
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {mode === "add" ? "Add New Task" : "Edit Task"}
          </DialogTitle>
        </DialogHeader>
        <TaskForm task={task} onSuccess={handleTaskAdded} />
      </DialogContent>
    </Dialog>
  );
}

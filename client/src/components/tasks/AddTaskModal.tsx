import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize } from "lucide-react";
import TaskForm from "./TaskForm";
import { useState } from "react";

interface AddTaskModalProps {
  onTaskAdded: () => void;
  trigger?: React.ReactNode;
  userId?: number;
}

export default function AddTaskModal({ onTaskAdded, trigger, userId = 1 }: AddTaskModalProps) {
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
            <Maximize className="mr-1 h-4 w-4" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Task</DialogTitle>
        </DialogHeader>
        <TaskForm onSuccess={handleTaskAdded} userId={userId} />
      </DialogContent>
    </Dialog>
  );
}

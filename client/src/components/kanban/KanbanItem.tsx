import React from 'react';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import { getPriorityColor } from "@/utils/taskUtils";

interface KanbanItemProps {
  id: string;
  task: Task;
  onUpdate: () => void;
}

export default function KanbanItem({ id, task, onUpdate }: KanbanItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDueDate = (date: Date | string | null) => {
    if (!date) return 'No due date';
    return formatDate(date);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-2 cursor-grab active:cursor-grabbing"
    >
      <Card className="border shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="p-3 pb-1">
          <div className="text-sm font-medium">{task.title}</div>
        </CardHeader>
        <CardContent className="p-3 pt-0 pb-1">
          {task.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
              {task.description}
            </p>
          )}
        </CardContent>
        <CardFooter className="p-3 pt-0 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDueDate(task.dueDate)}
            </span>
          </div>
          <Badge
            variant="outline"
            className={`text-xs px-2 py-0 ${getPriorityColor(task.priority)}`}
          >
            {task.priority}
          </Badge>
        </CardFooter>
      </Card>
    </div>
  );
}
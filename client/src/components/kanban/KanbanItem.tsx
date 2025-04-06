import React from 'react';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, GripVertical } from "lucide-react";
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
    isDragging,
  } = useSortable({ 
    id,
    data: {
      type: 'task',
      task
    }
  });

  // Generate styles for the draggable item
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
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
      className={`mb-2 ${isDragging ? 'z-50' : ''}`}
    >
      <Card className={`border shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 relative ${
        isDragging ? 'shadow-lg border-primary' : ''
      }`}>
        {/* Drag handle for better UX */}
        <div 
          {...listeners} 
          className="absolute top-0 left-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        
        <CardHeader className="p-3 pb-1 pl-8">
          <div className="text-sm font-medium">{task.title}</div>
        </CardHeader>
        <CardContent className="p-3 pt-0 pb-1 pl-8">
          {task.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
              {task.description}
            </p>
          )}
        </CardContent>
        <CardFooter className="p-3 pt-0 pl-8 flex items-center justify-between flex-wrap gap-2">
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
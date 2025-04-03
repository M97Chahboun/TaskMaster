import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
  onClick?: () => void;
}

export default function TaskCard({ task, onUpdate, onClick }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  const priorityBadgeColors = {
    'low': 'bg-green-500',
    'medium': 'bg-yellow-500',
    'high': 'bg-red-500'
  };
  
  const priorityBorderColors = {
    'low': 'border-green-500',
    'medium': 'border-yellow-500',
    'high': 'border-red-500'
  };
  
  const getDueDisplay = () => {
    if (!task.dueDate) return 'No due date';
    
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dueDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 0) {
        return `Overdue by ${Math.abs(daysDiff)} days`;
      } else if (daysDiff <= 7) {
        return `Due in ${daysDiff} days`;
      } else {
        return `Due on ${dueDate.toLocaleDateString()}`;
      }
    }
  };
  
  const handleToggleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      await apiRequest('PATCH', `/api/tasks/${task.id}`, {
        completed: !task.completed
      });
      
      onUpdate();
      
      toast({
        title: task.completed ? "Task marked incomplete" : "Task completed!",
        description: task.title,
      });
    } catch (error) {
      toast({
        title: "Error updating task",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div 
      className={`task-card border border-gray-200 rounded-lg p-4 mb-3 cursor-pointer transform transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${priorityBorderColors[task.priority as keyof typeof priorityBorderColors]} border-l-4`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center">
            <Checkbox 
              className="mr-3 h-5 w-5"
              checked={task.completed}
              onCheckedChange={handleToggleComplete}
              onClick={(e) => e.stopPropagation()}
            />
            <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </h3>
          </div>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1 ml-8">
              {task.description}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-xs text-white px-2 py-0.5 rounded-full ${priorityBadgeColors[task.priority as keyof typeof priorityBadgeColors]}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          <span className="text-xs text-gray-500 mt-2">{getDueDisplay()}</span>
        </div>
      </div>
    </div>
  );
}

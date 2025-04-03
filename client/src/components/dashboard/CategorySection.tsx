import { useState, useEffect } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskCard from "../tasks/TaskCard";
import { Task } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import AddTaskModal from "../tasks/AddTaskModal";

interface CategorySectionProps {
  title: string;
  category: string;
  color: string;
  userId: number;
}

export default function CategorySection({
  title,
  category,
  color,
  userId
}: CategorySectionProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  // Fetch tasks for this category
  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ['/api/tasks/category/' + category, { userId }],
  });
  
  const handleTaskAdded = () => {
    refetch();
  };
  
  const getDisplayTasks = () => {
    if (!tasks) return [];
    return tasks.slice(0, 3); // Only show up to 3 tasks in the dashboard view
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <span className={`inline-block w-3 h-3 rounded-full bg-${color} mr-2`}></span>
          {title}
        </h2>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5 text-gray-400" />
        </Button>
      </div>
      
      {isLoading ? (
        <div className="py-4 text-gray-500 text-center">Loading tasks...</div>
      ) : (
        <>
          {getDisplayTasks().map((task: Task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onUpdate={refetch}
            />
          ))}
          
          {tasks && tasks.length === 0 && (
            <div className="py-4 text-gray-500 text-center">No tasks in this category</div>
          )}
        </>
      )}
      
      <AddTaskModal 
        onTaskAdded={handleTaskAdded}
        trigger={
          <Button 
            variant="ghost" 
            className="w-full mt-2 text-primary hover:text-primary-dark"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add {title.replace(' Tasks', '')} Task
          </Button>
        }
      />
    </div>
  );
}

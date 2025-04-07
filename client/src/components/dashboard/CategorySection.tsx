import { useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskCard from "../tasks/TaskCard";
import { Task } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import AddTaskModal from "../tasks/AddTaskModal";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface CategorySectionProps {
  title: string;
  category: string;
  color: string;
}

export default function CategorySection({
  title,
  category,
  color,
}: CategorySectionProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const { user } = useAuth();

  if (!user) return null;

  // Fetch tasks for this category
  const {
    data: tasks = [],
    isLoading,
    refetch,
  } = useQuery<Task[]>({
    queryKey: ["/api/tasks/category/" + category],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/tasks/category/${category}`
      );
      const data = await response.json();
      return data;
    },
  });

  const handleTaskAdded = () => {
    refetch();
  };

  const getDisplayTasks = () => {
    return tasks.slice(0, 3); // Only show up to 3 tasks in the dashboard view
  };

  return (
    <div className="bg-card rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <span
            className={`inline-block w-3 h-3 rounded-full bg-${color} mr-2`}
          ></span>
          {title}
        </h2>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      {isLoading ? (
        <div className="py-4 text-muted-foreground text-center">
          Loading tasks...
        </div>
      ) : (
        <>
          {getDisplayTasks().map((task: Task) => (
            <TaskCard key={task.id} task={task} onUpdate={refetch} />
          ))}

          {tasks && tasks.length === 0 && (
            <div className="py-4 text-muted-foreground text-center">
              No tasks in this category
            </div>
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
            Add {title.replace(" Tasks", "")} Task
          </Button>
        }
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface NotificationCenterProps {
  userId: string;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const { toast } = useToast();
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);

  useEffect(() => {
    const checkTaskDeadlines = async () => {
      try {
        const response = await apiRequest('GET', `/api/tasks?userId=${userId}&dueSoon=true`);
        const tasks: Task[] = await response.json();
        
        tasks.forEach((task) => {
          if (!task.dueDate) return;
          
          const dueDate = new Date(task.dueDate);
          const hoursUntilDue = Math.floor((dueDate.getTime() - Date.now()) / (1000 * 60 * 60));
          
          if (hoursUntilDue <= 24) {
            toast({
              title: "Task Deadline Approaching",
              description: `${task.title} is due ${hoursUntilDue <= 0 ? 'now' : `in ${hoursUntilDue} hours`}`,
              variant: "default",
            });
          }
        });

        setUpcomingTasks(tasks);
      } catch (error) {
        console.error("Error checking task deadlines:", error);
      }
    };

    // Check immediately on mount
    checkTaskDeadlines();

    // Then check every hour
    const interval = setInterval(checkTaskDeadlines, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [userId, toast]);

  return null; // This component doesn't render anything, it just triggers toasts
}
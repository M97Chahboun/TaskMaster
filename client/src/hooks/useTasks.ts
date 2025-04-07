import { useQuery, useMutation } from "@tanstack/react-query";
import { Task, InsertTask } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export function useTasks() {
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    data: tasks,
    isLoading,
    isError,
    refetch
  } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await apiRequest("GET", `/api/tasks`);
      const data = await response.json();
      return data as Task[];
    },
    enabled: !!user,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (task: InsertTask) => {
      const res = await apiRequest("POST", "/api/tasks", task);
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Success",
        description: "Task created successfully.",
      });
    },
    onError: (error) => {
      console.error('Create task error:', error);
      toast({
        title: "Error",
        description: "There was a problem creating your task.",
        variant: "destructive",
      });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, task }: { id: number; task: Partial<Task> }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, task);
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Success",
        description: "Task updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Update task error:', error);
      toast({
        title: "Error",
        description: "There was a problem updating your task.",
        variant: "destructive",
      });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Success",
        description: "Your task has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Delete task error:', error);
      toast({
        title: "Error",
        description: "There was a problem deleting your task.",
        variant: "destructive",
      });
    }
  });

  const getTasksByCategory = (category: string): Task[] => {
    return tasks?.filter((task: Task) => task.category === category) || [];
  };

  const getTasksByPriority = (priority: string): Task[] => {
    return tasks?.filter((task: Task) => task.priority === priority) || [];
  };

  const getCompletedTasks = (): Task[] => {
    return tasks?.filter((task: Task) => task.completed) || [];
  };

  const getPendingTasks = (): Task[] => {
    return tasks?.filter((task: Task) => !task.completed) || [];
  };

  const getTasksForToday = (): Task[] => {
    if (!tasks) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter((task: Task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });
  };

  const getUpcomingTasks = (days: number = 7): Task[] => {
    if (!tasks) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days);

    return tasks.filter((task: Task) => {
      if (!task.dueDate || task.completed) return false;

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      return dueDate >= today && dueDate <= endDate;
    });
  };

  return {
    tasks,
    isLoading,
    isError,
    refetch,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    getTasksByCategory,
    getTasksByPriority,
    getCompletedTasks,
    getPendingTasks,
    getTasksForToday,
    getUpcomingTasks
  };
}

import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export function useTasks() {
  const { user } = useAuth();

  const { data: tasks = [], isLoading, isError, error, refetch } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/tasks");
      return response.json();
    },
    enabled: !!user
  });

  return {
    tasks,
    isLoading,
    isError,
    error,
    refetch
  };
}

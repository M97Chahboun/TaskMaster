import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useTasks() {
  const { data: tasks = [], isLoading, isError, error, refetch } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  return {
    tasks,
    isLoading,
    isError,
    error,
    refetch
  };
}

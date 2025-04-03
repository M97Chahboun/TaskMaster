import { useState, useEffect } from "react";
import { Task } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useTasks(userId: number) {
  const { toast } = useToast();
  
  const {
    data: tasks,
    isLoading,
    isError,
    refetch
  } = useQuery<Task[]>({
    queryKey: ['/api/tasks', { userId }],
  });
  
  const createTaskMutation = useMutation({
    mutationFn: (taskData: Omit<Task, 'id' | 'createdAt'>) => {
      return apiRequest('POST', '/api/tasks', taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem creating your task.",
        variant: "destructive",
      });
    }
  });
  
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<Task> & { id: number }) => {
      return apiRequest('PATCH', `/api/tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem updating your task.",
        variant: "destructive",
      });
    }
  });
  
  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem deleting your task.",
        variant: "destructive",
      });
    }
  });
  
  const getTasksByCategory = (category: string) => {
    return tasks?.filter(task => task.category === category) || [];
  };
  
  const getTasksByPriority = (priority: string) => {
    return tasks?.filter(task => task.priority === priority) || [];
  };
  
  const getCompletedTasks = () => {
    return tasks?.filter(task => task.completed) || [];
  };
  
  const getPendingTasks = () => {
    return tasks?.filter(task => !task.completed) || [];
  };
  
  const getTasksForToday = () => {
    if (!tasks) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate.getTime() === today.getTime();
    });
  };
  
  const getUpcomingTasks = (days: number = 7) => {
    if (!tasks) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate >= today && dueDate <= futureDate;
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

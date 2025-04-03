import React from 'react';
import { useQuery } from '@tanstack/react-query';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { Loader2 } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';

export default function KanbanView() {
  const userId = 1; // Default user ID
  const { tasks, isLoading, refetch } = useTasks(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kanban Board</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Drag and drop tasks between columns to update their status
        </p>
      </div>
      
      <div className="h-[calc(100vh-220px)]">
        {tasks && tasks.length > 0 ? (
          <KanbanBoard 
            tasks={tasks || []} 
            onTasksChange={() => refetch()} 
            userId={userId} 
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">No tasks found. Create some tasks to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
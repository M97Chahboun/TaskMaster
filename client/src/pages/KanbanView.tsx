import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { Loader2 } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Task } from '@shared/schema';

export default function KanbanView() {
  const userId = 1; // Default user ID
  const { tasks, isLoading, refetch } = useTasks(userId);
  // Add a key for forced re-renders
  const [boardKey, setBoardKey] = useState(Date.now());
  // Track tasks locally to prevent stale UI
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  
  // Update local tasks when the API data changes
  React.useEffect(() => {
    if (tasks) {
      setLocalTasks(tasks);
    }
  }, [tasks]);
  
  // Force a refresh of the board
  const refreshBoard = useCallback(() => {
    refetch();
    setBoardKey(Date.now());
  }, [refetch]);
  
  // Handle task changes
  const handleTaskChange = useCallback(() => {
    refreshBoard();
  }, [refreshBoard]);

  if (isLoading && localTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kanban Board</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Drag and drop tasks between columns to update their status
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshBoard}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <div className="h-[calc(100vh-220px)]">
        {localTasks && localTasks.length > 0 ? (
          <KanbanBoard 
            key={boardKey}
            tasks={localTasks} 
            onTasksChange={handleTaskChange} 
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
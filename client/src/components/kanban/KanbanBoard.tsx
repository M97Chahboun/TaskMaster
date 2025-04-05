import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import KanbanColumn from '@/components/kanban/KanbanColumn';
import KanbanItem from '@/components/kanban/KanbanItem';
import { Task } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface KanbanBoardProps {
  tasks: Task[];
  onTasksChange: () => void;
  userId: number;
}

type KanbanColumn = {
  id: string;
  title: string;
  tasks: Task[];
}

export default function KanbanBoard({ tasks, onTasksChange, userId }: KanbanBoardProps) {
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  // Force re-render with a counter
  const [updateCounter, setUpdateCounter] = useState(0);
  
  // Update local tasks when props change
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);
  
  // Force re-render when localTasks change
  const forceUpdate = () => {
    setUpdateCounter(prev => prev + 1);
  };
  
  // Configure the sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calculate columns using useMemo for better performance and re-rendering
  const columns = React.useMemo(() => {
    // This will recalculate when localTasks or updateCounter changes
    return [
      {
        id: 'to-do',
        title: 'To Do',
        tasks: localTasks.filter(task => !task.completed && !task.inProgress)
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        tasks: localTasks.filter(task => !task.completed && task.inProgress)
      },
      {
        id: 'completed',
        title: 'Completed',
        tasks: localTasks.filter(task => task.completed)
      }
    ];
  }, [localTasks, updateCounter]); // Depend on both localTasks and updateCounter

  // Get the task from the active ID
  const getTaskFromId = useCallback((id: string) => {
    const taskId = parseInt(id.replace('task-', ''));
    return localTasks.find(task => task.id === taskId) || null;
  }, [localTasks]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    if (!active || !active.id || typeof active.id !== 'string') return;
    
    const taskId = active.id;
    setActiveId(taskId);
    
    const task = getTaskFromId(taskId);
    if (task) {
      setActiveTask(task);
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!active || !over || !active.id || typeof active.id !== 'string' || typeof over.id !== 'string') {
      setActiveId(null);
      setActiveTask(null);
      return;
    }
    
    const taskId = parseInt(active.id.replace('task-', ''));
    const taskIndex = localTasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }
    
    // Get a reference to the original task
    const task = {...localTasks[taskIndex]};
    
    // Determine the new state based on which column the task was dropped in
    let updates: Partial<Task> = {};
    
    if (over.id === 'to-do') {
      updates = { completed: false, inProgress: false };
    } else if (over.id === 'in-progress') {
      updates = { completed: false, inProgress: true };
    } else if (over.id === 'completed') {
      updates = { completed: true, inProgress: false };
    }
    
    // Create a new task object with updates
    const updatedTask = { ...task, ...updates };
    
    // Create a new array with the updated task
    const newTasks = [...localTasks];
    newTasks[taskIndex] = updatedTask;
    
    // Update the local state immediately for responsive UI
    setLocalTasks(newTasks);
    forceUpdate();
    
    try {
      // Update the task in the database
      const updatedData = await apiRequest('PATCH', `/api/tasks/${taskId}`, updates);
      
      // If the update was successful, trigger refetch and notify parent
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', { userId }] });
      onTasksChange();
      
      toast({
        title: 'Task updated',
        description: `Task moved to ${over.id}`,
      });
    } catch (error) {
      // If there was an error, revert to the original task array
      setLocalTasks(tasks);
      forceUpdate();
      
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive',
      });
    }
    
    // Clear the active task/id
    setActiveId(null);
    setActiveTask(null);
  };

  // Render the Kanban board
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full pb-4">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={column.tasks}
            onTaskUpdate={onTasksChange}
          />
        ))}
      </div>
      
      {/* Drag overlay */}
      <DragOverlay>
        {activeId && activeTask && (
          <KanbanItem
            id={activeId}
            task={activeTask}
            onUpdate={onTasksChange}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
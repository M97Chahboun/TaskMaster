import React, { useState, useCallback } from 'react';
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

  // Setup the columns
  const columns: KanbanColumn[] = [
    {
      id: 'to-do',
      title: 'To Do',
      tasks: tasks.filter(task => !task.completed && !task.inProgress)
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: tasks.filter(task => !task.completed && task.inProgress)
    },
    {
      id: 'completed',
      title: 'Completed',
      tasks: tasks.filter(task => task.completed)
    }
  ];

  // Get the task from the active ID
  const getTaskFromId = useCallback((id: string) => {
    const taskId = parseInt(id.replace('task-', ''));
    return tasks.find(task => task.id === taskId) || null;
  }, [tasks]);

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
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }
    
    // Determine the new state based on which column the task was dropped in
    let updates: Partial<Task> = {};
    
    if (over.id === 'to-do') {
      updates = { completed: false, inProgress: false };
    } else if (over.id === 'in-progress') {
      updates = { completed: false, inProgress: true };
    } else if (over.id === 'completed') {
      updates = { completed: true, inProgress: false };
    }
    
    try {
      // Update the task in the database
      await apiRequest('PATCH', `/api/tasks/${taskId}`, updates);
      
      // Invalidate the tasks query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', { userId }] });
      
      // Notify the parent component that tasks have changed
      onTasksChange();
      
      toast({
        title: 'Task updated',
        description: `Task moved to ${over.id}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task',
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
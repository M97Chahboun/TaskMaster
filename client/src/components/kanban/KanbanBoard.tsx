import React, { useState, useCallback, useEffect } from 'react';
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

// Find the column that contains the task
function findColumnOfTask(columns: KanbanColumn[], taskId: string): string | null {
  for (const column of columns) {
    const found = column.tasks.some(task => `task-${task.id}` === taskId);
    if (found) return column.id;
  }
  return null;
}

export default function KanbanBoard({ tasks, onTasksChange, userId }: KanbanBoardProps) {
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  
  // Update local tasks when props change
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);
  
  // Configure the sensors with looser constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Activate on a shorter distance to make dragging more responsive
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calculate columns - define outside so it's accessible to all handlers
  const columns = [
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

  // Get the task from the active ID
  const getTaskFromId = useCallback((id: string) => {
    const taskId = parseInt(id.replace('task-', ''));
    return localTasks.find(task => task.id === taskId) || null;
  }, [localTasks]);

  // Handle drag start - setup the active task
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    console.log("Drag started:", active.id);
    
    if (!active || !active.id || typeof active.id !== 'string') return;
    
    const taskId = active.id;
    setActiveId(taskId);
    
    const task = getTaskFromId(taskId);
    if (task) {
      setActiveTask(task);
      console.log("Active task set:", task.title);
    }
  };

  // Additional handler for drag over to provide visual feedback
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!active || !over) return;
    
    console.log(`Dragging over: ${over.id}`);
  };

  // Handle drag end - update the task status based on the column it was dropped in
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    console.log("Drag ended - Active:", active?.id, "Over:", over?.id);
    
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
    
    // Get the current task
    const task = {...localTasks[taskIndex]};
    const sourceColumn = findColumnOfTask(columns, active.id);
    const targetColumn = over.id;
    
    console.log(`Moving from ${sourceColumn} to ${targetColumn}`);
    
    // Only proceed if actually changing columns
    if (sourceColumn !== targetColumn) {
      // Determine the new state based on which column the task was dropped in
      let updates: Partial<Task> = {};
      
      if (targetColumn === 'to-do') {
        updates = { completed: false, inProgress: false };
      } else if (targetColumn === 'in-progress') {
        updates = { completed: false, inProgress: true };
      } else if (targetColumn === 'completed') {
        updates = { completed: true, inProgress: false };
      }
      
      // Apply updates locally
      const updatedTask = { ...task, ...updates };
      const newTasks = [...localTasks];
      newTasks[taskIndex] = updatedTask;
      
      // Update local state first for better UX
      setLocalTasks(newTasks);
      
      try {
        // Update the task in the database
        console.log(`Updating task ${taskId} with:`, updates);
        await apiRequest('PATCH', `/api/tasks/${taskId}`, updates);
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        onTasksChange();
        
        toast({
          title: 'Task updated',
          description: `Task moved to ${targetColumn.replace('-', ' ')}`,
        });
      } catch (error) {
        console.error("Error updating task:", error);
        // Revert on error
        setLocalTasks(tasks);
        
        toast({
          title: 'Error',
          description: 'Failed to update task status',
          variant: 'destructive',
        });
      }
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
      onDragOver={handleDragOver}
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
      
      {/* Drag overlay - what appears when dragging */}
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
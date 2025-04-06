import React from 'react';
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanItem from '@/components/kanban/KanbanItem';
import { Task } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskUpdate: () => void;
}

export default function KanbanColumn({ id, title, tasks, onTaskUpdate }: KanbanColumnProps) {
  // Setup the droppable container with improved data
  const { setNodeRef, isOver, active } = useDroppable({
    id,
    data: {
      accepts: ['task'], // Define what type of items this column accepts
      type: 'column'
    }
  });
  
  // Get task IDs for the sortable context
  const taskIds = tasks.map(task => `task-${task.id}`);
  
  // Apply different styles when being dragged over
  const columnStyle = isOver ? {
    backgroundColor: 'rgba(var(--color-primary) / 0.1)',
    borderColor: 'rgb(var(--color-primary))',
    transition: 'all 0.2s ease',
  } : {};
  
  return (
    <Card 
      className="flex flex-col h-full dark:bg-gray-900 dark:border-gray-800 transition-colors duration-200"
      style={columnStyle}
    >
      <CardHeader className="p-3 pb-2 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
          <div className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {tasks.length}
          </div>
        </div>
      </CardHeader>
      
      {/* The entire card content is the drop target */}
      <CardContent 
        ref={setNodeRef} 
        className="flex-1 p-2 overflow-y-auto max-h-[calc(100vh-250px)] bg-gray-50/50 dark:bg-gray-900 min-h-[150px]"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanItem 
              key={task.id} 
              id={`task-${task.id}`} 
              task={task} 
              onUpdate={onTaskUpdate} 
            />
          ))}
          
          {/* Empty state with visual cue */}
          {tasks.length === 0 && (
            <div className={`text-center p-4 text-sm text-gray-500 dark:text-gray-400 rounded-md border border-dashed ${
              isOver ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700'
            }`}>
              {isOver ? 'Drop here' : 'No tasks in this column'}
            </div>
          )}
        </SortableContext>
      </CardContent>
    </Card>
  );
}
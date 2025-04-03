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
  // Setup the droppable container
  const { setNodeRef } = useDroppable({ id });
  
  // Get task IDs for the sortable context
  const taskIds = tasks.map(task => `task-${task.id}`);
  
  return (
    <Card className="flex flex-col h-full dark:bg-gray-900 dark:border-gray-800">
      <CardHeader className="p-3 pb-2 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
          <div className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {tasks.length}
          </div>
        </div>
      </CardHeader>
      <CardContent 
        ref={setNodeRef} 
        className="flex-1 p-2 overflow-y-auto max-h-[calc(100vh-250px)] bg-gray-50/50 dark:bg-gray-900"
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
          {tasks.length === 0 && (
            <div className="text-center p-4 text-sm text-gray-500 dark:text-gray-400">
              No tasks in this column
            </div>
          )}
        </SortableContext>
      </CardContent>
    </Card>
  );
}
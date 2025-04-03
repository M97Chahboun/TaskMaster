import { Task } from "@shared/schema";

export function sortTasksByDueDate(tasks: Task[], ascending: boolean = true): Task[] {
  return [...tasks].sort((a, b) => {
    if (!a.dueDate) return ascending ? 1 : -1;
    if (!b.dueDate) return ascending ? -1 : 1;
    
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

export function sortTasksByPriority(tasks: Task[], ascending: boolean = false): Task[] {
  const priorityWeight = {
    'high': 3,
    'medium': 2,
    'low': 1
  };
  
  return [...tasks].sort((a, b) => {
    const weightA = priorityWeight[a.priority as keyof typeof priorityWeight] || 0;
    const weightB = priorityWeight[b.priority as keyof typeof priorityWeight] || 0;
    
    return ascending ? weightA - weightB : weightB - weightA;
  });
}

export function filterTasksByCategory(tasks: Task[], category: string): Task[] {
  return tasks.filter(task => task.category === category);
}

export function filterTasksByPriority(tasks: Task[], priority: string): Task[] {
  return tasks.filter(task => task.priority === priority);
}

export function filterCompletedTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.completed);
}

export function filterPendingTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => !task.completed);
}

export function calculateCompletionRate(tasks: Task[]): number {
  if (!tasks.length) return 0;
  
  const completedTasks = tasks.filter(task => task.completed);
  return (completedTasks.length / tasks.length) * 100;
}

export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'red';
    case 'medium':
      return 'yellow';
    case 'low':
      return 'green';
    default:
      return 'gray';
  }
}

export function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'work':
      return 'primary';
    case 'personal':
      return 'secondary';
    case 'health':
      return 'green';
    case 'education':
      return 'blue';
    default:
      return 'gray';
  }
}

export function getTasksDueToday(tasks: Task[]): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return tasks.filter(task => {
    if (!task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate.getTime() === today.getTime();
  });
}

export function getTasksDueThisWeek(tasks: Task[]): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  
  return tasks.filter(task => {
    if (!task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate <= endOfWeek;
  });
}

export function getOverdueTasks(tasks: Task[]): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return tasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  });
}

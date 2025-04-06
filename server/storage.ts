import { 
  users, type User, type InsertUser,
  tasks, type Task, type InsertTask,
  timeBlocks, type TimeBlock, type InsertTimeBlock
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task methods
  getTasks(userId: number): Promise<Task[]>;
  getTasksByCategory(userId: number, category: string): Promise<Task[]>;
  getBacklogTasks(userId: number): Promise<Task[]>;
  getTaskById(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // TimeBlock methods
  getTimeBlocks(userId: number, date?: Date): Promise<TimeBlock[]>;
  getTimeBlockById(id: number): Promise<TimeBlock | undefined>;
  createTimeBlock(timeBlock: InsertTimeBlock): Promise<TimeBlock>;
  updateTimeBlock(id: number, timeBlock: Partial<TimeBlock>): Promise<TimeBlock | undefined>;
  deleteTimeBlock(id: number): Promise<boolean>;
  
  // Statistics methods
  getCompletedTasksCount(userId: number, startDate?: Date, endDate?: Date): Promise<number>;
  getTaskCompletionRate(userId: number, startDate?: Date, endDate?: Date): Promise<number>;
  getTasksByDueDate(userId: number, startDate?: Date, endDate?: Date): Promise<Task[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private timeBlocks: Map<number, TimeBlock>;
  private userId: number;
  private taskId: number;
  private timeBlockId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.timeBlocks = new Map();
    this.userId = 1;
    this.taskId = 1;
    this.timeBlockId = 1;
    
    // Add a demo user
    this.users.set(1, {
      id: 1,
      username: 'demo',
      password: 'demo',
      name: 'Alex Morgan',
      email: 'alex@example.com'
    });
    
    // Add some demo tasks
    const demoTasks = [
      {
        id: this.taskId++,
        userId: 1,
        title: 'Project Proposal',
        description: 'Finalize Q3 marketing campaign proposal',
        dueDate: new Date(Date.now() + 86400000), // Tomorrow
        priority: 'high',
        category: 'work',
        completed: false,
        inProgress: false,
        createdAt: new Date()
      },
      {
        id: this.taskId++,
        userId: 1,
        title: 'Team Weekly Report',
        description: 'Complete performance metrics for team',
        dueDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
        priority: 'medium',
        category: 'work',
        completed: false,
        inProgress: true,
        createdAt: new Date()
      },
      {
        id: this.taskId++,
        userId: 1,
        title: 'Research Competitors',
        description: 'Analyze top 5 competitor websites',
        dueDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
        priority: 'low',
        category: 'work',
        completed: false,
        createdAt: new Date()
      },
      {
        id: this.taskId++,
        userId: 1,
        title: 'Grocery Shopping',
        description: 'Pick up items for dinner party',
        dueDate: new Date(), // Today
        priority: 'medium',
        category: 'personal',
        completed: false,
        createdAt: new Date()
      },
      {
        id: this.taskId++,
        userId: 1,
        title: 'Gym Workout',
        description: '30 min cardio + strength training',
        dueDate: new Date(Date.now() + 86400000), // Tomorrow
        priority: 'low',
        category: 'personal',
        completed: false,
        createdAt: new Date()
      },
      {
        id: this.taskId++,
        userId: 1,
        title: 'Pay Rent',
        description: 'Transfer monthly payment to landlord',
        dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
        priority: 'high',
        category: 'personal',
        completed: false,
        createdAt: new Date()
      }
    ];
    
    // Add a few backlog tasks without due dates
    const backlogTasks = [
      {
        id: this.taskId++,
        userId: 1,
        title: 'Read Design Article',
        description: 'Read the article about UX design trends',
        dueDate: null,
        priority: 'low',
        category: 'education',
        completed: false,
        createdAt: new Date()
      },
      {
        id: this.taskId++,
        userId: 1,
        title: 'Research Cloud Providers',
        description: 'Compare AWS, GCP and Azure offerings',
        dueDate: null,
        priority: 'medium',
        category: 'work',
        completed: false,
        createdAt: new Date()
      }
    ];
    
    [...demoTasks, ...backlogTasks].forEach(task => this.tasks.set(task.id, task as Task));
    
    // Add some demo time blocks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const demoTimeBlocks = [
      {
        id: this.timeBlockId++,
        userId: 1,
        taskId: null,
        date: today,
        startTime: '09:00',
        duration: 45,
        title: 'Team Standup Meeting',
        description: 'Daily team sync via Zoom'
      },
      {
        id: this.timeBlockId++,
        userId: 1,
        taskId: 1,
        date: today,
        startTime: '10:00',
        duration: 120,
        title: 'Complete Project Proposal',
        description: 'Finalize Q3 marketing campaign proposal'
      },
      {
        id: this.timeBlockId++,
        userId: 1,
        taskId: null,
        date: today,
        startTime: '12:00',
        duration: 60,
        title: 'Lunch Break',
        description: ''
      },
      {
        id: this.timeBlockId++,
        userId: 1,
        taskId: null,
        date: today,
        startTime: '13:00',
        duration: 60,
        title: 'Client Call - Website Redesign',
        description: 'Review mockups with client feedback'
      },
      {
        id: this.timeBlockId++,
        userId: 1,
        taskId: null,
        date: today,
        startTime: '15:00',
        duration: 90,
        title: 'Research New Design Tools',
        description: 'Compare Figma vs Adobe XD for team use'
      }
    ];
    
    demoTimeBlocks.forEach(block => this.timeBlocks.set(block.id, block as TimeBlock));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id,
      name: insertUser.name || null,
      email: insertUser.email || null
    };
    this.users.set(id, user);
    return user;
  }

  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }

  async getTasksByCategory(userId: number, category: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId && task.category === category
    );
  }

  async getBacklogTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId && !task.dueDate && !task.completed
    );
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const task: Task = { 
      ...insertTask, 
      id,
      description: insertTask.description || null,
      dueDate: insertTask.dueDate || null,
      priority: insertTask.priority || 'medium',
      category: insertTask.category || 'work',
      completed: insertTask.completed ?? false,
      inProgress: insertTask.inProgress ?? false,
      createdAt: new Date() 
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updateData: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask = { ...task, ...updateData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // TimeBlock methods
  async getTimeBlocks(userId: number, date?: Date): Promise<TimeBlock[]> {
    return Array.from(this.timeBlocks.values()).filter(
      (block) => {
        if (!date) return block.userId === userId;
        
        const blockDate = new Date(block.date);
        const compareDate = new Date(date);
        
        return block.userId === userId && 
          blockDate.getFullYear() === compareDate.getFullYear() &&
          blockDate.getMonth() === compareDate.getMonth() &&
          blockDate.getDate() === compareDate.getDate();
      }
    );
  }

  async getTimeBlockById(id: number): Promise<TimeBlock | undefined> {
    return this.timeBlocks.get(id);
  }

  async createTimeBlock(insertTimeBlock: InsertTimeBlock): Promise<TimeBlock> {
    const id = this.timeBlockId++;
    const timeBlock: TimeBlock = { 
      ...insertTimeBlock, 
      id,
      description: insertTimeBlock.description || null,
      taskId: insertTimeBlock.taskId || null
    };
    this.timeBlocks.set(id, timeBlock);
    return timeBlock;
  }

  async updateTimeBlock(id: number, updateData: Partial<TimeBlock>): Promise<TimeBlock | undefined> {
    const timeBlock = this.timeBlocks.get(id);
    if (!timeBlock) return undefined;

    const updatedTimeBlock = { ...timeBlock, ...updateData };
    this.timeBlocks.set(id, updatedTimeBlock);
    return updatedTimeBlock;
  }

  async deleteTimeBlock(id: number): Promise<boolean> {
    return this.timeBlocks.delete(id);
  }

  // Statistics methods
  async getCompletedTasksCount(userId: number, startDate?: Date, endDate?: Date): Promise<number> {
    return Array.from(this.tasks.values()).filter(
      (task) => {
        if (!startDate && !endDate) {
          return task.userId === userId && task.completed;
        }
        
        const taskDate = task.dueDate;
        if (!taskDate) return false;
        
        const isAfterStart = !startDate || taskDate >= startDate;
        const isBeforeEnd = !endDate || taskDate <= endDate;
        
        return task.userId === userId && task.completed && isAfterStart && isBeforeEnd;
      }
    ).length;
  }

  async getTaskCompletionRate(userId: number, startDate?: Date, endDate?: Date): Promise<number> {
    const tasks = Array.from(this.tasks.values()).filter(
      (task) => {
        if (!startDate && !endDate) {
          return task.userId === userId;
        }
        
        const taskDate = task.dueDate;
        if (!taskDate) return false;
        
        const isAfterStart = !startDate || taskDate >= startDate;
        const isBeforeEnd = !endDate || taskDate <= endDate;
        
        return task.userId === userId && isAfterStart && isBeforeEnd;
      }
    );
    
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.completed);
    return (completedTasks.length / tasks.length) * 100;
  }

  async getTasksByDueDate(userId: number, startDate?: Date, endDate?: Date): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => {
        if (!task.dueDate) return false;
        
        const isAfterStart = !startDate || task.dueDate >= startDate;
        const isBeforeEnd = !endDate || task.dueDate <= endDate;
        
        return task.userId === userId && isAfterStart && isBeforeEnd;
      }
    ).sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }
}

export const storage = new MemStorage();

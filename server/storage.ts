import {
  users, type User, type InsertUser,
  tasks, type Task, type InsertTask,
  timeBlocks, type TimeBlock, type InsertTimeBlock
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getTasks(userId: number): Promise<Task[]>;
  getTasksByCategory(userId: number, category: string): Promise<Task[]>;
  getBacklogTasks(userId: number): Promise<Task[]>;
  getTaskById(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<void>;
  getTimeBlocks(userId: number, date: Date): Promise<TimeBlock[]>;
  createTimeBlock(timeBlock: InsertTimeBlock): Promise<TimeBlock>;
  updateTimeBlock(id: number, timeBlock: Partial<TimeBlock>): Promise<TimeBlock | undefined>;
  deleteTimeBlock(id: number): Promise<void>;
  getTaskCompletionRate(userId: number, startDate: Date, endDate: Date): Promise<number>;
  getCompletedTasksCount(userId: number, startDate: Date, endDate: Date): Promise<number>;
  getTasksByDueDate(userId: number, startDate: Date, endDate: Date): Promise<Task[]>;
}

export class PostgresStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async getTasksByCategory(userId: number, category: string): Promise<Task[]> {
    const categoryValue = category as "work" | "personal" | "health" | "education" | "other";
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.category, categoryValue)
        )
      );
  }

  async getBacklogTasks(userId: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.completed, false)
        )
      );
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    return result[0];
  }

  async createTask(task: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(task).returning();
    return result[0];
  }

  async updateTask(id: number, task: Partial<Task>): Promise<Task | undefined> {
    const result = await db.update(tasks).set(task).where(eq(tasks.id, id)).returning();
    return result[0];
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getTaskCompletionRate(userId: number, startDate: Date, endDate: Date): Promise<number> {
    const completedTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.completed, true),
          gte(tasks.createdAt, startDate),
          lte(tasks.createdAt, endDate)
        )
      );

    const totalTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          gte(tasks.createdAt, startDate),
          lte(tasks.createdAt, endDate)
        )
      );

    if (totalTasks.length === 0) return 0;
    return (completedTasks.length / totalTasks.length) * 100;
  }

  async getCompletedTasksCount(userId: number, startDate: Date, endDate: Date): Promise<number> {
    const completedTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.completed, true),
          gte(tasks.createdAt, startDate),
          lte(tasks.createdAt, endDate)
        )
      );

    return completedTasks.length;
  }

  async getTasksByDueDate(userId: number, startDate: Date, endDate: Date): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.completed, false),
          gte(tasks.dueDate, startDate),
          lte(tasks.dueDate, endDate)
        )
      );
  }

  // TimeBlock methods
  async getTimeBlocks(userId: number, date: Date): Promise<TimeBlock[]> {
    return await db
      .select()
      .from(timeBlocks)
      .where(
        and(
          eq(timeBlocks.userId, userId),
          eq(timeBlocks.date, date)
        )
      );
  }

  async createTimeBlock(timeBlock: InsertTimeBlock): Promise<TimeBlock> {
    const { date, ...rest } = timeBlock;
    const result = await db
      .insert(timeBlocks)
      .values({
        ...rest,
        date: new Date(date),
      })
      .returning();
    return result[0];
  }

  async updateTimeBlock(id: number, timeBlock: Partial<TimeBlock>): Promise<TimeBlock | undefined> {
    const result = await db.update(timeBlocks).set(timeBlock).where(eq(timeBlocks.id, id)).returning();
    return result[0];
  }

  async deleteTimeBlock(id: number): Promise<void> {
    await db.delete(timeBlocks).where(eq(timeBlocks.id, id));
  }
}

export const storage = new PostgresStorage();

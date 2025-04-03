import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high']);
export const categoryEnum = pgEnum('category', ['work', 'personal', 'health', 'education', 'other']);

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: priorityEnum("priority").notNull().default('medium'),
  category: categoryEnum("category").notNull().default('work'),
  completed: boolean("completed").notNull().default(false),
  inProgress: boolean("in_progress").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const timeBlocks = pgTable("time_blocks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id),
  date: timestamp("date").notNull(),
  startTime: text("start_time").notNull(),
  duration: integer("duration").notNull(), // Duration in minutes
  title: text("title").notNull(),
  description: text("description"),
});

export const insertTimeBlockSchema = createInsertSchema(timeBlocks).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TimeBlock = typeof timeBlocks.$inferSelect;
export type InsertTimeBlock = z.infer<typeof insertTimeBlockSchema>;

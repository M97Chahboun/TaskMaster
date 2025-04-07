import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertTimeBlockSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

// Middleware to check if user is authenticated
function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // prefix all routes with /api

  // User routes
  app.get("/api/users/:id", ensureAuthenticated, async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't return the password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Task routes - protected by authentication
  app.get("/api/tasks", ensureAuthenticated, async (req, res) => {
    // Get user ID from authenticated session
    const userId = req.user?.id || 1;

    const tasks = await storage.getTasks(userId);
    res.json(tasks);
  });

  app.get("/api/tasks/backlog", ensureAuthenticated, async (req, res) => {
    // Get user ID from authenticated session
    const userId = req.user?.id || 1;

    const tasks = await storage.getBacklogTasks(userId);
    res.json(tasks);
  });

  app.get("/api/tasks/category/:category", ensureAuthenticated, async (req, res) => {
    // Get user ID from authenticated session
    const userId = req.user?.id || 1;
    const category = req.params.category;

    const tasks = await storage.getTasksByCategory(userId, category);
    res.json(tasks);
  });

  app.get("/api/tasks/:id", ensureAuthenticated, async (req, res) => {
    const taskId = parseInt(req.params.id);

    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid taskId" });
    }

    const task = await storage.getTaskById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if task belongs to the authenticated user
    if (task.userId !== req.user?.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(task);
  });

  app.post("/api/tasks", ensureAuthenticated, async (req, res) => {
    try {
      // Always use the authenticated user's ID
      const taskData = insertTaskSchema.parse({
        ...req.body,
        userId: req.user?.id // Set the user ID from the authenticated session
      });

      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", ensureAuthenticated, async (req, res) => {
    const taskId = parseInt(req.params.id);

    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid taskId" });
    }

    try {
      // Check if the task belongs to the authenticated user
      const existingTask = await storage.getTaskById(taskId);

      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (existingTask.userId !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const task = await storage.updateTask(taskId, req.body);
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", ensureAuthenticated, async (req, res) => {
    const taskId = parseInt(req.params.id);

    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid taskId" });
    }

    // Check if the task belongs to the authenticated user
    const existingTask = await storage.getTaskById(taskId);

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (existingTask.userId !== req.user?.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const deleted = await storage.deleteTask(taskId);
    res.status(204).end();
  });

  // TimeBlock routes - protected by authentication
  app.get("/api/timeblocks", ensureAuthenticated, async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let date: Date | undefined;
    if (req.query.date) {
      date = new Date(req.query.date as string);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
    } else {
      date = new Date(); // Default to today if no date provided
    }

    const timeBlocks = await storage.getTimeBlocks(userId, date);
    res.json(timeBlocks);
  });

  app.get("/api/timeblocks/:id", ensureAuthenticated, async (req, res) => {
    const timeBlockId = parseInt(req.params.id);

    if (isNaN(timeBlockId)) {
      return res.status(400).json({ message: "Invalid timeBlockId" });
    }

    const timeBlocks = await storage.getTimeBlocks(req.user?.id as number, new Date());
    const timeBlock = timeBlocks.find(tb => tb.id === timeBlockId);

    if (!timeBlock) {
      return res.status(404).json({ message: "TimeBlock not found" });
    }

    if (timeBlock.userId !== req.user?.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(timeBlock);
  });

  app.post("/api/timeblocks", ensureAuthenticated, async (req, res) => {
    try {
      console.log("Received timeblock data:", JSON.stringify(req.body));

      // Validate the data with our schema that accepts both string and Date
      // Always use the authenticated user's ID
      const timeBlockData = insertTimeBlockSchema.parse({
        ...req.body,
        userId: req.user?.id // Set the user ID from the authenticated session
      });

      // Ensure date is converted to a Date object
      if (typeof timeBlockData.date === 'string') {
        timeBlockData.date = new Date(timeBlockData.date);
      }

      console.log("Parsed timeblock data:", JSON.stringify(timeBlockData, (key, value) => {
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      }));

      const timeBlock = await storage.createTimeBlock(timeBlockData);
      res.status(201).json(timeBlock);
    } catch (error) {
      console.error("Error creating timeblock:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid timeBlock data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create timeBlock" });
    }
  });

  app.patch("/api/timeblocks/:id", ensureAuthenticated, async (req, res) => {
    const timeBlockId = parseInt(req.params.id);

    if (isNaN(timeBlockId)) {
      return res.status(400).json({ message: "Invalid timeBlockId" });
    }

    try {
      // Check if the timeblock belongs to the authenticated user
      const timeBlocks = await storage.getTimeBlocks(req.user?.id as number, new Date());
      const existingTimeBlock = timeBlocks.find(tb => tb.id === timeBlockId);

      if (!existingTimeBlock) {
        return res.status(404).json({ message: "TimeBlock not found" });
      }

      if (existingTimeBlock.userId !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      console.log("Received timeblock update data:", JSON.stringify(req.body));

      // Handle date conversion if it's present
      const updateData = { ...req.body };
      if (typeof updateData.date === 'string') {
        updateData.date = new Date(updateData.date);
      }

      console.log("Processed update data:", JSON.stringify(updateData, (key, value) => {
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      }));

      const timeBlock = await storage.updateTimeBlock(timeBlockId, updateData);
      res.json(timeBlock);
    } catch (error) {
      console.error("Error updating timeblock:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid timeBlock data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update timeBlock" });
    }
  });

  app.delete("/api/timeblocks/:id", ensureAuthenticated, async (req, res) => {
    const timeBlockId = parseInt(req.params.id);

    if (isNaN(timeBlockId)) {
      return res.status(400).json({ message: "Invalid timeBlockId" });
    }

    // Check if the timeblock belongs to the authenticated user
    const timeBlocks = await storage.getTimeBlocks(req.user?.id as number, new Date());
    const existingTimeBlock = timeBlocks.find(tb => tb.id === timeBlockId);

    if (!existingTimeBlock) {
      return res.status(404).json({ message: "TimeBlock not found" });
    }

    if (existingTimeBlock.userId !== req.user?.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await storage.deleteTimeBlock(timeBlockId);
    res.status(204).end();
  });

  // Statistics routes - protected by authentication
  app.post("/api/stats/completed-tasks", ensureAuthenticated, async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const count = await storage.getCompletedTasksCount(userId, start, end);
    res.json({ count });
  });

  app.post("/api/stats/completion-rate", ensureAuthenticated, async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const rate = await storage.getTaskCompletionRate(userId, start, end);
    res.json({ rate });
  });

  app.get("/api/stats/upcoming-tasks", ensureAuthenticated, async (req, res) => {
    // Get user ID from authenticated session
    const userId = req.user?.id || 1;
    const startDate = new Date(); // Today
    let endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // 7 days from now

    if (req.query.endDate) {
      endDate = new Date(req.query.endDate as string);

      if (isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid endDate format" });
      }
    }

    const upcomingTasks = await storage.getTasksByDueDate(userId, startDate, endDate);
    res.json(upcomingTasks);
  });

  const httpServer = createServer(app);
  return httpServer;
}

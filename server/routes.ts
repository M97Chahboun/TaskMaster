import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertTimeBlockSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return the password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    const userId = parseInt(req.query.userId as string) || 1;
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    
    const tasks = await storage.getTasks(userId);
    res.json(tasks);
  });
  
  app.get("/api/tasks/backlog", async (req, res) => {
    const userId = parseInt(req.query.userId as string) || 1;
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    
    const tasks = await storage.getBacklogTasks(userId);
    res.json(tasks);
  });
  
  app.get("/api/tasks/category/:category", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    const category = req.params.category;
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    
    const tasks = await storage.getTasksByCategory(userId, category);
    res.json(tasks);
  });
  
  app.get("/api/tasks/:id", async (req, res) => {
    const taskId = parseInt(req.params.id);
    
    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid taskId" });
    }
    
    const task = await storage.getTaskById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.json(task);
  });
  
  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  
  app.patch("/api/tasks/:id", async (req, res) => {
    const taskId = parseInt(req.params.id);
    
    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid taskId" });
    }
    
    try {
      const task = await storage.updateTask(taskId, req.body);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });
  
  app.delete("/api/tasks/:id", async (req, res) => {
    const taskId = parseInt(req.params.id);
    
    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid taskId" });
    }
    
    const deleted = await storage.deleteTask(taskId);
    
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.status(204).end();
  });
  
  // TimeBlock routes
  app.get("/api/timeblocks", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    let date = undefined;
    
    if (req.query.date) {
      date = new Date(req.query.date as string);
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
    }
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    
    const timeBlocks = await storage.getTimeBlocks(userId, date);
    res.json(timeBlocks);
  });
  
  app.get("/api/timeblocks/:id", async (req, res) => {
    const timeBlockId = parseInt(req.params.id);
    
    if (isNaN(timeBlockId)) {
      return res.status(400).json({ message: "Invalid timeBlockId" });
    }
    
    const timeBlock = await storage.getTimeBlockById(timeBlockId);
    
    if (!timeBlock) {
      return res.status(404).json({ message: "TimeBlock not found" });
    }
    
    res.json(timeBlock);
  });
  
  app.post("/api/timeblocks", async (req, res) => {
    try {
      console.log("Received timeblock data:", JSON.stringify(req.body));
      
      // Validate the data with our schema that accepts both string and Date
      const timeBlockData = insertTimeBlockSchema.parse(req.body);
      
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
  
  app.patch("/api/timeblocks/:id", async (req, res) => {
    const timeBlockId = parseInt(req.params.id);
    
    if (isNaN(timeBlockId)) {
      return res.status(400).json({ message: "Invalid timeBlockId" });
    }
    
    try {
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
      
      if (!timeBlock) {
        return res.status(404).json({ message: "TimeBlock not found" });
      }
      
      res.json(timeBlock);
    } catch (error) {
      console.error("Error updating timeblock:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid timeBlock data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update timeBlock" });
    }
  });
  
  app.delete("/api/timeblocks/:id", async (req, res) => {
    const timeBlockId = parseInt(req.params.id);
    
    if (isNaN(timeBlockId)) {
      return res.status(400).json({ message: "Invalid timeBlockId" });
    }
    
    const deleted = await storage.deleteTimeBlock(timeBlockId);
    
    if (!deleted) {
      return res.status(404).json({ message: "TimeBlock not found" });
    }
    
    res.status(204).end();
  });
  
  // Statistics routes
  app.get("/api/stats/completed-tasks", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    let startDate = undefined;
    let endDate = undefined;
    
    if (req.query.startDate) {
      startDate = new Date(req.query.startDate as string);
      
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ message: "Invalid startDate format" });
      }
    }
    
    if (req.query.endDate) {
      endDate = new Date(req.query.endDate as string);
      
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid endDate format" });
      }
    }
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    
    const completedCount = await storage.getCompletedTasksCount(userId, startDate, endDate);
    res.json({ count: completedCount });
  });
  
  app.get("/api/stats/completion-rate", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    let startDate = undefined;
    let endDate = undefined;
    
    if (req.query.startDate) {
      startDate = new Date(req.query.startDate as string);
      
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ message: "Invalid startDate format" });
      }
    }
    
    if (req.query.endDate) {
      endDate = new Date(req.query.endDate as string);
      
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid endDate format" });
      }
    }
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    
    const completionRate = await storage.getTaskCompletionRate(userId, startDate, endDate);
    res.json({ rate: completionRate });
  });
  
  app.get("/api/stats/upcoming-tasks", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    const startDate = new Date(); // Today
    let endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // 7 days from now
    
    if (req.query.endDate) {
      endDate = new Date(req.query.endDate as string);
      
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid endDate format" });
      }
    }
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    
    const upcomingTasks = await storage.getTasksByDueDate(userId, startDate, endDate);
    res.json(upcomingTasks);
  });

  const httpServer = createServer(app);
  return httpServer;
}

import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '../shared/schema';
import { eq, sql } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Sample data generators
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const taskTitles = [
  'Complete project proposal',
  'Review code changes',
  'Prepare presentation',
  'Schedule team meeting',
  'Update documentation',
  'Fix critical bug',
  'Deploy to production',
  'Write unit tests',
  'Design new feature',
  'Customer feedback review',
  'Performance optimization',
  'Security audit',
  'Database backup',
  'API integration',
  'Code refactoring',
  'Sprint planning',
  'Bug triage',
  'Feature demo',
  'Technical research',
  'Mentor junior developer',
  'Morning workout',
  'Grocery shopping',
  'Doctor appointment',
  'Read industry news',
  'Practice meditation',
  'Evening run',
  'Meal prep for week',
  'Call parents',
  'Organize workspace',
  'Review budget',
];

const taskDescriptions = [
  'This task requires careful attention to detail and thorough testing.',
  'Collaborate with the team to ensure all requirements are met.',
  'Priority task that needs to be completed by end of week.',
  'Follow up with stakeholders for feedback and approval.',
  'Document all changes and update relevant wikis.',
  'Ensure code quality meets team standards.',
  'Coordinate with DevOps for smooth deployment.',
  'Cover edge cases and error scenarios.',
  'Create mockups and get design team approval.',
  'Analyze feedback and create action items.',
  'Profile application and identify bottlenecks.',
  'Review security protocols and update as needed.',
  'Verify backup integrity and test restore process.',
  'Integrate third-party API and handle errors gracefully.',
  'Improve code maintainability and reduce technical debt.',
  'Define sprint goals and estimate story points.',
  'Prioritize bugs based on severity and impact.',
  'Showcase completed features to stakeholders.',
  'Investigate new technologies and best practices.',
  'Provide guidance and code review for junior team members.',
];

const priorities = ['low', 'medium', 'high'] as const;
const categories = ['work', 'personal', 'health', 'education', 'other'] as const;

// Helper functions
const randomElement = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateUsername = (firstName: string, lastName: string): string => {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 999)}`;
};

const generateEmail = (username: string): string => {
  return `${username}@example.com`;
};

// Seed functions
const createUsers = async (count: number) => {
  console.log(`Creating ${count} users...`);
  const users = [];

  for (let i = 0; i < count; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const username = generateUsername(firstName, lastName);
    const email = generateEmail(username);
    const password = 'password123'; // Default password for all test users

    const hashedPassword = await hashPassword(password);

    const [user] = await db.insert(schema.users).values({
      username,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      email,
    }).returning();

    users.push(user);
    console.log(`  Created user: ${username} (password: password123)`);
  }

  return users;
};

const createTasks = async (users: schema.User[], tasksPerUser: number) => {
  console.log(`Creating ${tasksPerUser} tasks per user...`);
  const now = new Date();
  const future30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const past30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  let totalTasks = 0;

  for (const user of users) {
    for (let i = 0; i < tasksPerUser; i++) {
      const title = randomElement(taskTitles);
      const description = randomElement(taskDescriptions);
      const dueDate = randomDate(past30Days, future30Days);
      const priority = randomElement(priorities);
      const category = randomElement(categories);
      const completed = Math.random() < 0.3; // 30% chance of being completed
      const inProgress = !completed && Math.random() < 0.4; // 40% of remaining in progress

      await db.insert(schema.tasks).values({
        userId: user.id,
        title: `${title} #${i + 1}`,
        description,
        dueDate,
        priority,
        category,
        completed,
        inProgress,
      });

      totalTasks++;
    }

    console.log(`  Created ${tasksPerUser} tasks for user ${user.username}`);
  }

  console.log(`Total tasks created: ${totalTasks}`);
};

const createTimeBlocks = async (users: schema.User[], blocksPerUser: number) => {
  console.log(`Creating ${blocksPerUser} time blocks per user...`);
  const now = new Date();
  const future14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const timeBlockTitles = [
    'Morning standup',
    'Deep work session',
    'Code review',
    'Team sync',
    'Lunch break',
    'Client call',
    'Planning session',
    'Learning time',
    'Email catchup',
    'Break',
  ];

  let totalBlocks = 0;

  for (const user of users) {
    // Get user's tasks for linking
    const userTasks = await db.query.tasks.findMany({
      where: eq(schema.tasks.userId, user.id),
    });

    for (let i = 0; i < blocksPerUser; i++) {
      const date = randomDate(now, future14Days);
      const hour = randomInt(6, 18);
      const minute = randomElement([0, 30]);
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const duration = randomElement([15, 30, 45, 60, 90, 120]);
      const title = randomElement(timeBlockTitles);
      const taskId = userTasks.length > 0 ? randomElement(userTasks).id : null;

      await db.insert(schema.timeBlocks).values({
        userId: user.id,
        taskId,
        date,
        startTime,
        duration,
        title: `${title} ${i + 1}`,
        description: `Scheduled time block for ${title.toLowerCase()}`,
      });

      totalBlocks++;
    }

    console.log(`  Created ${blocksPerUser} time blocks for user ${user.username}`);
  }

  console.log(`Total time blocks created: ${totalBlocks}`);
};

const clearDatabase = async () => {
  console.log('Clearing existing data...');
  await db.delete(schema.timeBlocks);
  await db.delete(schema.tasks);
  await db.delete(schema.users);
  console.log('Database cleared.');
};

const seed = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Configuration
    const USER_COUNT = 5;
    const TASKS_PER_USER = 10;
    const TIME_BLOCKS_PER_USER = 8;

    // Clear existing data
    await clearDatabase();

    // Create users
    const users = await createUsers(USER_COUNT);

    // Create tasks
    await createTasks(users, TASKS_PER_USER);

    // Create time blocks
    await createTimeBlocks(users, TIME_BLOCKS_PER_USER);

    console.log('\n✅ Seeding completed successfully!');
    console.log(`\nSummary:`);
    console.log(`  - Users: ${USER_COUNT}`);
    console.log(`  - Tasks: ${USER_COUNT * TASKS_PER_USER}`);
    console.log(`  - Time Blocks: ${USER_COUNT * TIME_BLOCKS_PER_USER}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seed();

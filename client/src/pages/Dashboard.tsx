import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock, CheckCircle2, Clock } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import DailyPlanner from "@/components/dashboard/DailyPlanner";
import CategorySection from "@/components/dashboard/CategorySection";
import ProductivityChart from "@/components/dashboard/ProductivityChart";
import AddTaskModal from "@/components/tasks/AddTaskModal";
import { getGreeting, getFormattedDate } from "@/utils/dateUtils";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/use-auth";
import type { Task } from "@shared/schema";

export default function Dashboard() {
  const [date] = useState(new Date());
  const { user } = useAuth();

  // Protected route ensures this only renders with valid user
  if (!user?.id) return null;

  const greeting = getGreeting();
  const formattedDate = getFormattedDate(date);

  const { tasks, isLoading, refetch } = useTasks();

  const { data: upcomingTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/stats/upcoming-tasks", { userId: user.id }],
  });

  // Calculate stats based on tasks
  const todayTasks = tasks?.filter((task) => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    const today = new Date();
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  });

  const completedTodayTasks = todayTasks?.filter((task) => task.completed);
  const todayTasksCount = todayTasks?.length || 0;
  const completedTodayCount = completedTodayTasks?.length || 0;
  const todayProgress =
    todayTasksCount > 0 ? (completedTodayCount / todayTasksCount) * 100 : 0;

  const completedWeekCount =
    tasks?.filter((task) => task.completed)?.length || 0;
  const totalTasksCount = tasks?.length || 0;
  const weekProgress =
    totalTasksCount > 0 ? (completedWeekCount / totalTasksCount) * 100 : 0;

  const upcomingDeadlinesCount = upcomingTasks?.length || 0;
  const nextDeadline =
    upcomingTasks && upcomingTasks.length > 0
      ? upcomingTasks[0].title +
        (upcomingTasks[0].dueDate
          ? ` (${new Date(upcomingTasks[0].dueDate).toLocaleDateString()})`
          : "")
      : "No upcoming deadlines";

  const handleTaskAdded = () => {
    refetch();
  };

  return (
    <div>
      {/* Welcome Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {greeting}, {user.name || user.username}!
              </h2>
              <p className="text-muted-foreground mt-1">{formattedDate}</p>
            </div>
            <AddTaskModal onTaskAdded={handleTaskAdded} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <StatCard
              title="Tasks for Today"
              value={todayTasksCount}
              icon={CalendarClock}
              progress={todayProgress}
              progressLabel={`${completedTodayCount}/${todayTasksCount}`}
            />

            <StatCard
              title="Completed This Week"
              value={completedWeekCount}
              icon={CheckCircle2}
              iconColor="text-green-500"
              progress={weekProgress}
              progressLabel={`${Math.round(weekProgress)}%`}
            />

            <StatCard
              title="Upcoming Deadlines"
              value={upcomingDeadlinesCount}
              icon={Clock}
              iconColor="text-yellow-500"
              progressLabel={nextDeadline}
            />
          </div>
        </CardContent>
      </Card>

      {/* Today's Plan Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Today's Plan</h2>
            <Button
              variant="ghost"
              className="text-primary hover:text-primary-dark text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Edit Plan
            </Button>
          </div>

          <DailyPlanner userId={user.id} date={date} />
        </CardContent>
      </Card>

      {/* Tasks By Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <CategorySection
          title="Work Tasks"
          category="work"
          color="primary"
          userId={user.id}
        />

        <CategorySection
          title="Personal Tasks"
          category="personal"
          color="secondary"
          userId={user.id}
        />
      </div>

      {/* Productivity Stats */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <ProductivityChart userId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}

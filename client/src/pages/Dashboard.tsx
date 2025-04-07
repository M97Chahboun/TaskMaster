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
import { Loader2 } from "lucide-react";
import type { Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const [date] = useState(new Date());
  const { user } = useAuth();
  const { tasks, isLoading, refetch } = useTasks();

  const { data: upcomingTasks = [], isLoading: isUpcomingLoading } = useQuery<
    Task[]
  >({
    queryKey: ["/api/stats/upcoming-tasks"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/stats/upcoming-tasks");
      return response.json();
    },
    enabled: !!user,
  });

  if (!user?.id) return null;

  if (isLoading || isUpcomingLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const greeting = getGreeting();
  const formattedDate = getFormattedDate(date);

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
  const todayProgress = todayTasksCount
    ? (completedTodayCount / todayTasksCount) * 100
    : 0;

  // Weekly stats
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekTasks = tasks?.filter((task) => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate >= weekStart && taskDate <= date;
  });

  const completedWeekTasks = weekTasks?.filter((task) => task.completed);
  const weekTasksCount = weekTasks?.length || 0;
  const completedWeekCount = completedWeekTasks?.length || 0;
  const weekProgress = weekTasksCount
    ? (completedWeekCount / weekTasksCount) * 100
    : 0;

  const handleTaskAdded = () => {
    refetch();
  };

  return (
    <div>
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
              progressLabel={`${completedWeekCount}/${weekTasksCount}`}
            />

            <StatCard
              title="Upcoming Tasks"
              value={upcomingTasks.length}
              icon={Clock}
              iconColor="text-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Daily Planning Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Daily Schedule</h2>
            <Button variant="outline" size="sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-4 h-4 mr-2"
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

          <DailyPlanner date={date} />
        </CardContent>
      </Card>

      {/* Tasks By Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <CategorySection title="Work Tasks" category="work" color="primary" />
        <CategorySection
          title="Personal Tasks"
          category="personal"
          color="secondary"
        />
      </div>

      {/* Productivity Stats */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">Weekly Productivity</h2>
          <ProductivityChart />
        </CardContent>
      </Card>
    </div>
  );
}

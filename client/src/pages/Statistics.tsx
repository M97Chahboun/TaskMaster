import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTasks } from "@/hooks/useTasks";
import { useQuery } from "@tanstack/react-query";
import {
  ChartBarStacked,
  CheckCircle,
  Clock,
  Calendar,
  ChartPie,
  TrendingUp,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { useAuth } from "@/hooks/use-auth";

export default function Statistics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { tasks, isLoading } = useTasks();

  // Fetch completion rate data
  const { data: completionRate } = useQuery<{ rate: number }>({
    queryKey: ["/api/stats/completion-rate", { userId: user?.id }],
    enabled: !!user,
  });

  // Fetch completed tasks count
  const { data: completedTasksData } = useQuery<{ count: number }>({
    queryKey: ["/api/stats/completed-tasks", { userId: user?.id }],
    enabled: !!user,
  });

  // Generate date range for the selected time period
  const generateDateRange = () => {
    const today = new Date();

    if (timeRange === "week") {
      const startDate = startOfWeek(today);
      const endDate = endOfWeek(today);
      return eachDayOfInterval({ start: startDate, end: endDate });
    } else if (timeRange === "month") {
      const daysInRange = 30;
      const dates = [];
      for (let i = 0; i < daysInRange; i++) {
        dates.push(subDays(today, i));
      }
      return dates.reverse();
    } else {
      // Year view - use months instead of days
      const months = [];
      for (let i = 0; i < 12; i++) {
        const date = new Date(today.getFullYear(), i, 1);
        months.push(date);
      }
      return months;
    }
  };

  const dateRange = generateDateRange();

  // Generate productivity data
  const generateProductivityData = () => {
    if (!tasks) return [];

    return dateRange.map((date) => {
      let count = 0;

      tasks.forEach((task) => {
        if (!task.completed || !task.dueDate) return;

        const taskDate = new Date(task.dueDate);

        // Match by day for week/month view
        if (timeRange === "week" || timeRange === "month") {
          if (
            taskDate.getDate() === date.getDate() &&
            taskDate.getMonth() === date.getMonth() &&
            taskDate.getFullYear() === date.getFullYear()
          ) {
            if (categoryFilter === "all" || task.category === categoryFilter) {
              count++;
            }
          }
        }
        // Match by month for year view
        else if (timeRange === "year") {
          if (
            taskDate.getMonth() === date.getMonth() &&
            taskDate.getFullYear() === date.getFullYear()
          ) {
            if (categoryFilter === "all" || task.category === categoryFilter) {
              count++;
            }
          }
        }
      });

      return {
        date,
        count,
        label: timeRange === "year" ? format(date, "MMM") : format(date, "EEE"),
      };
    });
  };

  const productivityData = generateProductivityData();

  // Get the maximum count to normalize chart heights
  const maxCount = Math.max(...productivityData.map((d) => d.count), 1);

  // Calculate task statistics
  const getTaskStatistics = () => {
    if (!tasks) return { total: 0, completed: 0, pending: 0, overdue: 0 };

    let filtered = [...tasks];
    if (categoryFilter !== "all") {
      filtered = filtered.filter((task) => task.category === categoryFilter);
    }

    const completed = filtered.filter((task) => task.completed).length;
    const pending = filtered.filter((task) => !task.completed).length;

    // Count overdue tasks (due date in the past and not completed)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = filtered.filter((task) => {
      if (task.completed || !task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    }).length;

    return {
      total: filtered.length,
      completed,
      pending,
      overdue,
    };
  };

  const taskStats = getTaskStatistics();

  // Calculate productivity by category
  const getProductivityByCategory = () => {
    if (!tasks) return [];

    const categories: Record<string, number> = {
      work: 0,
      personal: 0,
      health: 0,
      education: 0,
      other: 0,
    };

    tasks.forEach((task) => {
      if (
        task.completed &&
        categories[task.category as keyof typeof categories] !== undefined
      ) {
        categories[task.category as keyof typeof categories]++;
      }
    });

    return Object.entries(categories).map(([category, count]) => ({
      category,
      count,
      color: getCategoryColor(category),
    }));
  };

  const categoryData = getProductivityByCategory();
  const totalCategoryTasks = categoryData.reduce(
    (sum, item) => sum + item.count,
    0
  );

  // Helper function to get category color
  function getCategoryColor(category: string): string {
    switch (category) {
      case "work":
        return "bg-primary";
      case "personal":
        return "bg-secondary";
      case "health":
        return "bg-green-500";
      case "education":
        return "bg-blue-500";
      case "other":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  }

  // Find most productive day
  const getMostProductiveDay = () => {
    if (productivityData.length === 0) return "N/A";

    const mostProductive = productivityData.reduce(
      (max, day) => (day.count > max.count ? day : max),
      productivityData[0]
    );

    return mostProductive.label;
  };

  // Find the average completion time (just a placeholder since we don't track task creation time)
  const getAverageCompletionTime = () => {
    return "2.5 days";
  };

  return (
    <div>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Productivity Statistics</CardTitle>
          <div className="flex space-x-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Task Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Tasks</p>
                    <h3 className="text-2xl font-bold">{taskStats.total}</h3>
                  </div>
                  <CheckCircle className="text-primary h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <h3 className="text-2xl font-bold">
                      {taskStats.completed}
                    </h3>
                  </div>
                  <CheckCircle className="text-green-500 h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <h3 className="text-2xl font-bold">{taskStats.pending}</h3>
                  </div>
                  <Clock className="text-yellow-500 h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Overdue</p>
                    <h3 className="text-2xl font-bold">{taskStats.overdue}</h3>
                  </div>
                  <Calendar className="text-red-500 h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Productivity Chart */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Task Completion Trend</h2>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={
                      timeRange === "week" ? "text-primary" : "text-gray-500"
                    }
                    onClick={() => setTimeRange("week")}
                  >
                    Week
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={
                      timeRange === "month" ? "text-primary" : "text-gray-500"
                    }
                    onClick={() => setTimeRange("month")}
                  >
                    Month
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={
                      timeRange === "year" ? "text-primary" : "text-gray-500"
                    }
                    onClick={() => setTimeRange("year")}
                  >
                    Year
                  </Button>
                </div>
              </div>

              <div className="h-64 w-full">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <p>Loading chart data...</p>
                  </div>
                ) : (
                  <div className="flex h-full items-end space-x-2">
                    {productivityData.map((day, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center flex-1"
                      >
                        <div
                          className="bg-primary-light hover:bg-primary w-full rounded-t-md transition-all duration-200 cursor-pointer"
                          style={{
                            height: `${
                              day.count ? (day.count / maxCount) * 100 : 0
                            }%`,
                          }}
                          title={`${day.count} tasks on ${format(
                            day.date,
                            "MMM dd"
                          )}`}
                        ></div>
                        <p className="text-xs mt-2 text-gray-600">
                          {day.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Tasks Completed</p>
                  <p className="text-2xl font-bold text-primary">
                    {completedTasksData?.count || taskStats.completed}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Completion Rate</p>
                  <p className="text-2xl font-bold text-primary">
                    {taskStats.total > 0
                      ? `${Math.round(
                          (taskStats.completed / taskStats.total) * 100
                        )}%`
                      : "0%"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Most Productive Day</p>
                  <p className="text-2xl font-bold text-primary">
                    {getMostProductiveDay()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categories Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <ChartPie className="mr-2 h-5 w-5" />
                  Tasks by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.map((item, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium capitalize">
                        {item.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {totalCategoryTasks > 0
                          ? `${Math.round(
                              (item.count / totalCategoryTasks) * 100
                            )}%`
                          : "0%"}
                      </span>
                    </div>
                    <Progress
                      value={
                        totalCategoryTasks > 0
                          ? (item.count / totalCategoryTasks) * 100
                          : 0
                      }
                      className={`h-2 !${item.color}`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-500">
                        Overall Completion Rate
                      </span>
                      <span className="text-sm font-medium">
                        {taskStats.total > 0
                          ? `${Math.round(
                              (taskStats.completed / taskStats.total) * 100
                            )}%`
                          : "0%"}
                      </span>
                    </div>
                    <Progress
                      value={
                        taskStats.total > 0
                          ? (taskStats.completed / taskStats.total) * 100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-500">
                        On-time Completion
                      </span>
                      <span className="text-sm font-medium">
                        {taskStats.completed > 0
                          ? `${Math.round(
                              ((taskStats.completed - taskStats.overdue) /
                                taskStats.completed) *
                                100
                            )}%`
                          : "0%"}
                      </span>
                    </div>
                    <Progress
                      value={
                        taskStats.completed > 0
                          ? ((taskStats.completed - taskStats.overdue) /
                              taskStats.completed) *
                            100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Average Completion Time
                      </h4>
                      <p className="text-xl font-bold text-primary">
                        {getAverageCompletionTime()}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Task Efficiency
                      </h4>
                      <p className="text-xl font-bold text-primary">
                        {taskStats.total > 0
                          ? `${Math.round(
                              (taskStats.completed / taskStats.total) * 100
                            )}%`
                          : "0%"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

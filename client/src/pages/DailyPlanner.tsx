import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import DailyPlanner from "@/components/dashboard/DailyPlanner";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarX, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

export default function DailyPlannerPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/tasks");
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch time blocks for the selected date
  const {
    data: timeBlocks,
    isLoading: isLoadingTimeBlocks,
    refetch: refetchTimeBlocks,
  } = useQuery({
    queryKey: [
      "/api/timeblocks",
      { date: selectedDate.toISOString().split("T")[0] },
    ],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/timeblocks?date=${selectedDate.toISOString().split("T")[0]}`
      );
      return response.json();
    },
    enabled: !!user,
  });

  const handlePreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const formattedDate = format(selectedDate, "EEEE, MMMM d, yyyy");

  // Get tasks for the selected date
  const getTasksForSelectedDate = (): Task[] => {
    if (!tasks) return [];

    return tasks.filter((task) => {
      if (!task.dueDate) return false;

      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === selectedDate.getDate() &&
        taskDate.getMonth() === selectedDate.getMonth() &&
        taskDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  };

  const tasksForSelectedDate = getTasksForSelectedDate();

  if (!user) return null;

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daily Planner</CardTitle>
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            Add Time Block
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <Button variant="outline" size="icon" onClick={handlePreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="mx-2 min-w-[240px]">
                    <CalendarX className="mr-2 h-4 w-4" />
                    {formattedDate}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="icon" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-sm">
              <span className="font-medium">{tasksForSelectedDate.length}</span>{" "}
              tasks due
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <h3 className="font-medium mb-4">Time Blocks</h3>
              <DailyPlanner date={selectedDate} />
            </div>

            <div className="lg:col-span-2">
              <h3 className="font-medium mb-4">Tasks Due Today</h3>
              {isLoading ? (
                <div className="text-center py-10">Loading tasks...</div>
              ) : tasksForSelectedDate.length > 0 ? (
                <div className="space-y-3">
                  {tasksForSelectedDate.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "p-3 rounded-md border",
                        task.completed
                          ? "bg-gray-50 border-gray-200"
                          : "bg-white border-gray-200"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4
                            className={cn(
                              "font-medium",
                              task.completed && "line-through text-gray-500"
                            )}
                          >
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <div className="ml-2">
                          <span
                            className={cn(
                              "text-xs px-2 py-1 rounded-full text-white",
                              task.priority === "high"
                                ? "bg-red-500"
                                : task.priority === "medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            )}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p>No tasks due on this date</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

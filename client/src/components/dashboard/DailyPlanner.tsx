import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TimeBlock } from "@shared/schema";
import { formatDate } from "@/utils/dateUtils";
import { apiRequest } from "@/lib/queryClient";
import TimeBlockForm from "@/components/tasks/TimeBlockForm";
import TaskBacklog from "@/components/dashboard/TaskBacklog";
import { format, addDays, subDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";

interface DailyPlannerProps {
  date?: Date;
}

export default function DailyPlanner({ date = new Date() }: DailyPlannerProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(date);
  const [isTimeBlockFormOpen, setIsTimeBlockFormOpen] = useState(false);
  const [editingTimeBlock, setEditingTimeBlock] = useState<
    TimeBlock | undefined
  >(undefined);
  const queryClient = useQueryClient();

  const formattedDate = formatDate(selectedDate);

  // Fetch time blocks for the selected date
  const { data: timeBlocks = [], isLoading } = useQuery<TimeBlock[]>({
    queryKey: ["/api/timeblocks", { date: formattedDate }],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/timeblocks?date=${formattedDate}`
      );
      const data = await response.json();
      return data as TimeBlock[];
    },
    enabled: !!user,
  });

  const handlePreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  const handleAddTimeBlock = () => {
    setEditingTimeBlock(undefined);
    setIsTimeBlockFormOpen(true);
  };

  const handleEditTimeBlock = (timeBlock: TimeBlock) => {
    setEditingTimeBlock(timeBlock);
    setIsTimeBlockFormOpen(true);
  };

  const handleTimeBlockFormSuccess = () => {
    setIsTimeBlockFormOpen(false);
    queryClient.invalidateQueries({ queryKey: ["/api/timeblocks"] });
  };

  const handleTimeBlockFormCancel = () => {
    setIsTimeBlockFormOpen(false);
  };

  // Function to get the border color based on the time block
  const getTimeBlockColor = (timeBlock: TimeBlock) => {
    if (!timeBlock.taskId) {
      if (
        timeBlock.title.toLowerCase().includes("break") ||
        timeBlock.title.toLowerCase().includes("lunch")
      ) {
        return "border-gray-300";
      }
      return "border-primary";
    }

    // Determine color based on time block title or content
    if (
      timeBlock.title.toLowerCase().includes("meeting") ||
      timeBlock.title.toLowerCase().includes("call")
    ) {
      return "border-primary";
    } else if (
      timeBlock.title.toLowerCase().includes("research") ||
      timeBlock.title.toLowerCase().includes("learn")
    ) {
      return "border-green-500";
    } else if (
      timeBlock.title.toLowerCase().includes("review") ||
      timeBlock.title.toLowerCase().includes("feedback")
    ) {
      return "border-yellow-500";
    } else if (
      timeBlock.title.toLowerCase().includes("deadline") ||
      timeBlock.title.toLowerCase().includes("urgent")
    ) {
      return "border-red-500";
    }

    return "border-blue-500";
  };

  // Function to get background color based on border color with dark mode support
  const getBackgroundColor = (borderColor: string) => {
    if (borderColor === "border-gray-300") return "dark:bg-gray-800";
    if (borderColor === "border-primary")
      return "bg-primary/5 dark:bg-primary/10";
    if (borderColor === "border-green-500")
      return "bg-green-50 dark:bg-green-900/20";
    if (borderColor === "border-yellow-500")
      return "bg-yellow-50 dark:bg-yellow-900/20";
    if (borderColor === "border-red-500") return "bg-red-50 dark:bg-red-900/20";
    if (borderColor === "border-blue-500")
      return "bg-blue-50 dark:bg-blue-900/20";
    return "dark:bg-gray-800";
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hoursNum = parseInt(hours);
    const ampm = hoursNum >= 12 ? "PM" : "AM";
    const formattedHours = hoursNum % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  if (isLoading) {
    return <div className="py-4">Loading daily plan...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Date navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" onClick={handlePreviousDay}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[150px]">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {format(selectedDate, "MMM d, yyyy")}
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

        <Button variant="outline" size="sm" onClick={handleNextDay}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {timeBlocks && timeBlocks.length > 0 ? (
        timeBlocks.map((block: TimeBlock) => {
          const borderColor = getTimeBlockColor(block);
          const bgColor = getBackgroundColor(borderColor);

          return (
            <div
              key={block.id}
              className={cn(
                "flex items-start border-l-4 pl-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/90 transition-colors",
                borderColor,
                bgColor
              )}
              onClick={() => handleEditTimeBlock(block)}
            >
              <div className="w-16 flex-shrink-0 text-gray-500 dark:text-gray-400 text-sm">
                {formatTime(block.startTime)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium dark:text-gray-200">
                    {block.title}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDuration(block.duration)}
                  </span>
                </div>
                {block.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {block.description}
                  </p>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No time blocks scheduled for this day
        </div>
      )}

      <div
        className="flex items-center justify-center border-dashed border-2 border-gray-200 dark:border-gray-700 rounded-md p-4 text-gray-400 dark:text-gray-500 cursor-pointer hover:border-primary hover:text-primary dark:hover:text-primary"
        onClick={handleAddTimeBlock}
      >
        <PlusCircle className="mr-2 h-5 w-5" />
        Add Time Block
      </div>

      {/* Task Backlog section */}
      <TaskBacklog selectedDate={selectedDate} />

      {/* Time Block Form */}
      <TimeBlockForm
        open={isTimeBlockFormOpen}
        onSuccess={handleTimeBlockFormSuccess}
        onCancel={handleTimeBlockFormCancel}
        timeBlock={editingTimeBlock}
        selectedDate={selectedDate}
      />
    </div>
  );
}

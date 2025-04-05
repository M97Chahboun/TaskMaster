import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { TimeBlock } from "@shared/schema";
import { formatDate } from "@/utils/dateUtils";

interface DailyPlannerProps {
  userId: number;
  date?: Date;
}

export default function DailyPlanner({ userId, date = new Date() }: DailyPlannerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(date);
  
  const formattedDate = formatDate(selectedDate);
  
  const { data: timeBlocks = [], isLoading } = useQuery<TimeBlock[]>({
    queryKey: ['/api/timeblocks', { userId, date: formattedDate }],
  });
  
  // Function to get the border color based on the time block
  const getTimeBlockColor = (timeBlock: TimeBlock) => {
    if (!timeBlock.taskId) {
      if (timeBlock.title.toLowerCase().includes('break') || 
          timeBlock.title.toLowerCase().includes('lunch')) {
        return 'border-gray-300';
      }
      return 'border-primary';
    }
    
    // Determine color based on time block title or content
    if (timeBlock.title.toLowerCase().includes('meeting') || 
        timeBlock.title.toLowerCase().includes('call')) {
      return 'border-primary';
    } else if (timeBlock.title.toLowerCase().includes('research') || 
               timeBlock.title.toLowerCase().includes('learn')) {
      return 'border-green-500';
    } else if (timeBlock.title.toLowerCase().includes('review') || 
               timeBlock.title.toLowerCase().includes('feedback')) {
      return 'border-yellow-500';
    } else if (timeBlock.title.toLowerCase().includes('deadline') || 
               timeBlock.title.toLowerCase().includes('urgent')) {
      return 'border-red-500';
    }
    
    return 'border-blue-500';
  };
  
  // Function to get background color based on border color with dark mode support
  const getBackgroundColor = (borderColor: string) => {
    if (borderColor === 'border-gray-300') return 'dark:bg-gray-800';
    if (borderColor === 'border-primary') return 'bg-primary/5 dark:bg-primary/10';
    if (borderColor === 'border-green-500') return 'bg-green-50 dark:bg-green-900/20';
    if (borderColor === 'border-yellow-500') return 'bg-yellow-50 dark:bg-yellow-900/20';
    if (borderColor === 'border-red-500') return 'bg-red-50 dark:bg-red-900/20';
    if (borderColor === 'border-blue-500') return 'bg-blue-50 dark:bg-blue-900/20';
    return 'dark:bg-gray-800';
  };
  
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hoursNum = parseInt(hours);
    const ampm = hoursNum >= 12 ? 'PM' : 'AM';
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
      {timeBlocks && timeBlocks.length > 0 ? (
        timeBlocks.map((block: TimeBlock) => {
          const borderColor = getTimeBlockColor(block);
          const bgColor = getBackgroundColor(borderColor);
          
          return (
            <div 
              key={block.id} 
              className={cn(
                "flex items-start border-l-4 pl-4 py-2", 
                borderColor,
                bgColor
              )}
            >
              <div className="w-16 flex-shrink-0 text-gray-500 dark:text-gray-400 text-sm">
                {formatTime(block.startTime)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium dark:text-gray-200">{block.title}</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{formatDuration(block.duration)}</span>
                </div>
                {block.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{block.description}</p>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No time blocks scheduled for today
        </div>
      )}
      
      <div className="flex items-center justify-center border-dashed border-2 border-gray-200 dark:border-gray-700 rounded-md p-4 text-gray-400 dark:text-gray-500 cursor-pointer hover:border-primary hover:text-primary dark:hover:text-primary">
        <PlusCircle className="mr-2 h-5 w-5" />
        Add Time Block
      </div>
    </div>
  );
}

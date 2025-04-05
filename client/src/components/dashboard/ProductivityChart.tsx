import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ProductivityChartProps {
  userId: number;
}

interface WeeklyData {
  day: string;
  count: number;
  date: Date;
}

export default function ProductivityChart({ userId }: ProductivityChartProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'lastWeek' | 'month'>('week');
  
  interface CompletionRateResponse {
    rate: number;
  }
  
  interface CompletedTasksResponse {
    count: number;
  }
  
  const { data: completionRate = { rate: 0 } } = useQuery<CompletionRateResponse>({
    queryKey: ['/api/stats/completion-rate', { userId }],
  });
  
  const { data: completedTasks = { count: 0 } } = useQuery<CompletedTasksResponse>({
    queryKey: ['/api/stats/completed-tasks', { userId }],
  });
  
  // Generate mock data for the chart
  // In a real app, this would come from the API
  const generateWeeklyData = (): WeeklyData[] => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const result: WeeklyData[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() - dayOfWeek + i + 1);
      
      // Generate heights as percentages (0-100)
      let height;
      if (timeRange === 'week') {
        height = i === 3 ? 80 : Math.floor(Math.random() * 60) + 15;
      } else if (timeRange === 'lastWeek') {
        height = i === 1 ? 75 : Math.floor(Math.random() * 60) + 10;
      } else {
        height = i === 5 ? 85 : Math.floor(Math.random() * 70) + 5;
      }
      
      result.push({
        day: days[i],
        count: height,
        date
      });
    }
    
    return result;
  };
  
  const weeklyData = generateWeeklyData();
  
  const getMostProductiveDay = (): string => {
    if (!weeklyData.length) return 'N/A';
    
    const maxDay = weeklyData.reduce((max, day) => 
      day.count > max.count ? day : max, 
      weeklyData[0]
    );
    
    return maxDay.day;
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Weekly Productivity</h2>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            className={timeRange === 'week' ? 'text-primary' : 'text-gray-500'}
            onClick={() => setTimeRange('week')}
          >
            This Week
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={timeRange === 'lastWeek' ? 'text-primary' : 'text-gray-500'}
            onClick={() => setTimeRange('lastWeek')}
          >
            Last Week
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={timeRange === 'month' ? 'text-primary' : 'text-gray-500'}
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
        </div>
      </div>
      
      <div className="h-64 w-full">
        <div className="flex h-full items-end space-x-2">
          {weeklyData.map((day, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className={`bg-primary/20 hover:bg-primary w-full rounded-t-md transition-all duration-200`} 
                style={{ height: `${day.count}%` }}
              ></div>
              <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">{day.day}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Tasks Completed</p>
          <p className="text-2xl font-bold text-primary">
            {completedTasks.count}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
          <p className="text-2xl font-bold text-primary">
            {`${Math.round(completionRate.rate)}%`}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Most Productive Day</p>
          <p className="text-2xl font-bold text-primary">{getMostProductiveDay()}</p>
        </div>
      </div>
    </div>
  );
}

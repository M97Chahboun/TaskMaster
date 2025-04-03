import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Italic } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: Italic;
  iconColor?: string;
  progress?: number;
  progressLabel?: string;
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = "text-primary",
  progress,
  progressLabel
}: StatCardProps) {
  return (
    <Card className="bg-gray-50">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <Icon className={`${iconColor} h-5 w-5`} />
        </div>
        
        {progress !== undefined && (
          <div className="mt-2 flex items-center">
            <Progress value={progress} className="h-2 w-full" />
            {progressLabel && <span className="ml-2 text-sm text-gray-600">{progressLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

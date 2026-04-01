import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  progress?: number;
  progressLabel?: string;
  className?: string;
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = "text-primary",
  progress,
  progressLabel,
  className
}: StatCardProps) {
  return (
    <Card className={cn(
      "bg-card/50 dark:bg-card border-0 shadow-sm hover:shadow-md transition-shadow",
      "dark:shadow-none dark:hover:shadow-none dark:border dark:border-border/50",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2">
            <p className="text-muted-foreground dark:text-muted-foreground/80 text-sm font-medium">{title}</p>
            <h3 className="text-3xl font-bold tracking-tight text-foreground dark:text-foreground/90">{value}</h3>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 dark:bg-muted">
            <Icon className={`${iconColor} h-6 w-6`} />
          </div>
        </div>
        
        {progress !== undefined && (
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              {progressLabel && <span className="font-medium">{progressLabel}</span>}
            </div>
            <Progress 
              value={progress} 
              className="h-2 w-full [&>div]:bg-primary"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

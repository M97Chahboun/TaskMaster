import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import TimeBlockForm from "@/components/tasks/TimeBlockForm";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getPriorityColor } from "@/utils/taskUtils";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface TaskBacklogProps {
  selectedDate: Date;
}

export default function TaskBacklog({ selectedDate }: TaskBacklogProps) {
  const { user } = useAuth();
  const [isTimeBlockFormOpen, setIsTimeBlockFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  // Fetch tasks without a due date (backlog tasks)
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks/backlog"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/tasks/backlog");
      const data = await response.json();
      return data as Task[];
    },
    enabled: !!user,
  });

  const handleAddToSchedule = (task: Task) => {
    setSelectedTask(task);
    setIsTimeBlockFormOpen(true);
  };

  const handleTimeBlockFormSuccess = () => {
    setIsTimeBlockFormOpen(false);
  };

  const handleTimeBlockFormCancel = () => {
    setIsTimeBlockFormOpen(false);
  };

  if (isLoading) {
    return <div className="py-2">Loading task backlog...</div>;
  }

  // If no backlog tasks, don't show this component
  if (tasks.length === 0) {
    return null;
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="mt-6 bg-card border rounded-md"
    >
      <CollapsibleTrigger asChild>
        <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-accent/50">
          <h3 className="text-lg font-medium">Task Backlog ({tasks.length})</h3>
          <Button variant="ghost" size="sm">
            {isOpen ? "Hide" : "Show"}
          </Button>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className="border hover:border-primary transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center"
                    onClick={() => handleAddToSchedule(task)}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add to Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CollapsibleContent>

      {/* Time Block Form */}
      {selectedTask && (
        <TimeBlockForm
          open={isTimeBlockFormOpen}
          onSuccess={handleTimeBlockFormSuccess}
          onCancel={handleTimeBlockFormCancel}
          timeBlock={{
            taskId: selectedTask.id,
            title: selectedTask.title,
            description: selectedTask.description || "",
          }}
          selectedDate={selectedDate}
        />
      )}
    </Collapsible>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import TaskCard from "@/components/tasks/TaskCard";
import AddTaskModal from "@/components/tasks/AddTaskModal";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@shared/schema";
import { sortTasksByDueDate, sortTasksByPriority } from "@/utils/taskUtils";
import { Search, Plus } from "lucide-react";

export default function AllTasks() {
  const userId = 1; // Default user ID
  const { tasks, isLoading, refetch } = useTasks(userId);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("priority");
  const [activeTab, setActiveTab] = useState("all");
  
  const handleTaskAdded = () => {
    refetch();
  };
  
  // Filter and sort tasks
  const filterTasks = (taskList: Task[] | undefined): Task[] => {
    if (!taskList) return [];
    
    // Apply tab filter
    let filtered = [...taskList];
    if (activeTab === "completed") {
      filtered = filtered.filter(task => task.completed);
    } else if (activeTab === "pending") {
      filtered = filtered.filter(task => !task.completed);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) || 
        (task.description?.toLowerCase().includes(query) || false)
      );
    }
    
    // Apply sorting
    if (sortOption === "dueDate") {
      return sortTasksByDueDate(filtered);
    } else if (sortOption === "priority") {
      return sortTasksByPriority(filtered);
    }
    
    return filtered;
  };
  
  const filteredTasks = filterTasks(tasks);
  
  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Tasks</CardTitle>
          <AddTaskModal onTaskAdded={handleTaskAdded} />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={sortOption}
                onValueChange={setSortOption}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Sort by Priority</SelectItem>
                  <SelectItem value="dueDate">Sort by Due Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-10">Loading tasks...</div>
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={refetch}
                  />
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p className="mb-4">No tasks found</p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear filters
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-10">Loading tasks...</div>
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={refetch}
                  />
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p className="mb-4">No pending tasks found</p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear filters
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-10">Loading tasks...</div>
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={refetch}
                  />
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p className="mb-4">No completed tasks found</p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear filters
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

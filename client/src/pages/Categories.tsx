import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import TaskCard from "@/components/tasks/TaskCard";
import AddTaskModal from "@/components/tasks/AddTaskModal";
import { useQuery } from "@tanstack/react-query";
import { Plus, ChartBar } from "lucide-react";

export default function Categories() {
  const userId = 1; // Default user ID
  const [activeCategory, setActiveCategory] = useState("work");
  
  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ['/api/tasks/category/' + activeCategory, { userId }],
  });
  
  const handleTaskAdded = () => {
    refetch();
  };
  
  // Statistics for the active category
  const completedTasks = tasks?.filter(task => task.completed) || [];
  const completionRate = tasks?.length ? (completedTasks.length / tasks.length) * 100 : 0;
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>;
      case 'personal':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>;
      case 'health':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>;
      case 'education':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>;
      default:
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>;
    }
  };
  
  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categories</CardTitle>
          <AddTaskModal 
            onTaskAdded={handleTaskAdded}
          />
        </CardHeader>
        <CardContent>
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="mb-6">
              <TabsTrigger value="work" className="flex items-center">
                {getCategoryIcon('work')}
                <span className="ml-2">Work</span>
              </TabsTrigger>
              <TabsTrigger value="personal" className="flex items-center">
                {getCategoryIcon('personal')}
                <span className="ml-2">Personal</span>
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center">
                {getCategoryIcon('health')}
                <span className="ml-2">Health</span>
              </TabsTrigger>
              <TabsTrigger value="education" className="flex items-center">
                {getCategoryIcon('education')}
                <span className="ml-2">Education</span>
              </TabsTrigger>
              <TabsTrigger value="other" className="flex items-center">
                {getCategoryIcon('other')}
                <span className="ml-2">Other</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <Card className="col-span-1 bg-primary bg-opacity-5">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <ChartBar className="h-5 w-5 mr-1.5 text-primary" />
                    <h3 className="font-medium">Category Stats</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Total Tasks</p>
                      <p className="text-2xl font-bold text-primary">{tasks?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Completed</p>
                      <p className="text-2xl font-bold text-primary">{completedTasks.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Completion Rate</p>
                      <p className="text-2xl font-bold text-primary">{Math.round(completionRate)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="col-span-1 lg:col-span-3">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="font-medium">Tasks in this category</h3>
                  <Button variant="outline" size="sm" className="text-primary">
                    <Plus className="h-4 w-4 mr-1" />
                    Add {activeCategory} task
                  </Button>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-10">Loading tasks...</div>
                ) : tasks && tasks.length > 0 ? (
                  <div className="space-y-3">
                    {tasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onUpdate={refetch}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <p className="mb-4">No tasks in this category</p>
                    <Button onClick={() => {
                      setActiveCategory('work');
                    }}>
                      View Work Tasks
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

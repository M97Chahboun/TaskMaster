import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import AllTasks from "./pages/AllTasks";
import DailyPlanner from "./pages/DailyPlanner";
import Categories from "./pages/Categories";
import Statistics from "./pages/Statistics";
import KanbanView from "./pages/KanbanView";
import { ThemeProvider } from "./components/theme/theme-provider";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/tasks" component={AllTasks} />
      <Route path="/kanban" component={KanbanView} />
      <Route path="/planner" component={DailyPlanner} />
      <Route path="/categories" component={Categories} />
      <Route path="/statistics" component={Statistics} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="taskmaster-theme">
      <AppLayout>
        <Router />
      </AppLayout>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;

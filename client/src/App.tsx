import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import AllTasks from "./pages/AllTasks";
import DailyPlanner from "./pages/DailyPlanner";
import Categories from "./pages/Categories";
import Statistics from "./pages/Statistics";
import KanbanView from "./pages/KanbanView";
import { ThemeProvider } from "./components/theme/theme-provider";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      {/* Auth page is publicly accessible */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected routes require authentication */}
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/tasks" component={AllTasks} />
      <ProtectedRoute path="/kanban" component={KanbanView} />
      <ProtectedRoute path="/planner" component={DailyPlanner} />
      <ProtectedRoute path="/categories" component={Categories} />
      <ProtectedRoute path="/statistics" component={Statistics} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="taskmaster-theme">
      <AuthProvider>
        <AppLayout>
          <Router />
        </AppLayout>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

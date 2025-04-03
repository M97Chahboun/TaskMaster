import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import AllTasks from "./pages/AllTasks";
import DailyPlanner from "./pages/DailyPlanner";
import Categories from "./pages/Categories";
import Statistics from "./pages/Statistics";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/tasks" component={AllTasks} />
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
    <>
      <AppLayout>
        <Router />
      </AppLayout>
      <Toaster />
    </>
  );
}

export default App;

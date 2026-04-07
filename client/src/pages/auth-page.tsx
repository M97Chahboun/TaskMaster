import React, { useState } from "react";
import { Redirect, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { Calendar, CheckCircle2, Clock, ListTodo } from "lucide-react";

export default function AuthPage() {
  const { user } = useAuth();
  const [location] = useLocation();

  // Get the redirect URL and initial tab from query parameters
  const params = new URLSearchParams(window.location.search);
  const redirectTo = params.get("redirect") || "/dashboard";
  const initialTab = params.get("tab") === "register" ? "register" : "login";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Redirect if user is already authenticated
  if (user) {
    return <Redirect to={redirectTo} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Form Side */}
      <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">TaskMaster</h1>
            <p className="text-muted-foreground mt-2">
              Organize your tasks and boost your productivity
            </p>
          </div>

          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4">
              <LoginForm redirectTo={redirectTo} />
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => setActiveTab("register")}
                  >
                    Register now
                  </Button>
                </p>
              </div>
            </TabsContent>
            <TabsContent value="register" className="space-y-4">
              <RegisterForm redirectTo={redirectTo} />
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => setActiveTab("login")}
                  >
                    Log in
                  </Button>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hero Side */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-primary/10 to-primary/20 hidden md:flex items-center justify-center p-10">
        <div className="max-w-md text-center">
          <h2 className="text-4xl font-bold mb-6">
            Supercharge Your Productivity
          </h2>
          <div className="space-y-6">
            <FeatureItem
              icon={ListTodo}
              title="Smart Task Management"
              description="Organize tasks by priority, category, and due date"
            />
            <FeatureItem
              icon={Calendar}
              title="Daily Planning"
              description="Plan your day with a visual schedule and time blocking"
            />
            <FeatureItem
              icon={CheckCircle2}
              title="Progress Tracking"
              description="Monitor your productivity with detailed statistics"
            />
            <FeatureItem
              icon={Clock}
              title="Kanban Workflow"
              description="Visualize your workflow with a drag-and-drop Kanban board"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="rounded-full bg-primary/20 p-3">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-medium">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

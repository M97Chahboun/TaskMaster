import { Link, useLocation } from "wouter";
import {
  ChartBar,
  CheckCircle,
  PanelLeft,
  CheckSquare,
  Calendar,
  Tag,
  Trello,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <PanelLeft className="w-5 h-5 mr-3" />,
    },
    {
      href: "/tasks",
      label: "All Tasks",
      icon: <CheckSquare className="w-5 h-5 mr-3" />,
    },
    {
      href: "/kanban",
      label: "Kanban Board",
      icon: <Trello className="w-5 h-5 mr-3" />,
    },
    {
      href: "/planner",
      label: "Daily Planner",
      icon: <Calendar className="w-5 h-5 mr-3" />,
    },
    {
      href: "/categories",
      label: "Categories",
      icon: <Tag className="w-5 h-5 mr-3" />,
    },
    {
      href: "/statistics",
      label: "Statistics",
      icon: <ChartBar className="w-5 h-5 mr-3" />,
    },
  ];

  return (
    <div className="hidden md:block w-64 bg-card shadow-md z-10 flex-shrink-0">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold text-primary flex items-center">
          <CheckCircle className="w-6 h-6 mr-2" />
          TaskMaster
        </h1>
      </div>
      <div className="p-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center p-2 rounded-md ${
                location === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 w-64 p-4 border-t border-border">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
            {user?.name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("") ||
              user?.username?.[0]?.toUpperCase() ||
              "U"}
          </div>
          <div>
            <p className="text-sm font-medium">
              {user?.name || user?.username}
            </p>
            {user?.email && (
              <p className="text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

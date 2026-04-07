import { Link, useLocation } from "wouter";
import { 
  ChartBar, 
  PanelLeft, 
  CheckSquare, 
  Calendar, 
  Tag,
  PlusCircle,
  User,
  Trello
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile slide-in menu */}
      <div 
        className={cn(
          "fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      >
        <div 
          className={cn(
            "fixed top-0 left-0 h-full w-64 bg-card shadow-lg transform transition-transform",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold text-primary flex items-center">
              TaskMaster
            </h1>
          </div>
          <div className="p-4">
            <nav className="space-y-1">
              <Link 
                href="/dashboard"
                className={`flex items-center p-2 rounded-md ${
                  location === "/dashboard" 
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={onClose}
              >
                <PanelLeft className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
              <Link 
                href="/tasks"
                className={`flex items-center p-2 rounded-md ${
                  location === "/tasks" 
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={onClose}
              >
                <CheckSquare className="w-5 h-5 mr-3" />
                All Tasks
              </Link>
              <Link 
                href="/kanban"
                className={`flex items-center p-2 rounded-md ${
                  location === "/kanban" 
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={onClose}
              >
                <Trello className="w-5 h-5 mr-3" />
                Kanban Board
              </Link>
              <Link 
                href="/planner"
                className={`flex items-center p-2 rounded-md ${
                  location === "/planner" 
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={onClose}
              >
                <Calendar className="w-5 h-5 mr-3" />
                Daily Planner
              </Link>
              <Link 
                href="/categories"
                className={`flex items-center p-2 rounded-md ${
                  location === "/categories" 
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={onClose}
              >
                <Tag className="w-5 h-5 mr-3" />
                Categories
              </Link>
              <Link 
                href="/statistics"
                className={`flex items-center p-2 rounded-md ${
                  location === "/statistics" 
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={onClose}
              >
                <ChartBar className="w-5 h-5 mr-3" />
                Statistics
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around items-center py-2 z-20">
        <Link 
          href="/dashboard"
          className={`flex flex-col items-center p-2 ${location === "/dashboard" ? "text-primary" : "text-muted-foreground"}`}
        >
          <PanelLeft className="w-5 h-5" />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        <Link 
          href="/tasks"
          className={`flex flex-col items-center p-2 ${location === "/tasks" ? "text-primary" : "text-muted-foreground"}`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-xs mt-1">Tasks</span>
        </Link>
        <Link 
          href="/tasks"
          className="flex flex-col items-center p-2 text-primary"
        >
          <PlusCircle className="w-6 h-6" />
          <span className="text-xs mt-1">Add</span>
        </Link>
        <Link 
          href="/kanban"
          className={`flex flex-col items-center p-2 ${location === "/kanban" ? "text-primary" : "text-muted-foreground"}`}
        >
          <Trello className="w-5 h-5" />
          <span className="text-xs mt-1">Kanban</span>
        </Link>
        <Link 
          href="/planner"
          className={`flex flex-col items-center p-2 ${location === "/planner" ? "text-primary" : "text-muted-foreground"}`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-xs mt-1">Planner</span>
        </Link>
      </div>
    </>
  );
}

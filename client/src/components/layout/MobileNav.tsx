import { Link, useLocation } from "wouter";
import { 
  ChartBar, 
  PanelLeft, 
  CheckSquare, 
  Calendar, 
  Tag,
  PlusCircle,
  User
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
            "fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary flex items-center">
              TaskMaster
            </h1>
          </div>
          <div className="p-4">
            <nav className="space-y-1">
              <Link 
                href="/"
                className={`flex items-center p-2 rounded-md ${
                  location === "/" 
                    ? "bg-primary-light bg-opacity-10 text-primary"
                    : "text-gray-600 hover:bg-gray-100"
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
                    ? "bg-primary-light bg-opacity-10 text-primary"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={onClose}
              >
                <CheckSquare className="w-5 h-5 mr-3" />
                All Tasks
              </Link>
              <Link 
                href="/planner"
                className={`flex items-center p-2 rounded-md ${
                  location === "/planner" 
                    ? "bg-primary-light bg-opacity-10 text-primary"
                    : "text-gray-600 hover:bg-gray-100"
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
                    ? "bg-primary-light bg-opacity-10 text-primary"
                    : "text-gray-600 hover:bg-gray-100"
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
                    ? "bg-primary-light bg-opacity-10 text-primary"
                    : "text-gray-600 hover:bg-gray-100"
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 z-20">
        <Link 
          href="/"
          className={`flex flex-col items-center p-2 ${location === "/" ? "text-primary" : "text-gray-500"}`}
        >
          <PanelLeft className="w-5 h-5" />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        <Link 
          href="/tasks"
          className={`flex flex-col items-center p-2 ${location === "/tasks" ? "text-primary" : "text-gray-500"}`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-xs mt-1">Tasks</span>
        </Link>
        <Link 
          href="/tasks"
          className="flex flex-col items-center p-2 text-gray-500"
        >
          <PlusCircle className="w-6 h-6 text-primary" />
          <span className="text-xs mt-1">Add</span>
        </Link>
        <Link 
          href="/planner"
          className={`flex flex-col items-center p-2 ${location === "/planner" ? "text-primary" : "text-gray-500"}`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-xs mt-1">Planner</span>
        </Link>
        <Link 
          href="/statistics"
          className={`flex flex-col items-center p-2 ${location === "/statistics" ? "text-primary" : "text-gray-500"}`}
        >
          <User className="w-5 h-5" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </>
  );
}

import { Link, useLocation } from "wouter";
import { 
  ChartBar, 
  CheckCircle, 
  PanelLeft, 
  CheckSquare, 
  Calendar, 
  Tag
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  
  const navItems = [
    { href: "/", label: "Dashboard", icon: <PanelLeft className="w-5 h-5 mr-3" /> },
    { href: "/tasks", label: "All Tasks", icon: <CheckSquare className="w-5 h-5 mr-3" /> },
    { href: "/planner", label: "Daily Planner", icon: <Calendar className="w-5 h-5 mr-3" /> },
    { href: "/categories", label: "Categories", icon: <Tag className="w-5 h-5 mr-3" /> },
    { href: "/statistics", label: "Statistics", icon: <ChartBar className="w-5 h-5 mr-3" /> },
  ];

  return (
    <div className="hidden md:block w-64 bg-white shadow-md z-10 flex-shrink-0">
      <div className="p-4 border-b border-gray-200">
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
                  ? "bg-primary-light bg-opacity-10 text-primary"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3">
            AM
          </div>
          <div>
            <p className="text-sm font-medium">Alex Morgan</p>
            <p className="text-xs text-gray-500">alex@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

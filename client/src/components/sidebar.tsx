import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: "fas fa-tachometer-alt" },
  { name: "Policy Management", href: "/policies", icon: "fas fa-file-shield" },
  { name: "Threat Intelligence", href: "/threats", icon: "fas fa-exclamation-triangle" },
  { name: "Risk Assessment", href: "/risk", icon: "fas fa-chart-line" },
  { name: "Real-time Monitor", href: "/monitor", icon: "fas fa-eye" },
  { name: "API Management", href: "/api", icon: "fas fa-plug" },
  { name: "Settings", href: "/settings", icon: "fas fa-cog" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-72 security-surface border-r border-gray-700 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-shield-alt text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">SecPolicy Pro</h1>
            <p className="text-xs text-gray-400">Dynamic Security Enforcer</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-600/20 text-blue-300 border border-blue-600/30"
                    : "text-gray-300 hover:bg-slate-700 hover:text-white"
                )}
              >
                <i className={`${item.icon} w-5`}></i>
                <span className="font-medium">{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <i className="fas fa-user text-sm text-white"></i>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Security Admin</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
          <button className="text-gray-400 hover:text-white">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}

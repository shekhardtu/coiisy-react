
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { useState } from "react";
import { Outlet } from "react-router-dom";

// Configuration for routes and navigation
const navConfig = [
  {
    path: "/dashboard",
    label: "Playground",
    icon: "SquareTerminal",
    end: true,
  },
  { path: "/dashboard/models", label: "Models", icon: "Bot" },
  { path: "/dashboard/api", label: "API", icon: "Code2" },
  { path: "/dashboard/docs", label: "Documentation", icon: "Book" },
  { path: "/dashboard/settings", label: "Settings", icon: "Settings2" },
];

const userNavConfig = [
  { path: "/dashboard/help", label: "Help", icon: "LifeBuoy" },
  { path: "/dashboard/account", label: "Account", icon: "SquareUser" },
];

export function Dashboard({ children }: { children: React.ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div className={`grid h-screen w-full ${sidebarExpanded ? 'pl-[240px]' : 'pl-[56px]'}`}>
      <Sidebar
        expanded={sidebarExpanded}
        toggleSidebar={toggleSidebar}
        navConfig={navConfig}
        userNavConfig={userNavConfig}
      />
      <div className="flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-4">
          {children || <Outlet />}
        </main>
      </div>

    </div>
  );
}

export default Dashboard;
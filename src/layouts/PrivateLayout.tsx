import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

// Configuration for routes and navigation
const navConfig = [
  {
    path: "/user",
    label: "User",
    icon: "User",
  },
  { path: "/dashboard/models", label: "Models", icon: "Github" },
  { path: "/dashboard/api", label: "API", icon: "Code2" },
  { path: "/dashboard/docs", label: "Documentation", icon: "Book" },

];

const userNavConfig = [
  { path: "/dashboard/help", label: "Help", icon: "LifeBuoy" },
  { path: "/dashboard/account", label: "Account", icon: "SquareUser" },
];

export default function PrivateLayout() {

  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };


  return (
    <div className="flex relative w-full">
    <div className={`grid transition-all duration-300 relative w-full ${sidebarExpanded ? 'ml-[240px]' : 'ml-[56px]'}`}>

      <Sidebar
        expanded={sidebarExpanded}
        toggleSidebar={toggleSidebar}
        navConfig={navConfig}
        userNavConfig={userNavConfig}
      />

      <div className="flex flex-col w-full">
        <Header />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
        </div>
        </div>
    </div>
  );
}
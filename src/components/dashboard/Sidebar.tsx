import * as LucideIcons from 'lucide-react';

import { Button } from "@/components/ui/button";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Triangle } from "lucide-react";
import { NavLink } from "react-router-dom";

interface NavItem {
  path: string;
  label: string;
  icon: keyof typeof LucideIcons | string;
  end?: boolean;
}

interface SidebarProps {
  expanded: boolean;
  toggleSidebar: () => void;
  navConfig: NavItem[];
  userNavConfig: NavItem[];
}

// Icon component renderer function
const Icon = ({ name, ...props }: { name: string } & React.ComponentPropsWithoutRef<'svg'>) => {
  const LucideIcon = LucideIcons[name as keyof typeof LucideIcons] as React.ElementType;
  return LucideIcon ? <LucideIcon {...props} /> : null;
};

export function Sidebar({ expanded, toggleSidebar, navConfig, userNavConfig }: SidebarProps) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r transition-all duration-300 ${expanded ? 'w-[240px]' : 'w-[56px]'}`}>
      <div className="flex items-center justify-between border-b p-2 min-h-16">
        <Button variant="outline" size="icon" aria-label="Home"  onClick={toggleSidebar}>
          <Triangle className="size-5 fill-foreground" />
        </Button>

      </div>
      <nav className="grid gap-1 p-2">
        {navConfig.map((item) => (
          <NavItem key={item.path} item={item} expanded={expanded} />
        ))}
      </nav>
      <nav className="mt-auto grid gap-1 p-2">
        {userNavConfig.map((item) => (
          <NavItem key={item.path} item={item} expanded={expanded} />
        ))}
      </nav>
      <div className="flex items-center justify-between border-b p-2">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto border">
          {expanded ? <><ChevronLeft className="h-4 w-4" ></ChevronLeft> </>: <ChevronRight className="h-4 w-4" />}
      </Button>
      </div>
    </aside>
  );
}

function NavItem({ item, expanded }: { item: NavItem; expanded: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            `flex items-center rounded-lg p-2 ${
              isActive ? "bg-muted" : ""
            } hover:bg-muted transition-colors`
          }
        >


          <div className="flex items-center">
            <div className="relative bg-white flex items-center justify-center z-30">
              <Icon name={item.icon} className="size-6 bg-white" />
            </div>

                <span className={`ml-2 transition-all text-sm font-semibold z-20 ${
                  expanded
                    ? 'opacity-100 translate-x-0 duration-300'
                    : 'opacity-0 -translate-x-full absolute duration-100 -z-10'
                }`}>
                  {item.label}
              </span>

          </div>
        </NavLink>
      </TooltipTrigger>
      {!expanded && (
        <TooltipContent side="right" sideOffset={5}>
          {item.label}
        </TooltipContent>
      )}
    </Tooltip>
  );
}
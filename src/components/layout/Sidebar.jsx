import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Component, PackageSearch, ActivitySquare, Database, Sprout, BarChart3 } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for conditional tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Employees', path: '/employees', icon: Users },
  { name: 'Warehouses', path: '/warehouses', icon: Component },
  { name: 'Parts', path: '/parts', icon: PackageSearch },
  { name: 'Backorders', path: '/backorders', icon: ActivitySquare },
  { name: 'Queries', path: '/queries', icon: Database },
  { name: 'Analysis', path: '/analysis', icon: BarChart3 },
];

const Sidebar = ({ onClose }) => {
  return (
    <div className="flex flex-col h-full py-6 bg-gradient-to-b from-background via-background to-background">
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="bg-gradient-to-br from-accent to-accent/80 text-accent-foreground p-2.5 rounded-lg shadow-md">
          <Sprout strokeWidth={2.4} size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Wachsen</h1>
      </div>
      
      <div className="px-4 flex-1">
        <div className="space-y-1.5">
          <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Main Menu</p>
          {navItems.map((item, index) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => 
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                  isActive 
                    ? "text-accent-foreground bg-accent shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                  "active:scale-95"
                )
              }
              style={{ transitionDelay: `${index * 10}ms` }}
            >
              <item.icon size={18} className="relative z-10" />
              <span className="relative z-10">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
      
      <div className="px-4 mt-auto">
        <div className="p-4 bg-gradient-to-br from-primary/8 to-secondary/8 rounded-lg border border-border/50 shadow-sm">
          <div className="text-xs font-semibold text-foreground mb-1">Wachsen System</div>
          <p className="text-xs text-muted-foreground leading-relaxed">Warehouse Management & Operations Dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

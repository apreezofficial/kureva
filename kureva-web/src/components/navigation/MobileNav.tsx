"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { LayoutDashboard, List, Calendar, User } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const navItems = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "Wishlists", href: "/dashboard/wishlists", icon: List },
    { label: "Occasions", href: "/dashboard/occasions", icon: Calendar },
    { label: "Profile", href: `/profile/${user.username}`, icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 z-40 w-full border-t border-border bg-white/95 backdrop-blur-md px-4 py-2">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
                isActive ? "text-accent" : "text-secondary"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-wide font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

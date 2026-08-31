"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { List, Calendar, User, LogOut, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Wishlists", href: "/dashboard/wishlists", icon: List },
  ];

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-medium tracking-widest text-primary lowercase font-editorial">
          kureva
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm tracking-wide transition-colors ${
                  isActive ? "text-accent font-medium" : "text-secondary hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-4">
          <Link
            href={`/profile/${user.username}`}
            className="flex items-center space-x-1.5 text-sm text-secondary hover:text-primary transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">@{user.username}</span>
          </Link>

          <button
            onClick={() => logout()}
            className="text-secondary hover:text-accent transition-colors p-1"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

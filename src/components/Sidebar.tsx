"use client";

import { cn } from "@/lib/utils";
import { LayoutGrid, Utensils, Coffee, Pizza, Settings, User, LogOut, ChevronUp, BarChart3 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import SettingsModal from "@/components/SettingsModal";
import { createClient } from "@/utils/supabase/client";

interface SidebarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

type UserInfo = {
  name: string;
  role: string;
  branchName: string | null;
};

export default function Sidebar({ categories, selectedCategory, onSelectCategory }: SidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setUserInfo(data);
      })
      .catch(console.error);
  }, []);

  // Close profile popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };

  const getIcon = (category: string) => {
    const raw = category.toLowerCase();
    if (raw.includes("burger")) return <Utensils className="w-5 h-5" />;
    if (raw.includes("drink") || raw.includes("coffee")) return <Coffee className="w-5 h-5" />;
    if (raw.includes("pizza")) return <Pizza className="w-5 h-5" />;
    return <LayoutGrid className="w-5 h-5" />;
  };

  const displayName = userInfo?.name ?? "Cashier";
  const roleBadge = userInfo?.role === "SUPER_ADMIN" ? "Super Admin" : userInfo?.role === "BRANCH_ADMIN" ? "Branch Admin" : userInfo?.role === "CASHIER" ? "Cashier" : userInfo?.role ?? "Active";

  return (
    <>
      <aside className="w-20 md:w-64 h-full flex flex-col bg-white border-r border-gray-100 shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-30 transition-all duration-300">
        {/* Brand / Logo */}
        <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-gray-100/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-xl">
            R
          </div>
          <h1 className="hidden md:block text-2xl font-black text-gray-900 tracking-tight ml-3">
            Resto<span className="text-blue-600">Pos</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto w-full py-6 px-3 flex flex-col gap-2 no-scrollbar">
          <p className="hidden md:block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">
            Categories
          </p>

          <button
            onClick={() => onSelectCategory("All")}
            className={cn(
              "w-full flex items-center justify-center md:justify-start gap-3 px-3 py-3 rounded-2xl transition-all duration-200 group text-left",
              selectedCategory === "All"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
              selectedCategory === "All" ? "bg-white/20" : "bg-gray-100 group-hover:bg-white group-hover:shadow-sm"
            )}>
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className="hidden md:block font-bold text-sm">All Items</span>
          </button>

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={cn(
                "w-full flex items-center justify-center md:justify-start gap-3 px-3 py-3 rounded-2xl transition-all duration-200 group text-left",
                selectedCategory === category
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                selectedCategory === category ? "bg-white/20" : "bg-gray-100 group-hover:bg-white group-hover:shadow-sm"
              )}>
                {getIcon(category)}
              </div>
              <span className="hidden md:block font-bold text-sm whitespace-nowrap overflow-hidden text-ellipsis">{category}</span>
            </button>
          ))}
        </nav>

        {/* Settings & Profile */}
        <div className="p-4 border-t border-gray-100/50 flex flex-col gap-2">
          {(userInfo?.role === "SUPER_ADMIN" || userInfo?.role === "BRANCH_ADMIN") && (
            <a 
              href="/admin"
              className="w-full flex items-center justify-center md:justify-start gap-3 px-3 py-3 rounded-2xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="hidden md:block font-bold text-sm">Dashboard</span>
            </a>
          )}

          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center justify-center md:justify-start gap-3 px-3 py-3 rounded-2xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all">
              <Settings className="w-5 h-5" />
            </div>
            <span className="hidden md:block font-bold text-sm">Settings</span>
          </button>

          {/* Profile with Popover */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="mt-2 w-full flex items-center justify-center md:justify-start gap-3 px-3 py-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0 relative border border-white shadow-sm">
                <div className="absolute inset-0 flex items-center justify-center bg-indigo-100 text-indigo-600">
                  <User className="w-5 h-5" />
                </div>
              </div>
              <div className="hidden md:flex flex-1 items-center justify-between overflow-hidden">
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs font-semibold text-gray-500 truncate">{roleBadge}</p>
                </div>
                <ChevronUp className={cn("w-4 h-4 text-gray-400 transition-transform", isProfileOpen ? "rotate-0" : "rotate-180")} />
              </div>
            </button>

            {/* Popover */}
            {isProfileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 mx-1 bg-white rounded-2xl shadow-xl shadow-gray-900/10 border border-gray-100 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100">
                  <p className="font-bold text-gray-900 text-sm truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{roleBadge}</p>
                  {userInfo?.branchName && (
                    <p className="text-xs text-blue-600 font-semibold mt-1">{userInfo.branchName}</p>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-sm font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
}

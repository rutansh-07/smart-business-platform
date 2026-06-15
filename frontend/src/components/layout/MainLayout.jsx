import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "sonner";
import { Navbar } from "./Navbar";
export function MainLayout() {

  return (
    <div className="min-h-screen bg-background font-sans antialiased flex flex-col justify-between relative">
      {/* Main content sits above the ::before/::after gradient orbs */}
      <main className="flex-1 pb-28 lg:pb-8 lg:pt-20 relative z-10">
        <div className="w-full max-w-screen-xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <footer className="w-full border-t border-border/10 py-5 text-center text-xs text-muted-foreground bg-card/10 backdrop-blur-xs mt-auto mb-28 lg:mb-0 relative z-10">
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <p>© {new Date().getFullYear()} SmartBiz. All rights reserved.</p>
        </div>
      </footer>

      {/* Floating Bottom Glassmorphic Navbar (Responsive - Sticky Top on Desktop) */}
      <Navbar />
    </div>
  );
}

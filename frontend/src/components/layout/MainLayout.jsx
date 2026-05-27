import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { useSocket } from "../../context/SocketContext";

export function MainLayout() {
  const { joinWorkspace } = useSocket();

  useEffect(() => {
    const saved = localStorage.getItem("smartbiz_user");
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (user.workspaceId && joinWorkspace) {
          joinWorkspace(user.workspaceId);
        }
      } catch (err) {
        console.error("Error joining workspace room on MainLayout mount", err);
      }
    }
  }, [joinWorkspace]);

  return (
    <div className="min-h-screen bg-background font-sans antialiased flex flex-col justify-between relative">
      {/* Main content sits above the ::before/::after gradient orbs */}
      <main className="flex-1 pb-28 lg:pb-8 lg:pt-20 relative z-10">
        <div className="w-full max-w-screen-xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Minimalist Footer */}
      <footer className="w-full border-t border-border/10 py-5 text-center text-xs text-muted-foreground bg-card/10 backdrop-blur-xs mt-auto mb-28 lg:mb-0 relative z-10">
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} SmartBiz B2B SaaS. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Support Portal</span>
          </div>
        </div>
      </footer>

      {/* Floating Bottom Glassmorphic Navbar (Responsive - Sticky Top on Desktop) */}
      <Navbar />
    </div>
  );
}

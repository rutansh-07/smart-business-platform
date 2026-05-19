import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased flex flex-col justify-between relative">
      <main className="flex-1 pb-24 lg:pb-6">
        <div className="container mx-auto py-6 px-4">
          <Outlet />
        </div>
      </main>
      
      {/* Premium Minimalist Footer with clear margin from floating Navbar only on mobile/tablet */}
      <footer className="w-full border-t border-border/10 py-6 text-center text-xs text-muted-foreground bg-card/10 backdrop-blur-xs mt-auto mb-28 lg:mb-0">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
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

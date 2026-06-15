import { useState, useEffect } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { toast } from "sonner";

export function NotificationsPanel({ token }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/api/notifications");
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await api.put("/api/notifications/mark-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark notifications as read");
    }
  };

  // Close panel on outside click
  useEffect(() => {
    const closeAll = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener("click", closeAll);
    }
    return () => document.removeEventListener("click", closeAll);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/60 backdrop-blur-sm hover:bg-muted/80 text-foreground transition-all cursor-pointer"
      >
        <Bell className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-background">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-full mt-3 w-80 rounded-xl border border-border bg-card p-4 text-foreground shadow-2xl z-50 flex flex-col gap-4 max-h-[400px]"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm leading-none">Notifications</h4>
                <p className="text-[10px] text-muted-foreground mt-1">Updates from your workspace</p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAsRead}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="h-px bg-border -mx-4" />

            <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  You have no notifications.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`flex flex-col gap-1 p-2.5 rounded-lg border ${
                      notif.isRead ? "bg-muted/30 border-transparent" : "bg-primary/5 border-primary/20"
                    }`}
                  >
                    <p className="text-xs leading-tight">
                      <span className="font-semibold">{notif.sender?.name || "Someone"}</span>{" "}
                      {notif.action} <span className="font-medium italic">"{notif.entityTitle}"</span>
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

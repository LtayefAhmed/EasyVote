import { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-sans">
      {/* Subtle background glow — static, no animation for GPU savings */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30 dark:opacity-15">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[80px]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-violet-500/20 blur-[80px]" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-pink-500/15 blur-[80px]" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar Container */}
        <motion.div
          className={`fixed inset-y-0 left-0 z-50 w-[260px] lg:static lg:translate-x-0 transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen min-w-0">
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
            <div className="max-w-7xl mx-auto h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Chatbot Widget — global, visible on all authenticated pages */}
      <ChatbotWidget />
    </div>
  );
}

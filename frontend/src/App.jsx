import { lazy, Suspense } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import { MainLayout } from "./components/layout/MainLayout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { PublicRoute } from "./components/PublicRoute"
import { Toaster } from "@/components/ui/sonner"
import { Loader2 } from "lucide-react"
import "./App.css"

// Lazy load pages for maximum performance and instant dynamic bundle loading
const Login = lazy(() => import("./pages/Login").then(module => ({ default: module.Login })))
const Register = lazy(() => import("./pages/Register").then(module => ({ default: module.Register })))
const Dashboard = lazy(() => import("./pages/Dashboard").then(module => ({ default: module.Dashboard })))
const Projects = lazy(() => import("./pages/Projects").then(module => ({ default: module.Projects })))
const Analytics = lazy(() => import("./pages/Analytics").then(module => ({ default: module.Analytics })))
const Settings = lazy(() => import("./pages/Settings").then(module => ({ default: module.Settings })))

// Premium dynamic loading spinner fallback
function PageLoader() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-2">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <p className="text-muted-foreground font-medium text-sm">Loading SmartBiz...</p>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="smartbiz-theme">
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Authentication Routes (Prevent logged-in users from seeing them) */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />

            {/* Protected Dashboard Routes (Prevent unauthorized users from seeing them) */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
      <Toaster />
    </ThemeProvider>
  )
}

export default App

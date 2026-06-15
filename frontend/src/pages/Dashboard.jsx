import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Activity, Briefcase, Users, CheckCircle2, AlertCircle, Clock, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import Tilt from "react-parallax-tilt"
import api from "../utils/api"
// Premium metric card skeleton matching the dashboard card layout
function MetricCardSkeleton() {
  return (
    <Card className="border-t-4 border-t-muted/40 shadow-lg bg-card/50 backdrop-blur-sm h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-28 bg-muted-foreground/10 rounded animate-pulse" />
        <div className="h-9 w-9 bg-muted-foreground/10 rounded-full animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-8 w-36 bg-muted-foreground/10 rounded animate-pulse" />
        <div className="h-4 w-24 bg-muted-foreground/10 rounded animate-pulse" />
      </CardContent>
    </Card>
  )
}

// High-fidelity chart coordinate grid skeleton
function ChartSkeleton() {
  const staticHeights = ["35%", "55%", "45%", "70%", "85%", "95%"]
  return (
    <Card className="h-full shadow-lg border-none bg-card/60 backdrop-blur flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="h-5 w-44 bg-muted-foreground/10 rounded animate-pulse mb-1.5" />
        <div className="h-4 w-64 bg-muted-foreground/10 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="pt-6 relative flex-1 flex flex-col justify-end">
        <div className="flex gap-2 sm:gap-4 items-stretch h-[180px] sm:h-[230px]">
          {/* Y-Axis numeric ticks */}
          <div className="flex flex-col justify-between w-10 sm:w-14 text-right py-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-3 w-8 ml-auto bg-muted-foreground/10 rounded animate-pulse" />
            ))}
          </div>
          {/* Axis borders and pulsing bars */}
          <div className="flex-1 relative h-full flex items-end justify-between gap-2 sm:gap-3 px-2 border-l border-b border-border/20">
            {staticHeights.map((h, i) => (
              <div key={i} className="flex-1 h-full flex items-end justify-center">
                <div 
                  className="w-8 sm:w-12 bg-muted-foreground/10 rounded-t-sm animate-pulse"
                  style={{ height: h }}
                />
              </div>
            ))}
          </div>
        </div>
        {/* Decoupled X-axis month labels */}
        <div className="flex gap-2 sm:gap-4 items-center mt-2">
          <div className="w-10 sm:w-14" />
          <div className="flex-1 flex justify-between gap-2 sm:gap-3 px-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-3 w-8 bg-muted-foreground/10 rounded animate-pulse mx-auto" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Recent tasks list skeleton
function RecentTasksSkeleton() {
  return (
    <Card className="h-full shadow-lg border-none bg-card/60 backdrop-blur">
      <CardHeader>
        <div className="h-5 w-44 bg-muted-foreground/10 rounded animate-pulse mb-1.5" />
        <div className="h-4 w-52 bg-muted-foreground/10 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-2">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted-foreground/10 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-muted-foreground/10 rounded animate-pulse" />
                  <div className="h-3 w-36 bg-muted-foreground/10 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-16 bg-muted-foreground/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const [hoveredProject, setHoveredProject] = useState(null)
  const [isLaptop, setIsLaptop] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    teamMembers: 0,
    recentTasks: [],
    projects: []
  })
  const [user, setUser] = useState(null)

  // Track if screen is a laptop/desktop (>= 1024px) to only enable 3D tilts there
  useEffect(() => {
    const handleResize = () => {
      setIsLaptop(window.innerWidth >= 1024)
    }
    handleResize() // Init on mount
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Load user profile & fetch stats
  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get("/api/dashboard/stats")
      setStats(data)
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const savedUser = localStorage.getItem("smartbiz_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    fetchDashboardData()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  }

  // Tilt settings for uniform premium feel
  const tiltOptions = {
    glareMaxOpacity: 0.1,
    glareColor: "#3b82f6",
    glarePosition: "all",
    scale: 1.03,
    transitionSpeed: 400,
    className: "h-full"
  }

  // Calculate project progress levels for chart rendering
  const projectsData = stats.projects.slice(0, 6) // limit to 6 projects for display
  const yTicks = [100, 75, 50, 25, 0]

  // Render high-fidelity shimmers during data loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        {/* Title Header Skeleton */}
        <div className="flex flex-col gap-2">
          <div className="h-9 w-64 bg-muted-foreground/10 rounded animate-pulse" />
          <div className="h-5 w-96 bg-muted-foreground/10 rounded animate-pulse" />
        </div>

        {/* 4 Metric Cards Skeletons */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>

        {/* Dynamic Content Grid Skeletons */}
        <div className="grid gap-6 lg:grid-cols-7">
          <div className="col-span-full lg:col-span-4 h-full">
            <ChartSkeleton />
          </div>
          <div className="col-span-full lg:col-span-3 h-full">
            <RecentTasksSkeleton />
          </div>
        </div>
      </div>
    )
  }

  // Get status badge colors
  const getStatusBadge = (status) => {
    switch (status) {
      case "done":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      case "inprogress":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/10"
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case "done": return "Completed"
      case "inprogress": return "In Progress"
      default: return "To Do"
    }
  }

  return (
    <motion.div 
      className="flex flex-col gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Title Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent w-fit pb-1">
            Welcome back, {user?.name || "Member"}!
          </h1>
          <p className="text-sm text-muted-foreground">
            {user?.role === "admin" ? "Workspace Owner" : "Workspace Member"} • Real-time project intelligence overview.
          </p>
        </div>
      </motion.div>

      {/* 4 Metric Cards with Parallax-Tilt 3D Effects */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Metric 1: Total Projects */}
        <motion.div variants={itemVariants}>
          <Tilt {...tiltOptions} tiltEnable={isLaptop} glareEnable={isLaptop} glareColor="#3b82f6">
            <Card className="border-t-4 border-t-blue-500 shadow-lg bg-card/50 backdrop-blur-sm h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-full">
                  <Briefcase className="h-5 w-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Total client & internal initiatives
                </p>
              </CardContent>
            </Card>
          </Tilt>
        </motion.div>

        {/* Metric 2: Total Tasks */}
        <motion.div variants={itemVariants}>
          <Tilt {...tiltOptions} tiltEnable={isLaptop} glareEnable={isLaptop} glareColor="#a855f7">
            <Card className="border-t-4 border-t-purple-500 shadow-lg bg-card/50 backdrop-blur-sm h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-full">
                  <Activity className="h-5 w-5 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold">{stats.totalTasks}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.todoTasks} backlog, {stats.inProgressTasks} active
                </p>
              </CardContent>
            </Card>
          </Tilt>
        </motion.div>

        {/* Metric 3: Completed Tasks */}
        <motion.div variants={itemVariants}>
          <Tilt {...tiltOptions} tiltEnable={isLaptop} glareEnable={isLaptop} glareColor="#10b981">
            <Card className="border-t-4 border-t-emerald-500 shadow-lg bg-card/50 backdrop-blur-sm h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Task Completion</CardTitle>
                <div className="p-2 bg-emerald-500/10 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold">{stats.completedTasks}</div>
                <p className="text-xs text-emerald-400 mt-2 font-medium">
                  {stats.totalTasks > 0 ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%` : "0%"} overall completion rate
                </p>
              </CardContent>
            </Card>
          </Tilt>
        </motion.div>

        {/* Metric 4: Team Members */}
        <motion.div variants={itemVariants}>
          <Tilt {...tiltOptions} tiltEnable={isLaptop} glareEnable={isLaptop} glareColor="#f97316">
            <Card className="border-t-4 border-t-orange-500 shadow-lg bg-card/50 backdrop-blur-sm h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Team Size</CardTitle>
                <div className="p-2 bg-orange-500/10 rounded-full">
                  <Users className="h-5 w-5 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold">{stats.teamMembers}</div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  Active collaborators in workspace
                </p>
              </CardContent>
            </Card>
          </Tilt>
        </motion.div>
      </div>
      
      {/* Dynamic Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        
        {/* Dynamic MoM Project Progress Graph */}
        <motion.div variants={itemVariants} className="col-span-full lg:col-span-4 h-full">
          <Card className="h-full shadow-lg border-none bg-card/60 backdrop-blur flex flex-col justify-between">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Project Progress</CardTitle>
                <CardDescription>Track status and current progress percentage of active projects.</CardDescription>
              </div>
              <Link to="/projects" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5">
                All Projects <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="pt-6 relative flex-1 flex flex-col justify-end select-none min-h-[300px]">
              
              {projectsData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm font-semibold">No active projects found.</p>
                  <p className="text-xs">Create a project in the Projects tab to get started.</p>
                </div>
              ) : (
                <>
                  {/* Flex container for Y-axis + Chart area */}
                  <div className="flex gap-2 sm:gap-4 items-stretch h-[180px] sm:h-[230px]">
                    
                    {/* Y-Axis Labels */}
                    <div className="flex flex-col justify-between text-[9px] sm:text-[11px] text-muted-foreground font-semibold pr-1 sm:pr-2 select-none text-right w-10 sm:w-14">
                      {yTicks.map((tick) => (
                        <span key={tick}>{tick}%</span>
                      ))}
                    </div>

                    {/* Chart Area with Gridlines & Bars & Axes */}
                    <div className="flex-1 relative h-full flex items-end justify-between gap-2 sm:gap-3 px-2 border-l border-b border-border/30">
                      
                      {/* Faint Horizontal Gridlines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                        {yTicks.map((tick, tickIdx) => (
                          tickIdx === yTicks.length - 1 ? null : (
                            <div 
                              key={tick} 
                              className="w-full border-t border-border/10"
                            />
                          )
                        ))}
                      </div>

                      {/* Vertical focus crosshair line */}
                      {hoveredProject !== null && (
                        <div 
                          className="absolute top-0 bottom-0 border-l border-dashed border-primary/30 pointer-events-none z-0"
                          style={{ 
                            left: `${((hoveredProject + 0.5) / projectsData.length) * 100}%` 
                          }}
                        />
                      )}

                      {/* Dynamic hovering tooltip positioned relative to chart area */}
                      {hoveredProject !== null && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="absolute -top-14 -translate-x-1/2 bg-popover/95 border border-border/80 p-2 sm:p-2.5 rounded-lg shadow-xl text-[10px] sm:text-xs z-30 flex flex-col gap-0.5 w-36 sm:w-44 backdrop-blur-md transition-all duration-150 pointer-events-none"
                          style={{ 
                            left: `${((hoveredProject + 0.5) / projectsData.length) * 100}%` 
                          }}
                        >
                          <div className="flex items-center justify-between font-bold border-b border-border/30 pb-1">
                            <span className="text-foreground truncate max-w-[100px]">{projectsData[hoveredProject].name}</span>
                            <span className="text-[9px] text-muted-foreground uppercase font-black">{projectsData[hoveredProject].status}</span>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground mt-1">
                            <span>Client:</span>
                            <span className="font-semibold text-slate-300 truncate max-w-[80px]">{projectsData[hoveredProject].client}</span>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span>Progress:</span>
                            <span className="font-bold text-blue-500">{projectsData[hoveredProject].progress}%</span>
                          </div>
                        </motion.div>
                      )}

                      {/* Bars */}
                      {projectsData.map((project, index) => {
                        const heightPercentage = project.progress
                        return (
                          <div 
                            key={project._id} 
                            className="flex flex-col items-center flex-1 h-full justify-end cursor-pointer group z-10 animate-fade-in"
                            onMouseEnter={() => setHoveredProject(index)}
                            onMouseLeave={() => setHoveredProject(null)}
                          >
                            <div className="relative w-full flex justify-center h-full items-end">
                              <motion.div 
                                className="w-8 sm:w-12 rounded-t-sm bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400 opacity-80 group-hover:opacity-100 transition-all duration-300 shadow-md group-hover:shadow-[0_0_12px_rgba(59,130,246,0.55)]"
                                initial={{ height: 0 }}
                                animate={{ height: `${heightPercentage}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Decoupled X-Axis project labels row aligned exactly with the bars */}
                  <div className="flex gap-2 sm:gap-4 items-center mt-2">
                    <div className="w-10 sm:w-14 pr-1 sm:pr-2" />
                    <div className="flex-1 flex justify-between gap-2 sm:gap-3 px-2">
                      {projectsData.map((project, index) => (
                        <span 
                          key={project._id} 
                          className={`flex-1 text-center text-[9px] sm:text-xs font-semibold select-none transition-colors duration-200 truncate px-1 ${
                            hoveredProject === index ? "text-primary font-bold scale-105" : "text-muted-foreground"
                          }`}
                        >
                          {project.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

            </CardContent>
          </Card>
        </motion.div>
        
        {/* Recent Tasks List */}
        <motion.div variants={itemVariants} className="col-span-full lg:col-span-3 h-full">
          <Card className="h-full shadow-lg border-none bg-card/60 backdrop-blur flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-xl">Recent Tasks</CardTitle>
              <CardDescription>Latest updates from task boards in this workspace.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              {stats.recentTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                  <Clock className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm font-semibold">No tasks recorded yet.</p>
                  <p className="text-xs">Create tasks on your project boards to see them here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentTasks.map((task) => (
                    <div 
                      key={task._id} 
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border/10 bg-background/20 hover:bg-muted/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Assignee Avatar / Initial */}
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-blue-500 shadow-sm border border-blue-500/20 shrink-0 overflow-hidden">
                          {task.assignee?.avatar ? (
                            <img src={task.assignee.avatar} alt={task.assignee.name} className="h-full w-full object-cover" />
                          ) : (
                            task.assignee?.name?.charAt(0) || <Activity className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-none truncate text-slate-200">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            Project: {task.project?.name || "Global"} • By {task.assignee?.name || "Unassigned"}
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${getStatusBadge(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

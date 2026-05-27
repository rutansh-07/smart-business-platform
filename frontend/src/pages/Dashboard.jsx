import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Activity, CreditCard, DollarSign, Users, TrendingUp, Briefcase } from "lucide-react"
import { motion } from "framer-motion"
import Tilt from "react-parallax-tilt"
import api from "../utils/api"
import { useSocket } from "../context/SocketContext"

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

// Transaction list skeleton
function RecentTransactionsSkeleton() {
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
  const [hoveredMonth, setHoveredMonth] = useState(null)
  const [isLaptop, setIsLaptop] = useState(false)
  const [projectCount, setProjectCount] = useState(142)
  const [isLoading, setIsLoading] = useState(true)

  const { socket } = useSocket()

  // Track if screen is a laptop/desktop (>= 1024px) to only enable 3D tilts there
  useEffect(() => {
    const handleResize = () => {
      setIsLaptop(window.innerWidth >= 1024)
    }
    handleResize() // Init on mount
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Dynamic MongoDB database query for total active projects count
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const response = await api.get("/api/projects")
        setProjectCount(response.data.length)
      } catch (error) {
        console.error("Failed to load projects count from MongoDB:", error)
      } finally {
        // Enforce 800ms timer to showcase the beautiful skeletons and prevent layout flicker
        setTimeout(() => {
          setIsLoading(false)
        }, 800)
      }
    }
    fetchStats()
  }, [])

  // Socket.IO Real-Time Updates for Dashboard Metrics
  useEffect(() => {
    if (!socket) return

    socket.on("project_created", () => {
      setProjectCount((prev) => prev + 1)
    })

    socket.on("project_deleted", () => {
      setProjectCount((prev) => Math.max(0, prev - 1))
    })

    return () => {
      socket.off("project_created")
      socket.off("project_deleted")
    }
  }, [socket])

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

  // Localized Revenue Chart Data (matching Analytics page)
  const monthlyRevenue = [
    { month: "Jan", revenue: 450000, projects: 4 },
    { month: "Feb", revenue: 520000, projects: 6 },
    { month: "Mar", revenue: 490000, projects: 5 },
    { month: "Apr", revenue: 680000, projects: 8 },
    { month: "May", revenue: 840000, projects: 12 },
    { month: "Jun", revenue: 950000, projects: 15 },
  ]
  const maxRevenue = Math.max(...monthlyRevenue.map((d) => d.revenue))
  const yMax = Math.ceil(maxRevenue / 100000) * 100000
  const yTicks = Array.from({ length: 5 }, (_, i) => yMax - (yMax / 4) * i)

  // Tilt settings for uniform premium feel
  const tiltOptions = {
    glareMaxOpacity: 0.1,
    glareColor: "#3b82f6",
    glarePosition: "all",
    scale: 1.03,
    transitionSpeed: 400,
    className: "h-full"
  }

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
            <RecentTransactionsSkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="flex flex-col gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Title Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent w-fit pb-1">
          Dashboard Overview
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Welcome back! Hover over cards for 3D perspective and see the latest enterprise metrics.</p>
      </motion.div>

      {/* 4 Metric Cards with Parallax-Tilt 3D Effects */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Metric 1: Total Revenue */}
        <motion.div variants={itemVariants}>
          <Tilt {...tiltOptions} tiltEnable={isLaptop} glareEnable={isLaptop} glareColor="#3b82f6">
            <Card className="border-t-4 border-t-blue-500 shadow-lg bg-card/50 backdrop-blur-sm h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue (INR)</CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-full">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold privacy-mask">₹34,52,231</div>
                <p className="text-sm text-green-500 flex items-center mt-2 font-medium">
                  <TrendingUp className="h-4 w-4 mr-1" /> +20.1% from last month
                </p>
              </CardContent>
            </Card>
          </Tilt>
        </motion.div>

        {/* Metric 2: New Clients */}
        <motion.div variants={itemVariants}>
          <Tilt {...tiltOptions} tiltEnable={isLaptop} glareEnable={isLaptop} glareColor="#a855f7">
            <Card className="border-t-4 border-t-purple-500 shadow-lg bg-card/50 backdrop-blur-sm h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">New Leads</CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-full">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold">+2,350</div>
                <p className="text-sm text-green-500 flex items-center mt-2 font-medium">
                  <TrendingUp className="h-4 w-4 mr-1" /> +18.1% organic growth
                </p>
              </CardContent>
            </Card>
          </Tilt>
        </motion.div>

        {/* Metric 3: Active Projects */}
        <motion.div variants={itemVariants}>
          <Tilt {...tiltOptions} tiltEnable={isLaptop} glareEnable={isLaptop} glareColor="#06b6d4">
            <Card className="border-t-4 border-t-cyan-500 shadow-lg bg-card/50 backdrop-blur-sm h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
                <div className="p-2 bg-cyan-500/10 rounded-full">
                  <Briefcase className="h-5 w-5 text-cyan-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold">{projectCount}</div>
                <p className="text-sm text-green-500 flex items-center mt-2 font-medium">
                  <TrendingUp className="h-4 w-4 mr-1" /> Verified from MongoDB
                </p>
              </CardContent>
            </Card>
          </Tilt>
        </motion.div>

        {/* Metric 4: Active Now */}
        <motion.div variants={itemVariants}>
          <Tilt {...tiltOptions} tiltEnable={isLaptop} glareEnable={isLaptop} glareColor="#f97316">
            <Card className="border-t-4 border-t-orange-500 shadow-lg bg-card/50 backdrop-blur-sm h-full flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Members</CardTitle>
                <div className="p-2 bg-orange-500/10 rounded-full">
                  <Activity className="h-5 w-5 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold">+573</div>
                <p className="text-sm text-muted-foreground mt-2 font-medium">
                  +201 since last hour
                </p>
              </CardContent>
            </Card>
          </Tilt>
        </motion.div>
      </div>
      
      {/* Dynamic Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        
        {/* Dynamic Month-on-Month Revenue Graph */}
        <motion.div variants={itemVariants} className="col-span-full lg:col-span-4 h-full">
          <Card className="h-full shadow-lg border-none bg-card/60 backdrop-blur flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Revenue Growth Trend</CardTitle>
              <CardDescription>Visual chart overview for the first half of the year (INR ₹)</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 relative flex-1 flex flex-col justify-end select-none">
              
              {/* Flex container for Y-axis + Chart area */}
              <div className="flex gap-2 sm:gap-4 items-stretch h-[180px] sm:h-[230px]">
                
                {/* Y-Axis Labels */}
                <div className="flex flex-col justify-between text-[9px] sm:text-[11px] text-muted-foreground font-semibold pr-1 sm:pr-2 select-none text-right w-10 sm:w-14">
                  {yTicks.map((tick) => (
                    <span key={tick}>
                      {tick >= 100000 
                        ? `₹${(tick / 100000).toFixed(1).replace(".0", "")}L` 
                        : `₹${tick}`}
                    </span>
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
                  {hoveredMonth !== null && (
                    <div 
                      className="absolute top-0 bottom-0 border-l border-dashed border-primary/30 pointer-events-none z-0"
                      style={{ 
                        left: `${((hoveredMonth + 0.5) / monthlyRevenue.length) * 100}%` 
                      }}
                    />
                  )}

                  {/* Dynamic hovering tooltip positioned relative to chart area */}
                  {hoveredMonth !== null && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute -top-14 -translate-x-1/2 bg-popover/90 border border-border/80 p-2 sm:p-2.5 rounded-lg shadow-xl text-[10px] sm:text-xs z-30 flex flex-col gap-0.5 w-36 sm:w-40 backdrop-blur-md transition-all duration-150 pointer-events-none"
                      style={{ 
                        left: `${((hoveredMonth + 0.5) / monthlyRevenue.length) * 100}%` 
                      }}
                    >
                      <div className="flex items-center justify-between font-bold border-b border-border/30 pb-1">
                        <span className="text-foreground">{monthlyRevenue[hoveredMonth].month}</span>
                        <span className="text-[9px] text-muted-foreground uppercase font-black">H1 Revenue</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground mt-1">
                        <span>Revenue:</span>
                        <span className="font-bold text-blue-500 privacy-mask">₹{monthlyRevenue[hoveredMonth].revenue.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Contracts:</span>
                        <span className="font-bold text-foreground">{monthlyRevenue[hoveredMonth].projects} Active</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Bars */}
                  {monthlyRevenue.map((d, index) => {
                    const heightPercentage = (d.revenue / yMax) * 100
                    return (
                      <div 
                        key={d.month} 
                        className="flex flex-col items-center flex-1 h-full justify-end cursor-pointer group z-10"
                        onMouseEnter={() => setHoveredMonth(index)}
                        onMouseLeave={() => setHoveredMonth(null)}
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

              {/* Decoupled X-Axis month labels row aligned exactly with the bars */}
              <div className="flex gap-2 sm:gap-4 items-center mt-2">
                <div className="w-10 sm:w-14 pr-1 sm:pr-2" />
                <div className="flex-1 flex justify-between gap-2 sm:gap-3 px-2">
                  {monthlyRevenue.map((d, index) => (
                    <span 
                      key={d.month} 
                      className={`flex-1 text-center text-[10px] sm:text-xs font-semibold select-none transition-colors duration-200 ${
                        hoveredMonth === index ? "text-primary font-bold scale-105" : "text-muted-foreground"
                      }`}
                    >
                      {d.month}
                    </span>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>
        </motion.div>
        
        {/* Recent Transactions List */}
        <motion.div variants={itemVariants} className="col-span-full lg:col-span-3 h-full">
          <Card className="h-full shadow-lg border-none bg-card/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl">Recent Transactions</CardTitle>
              <CardDescription>You made 265 sales this month.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-6">
                  {[
                    { name: "Aarav Sharma", email: "aarav.s@company.in", amount: "+₹1,49,999" },
                    { name: "Priya Patel", email: "priya.p@startup.in", amount: "+₹3,500" },
                    { name: "Rohan Gupta", email: "rohan@enterprise.in", amount: "+₹24,900" },
                    { name: "Ananya Singh", email: "ananya.s@agency.in", amount: "+₹8,900" },
                    { name: "Vikram Malhotra", email: "vikram.m@corp.in", amount: "+₹3,500" },
                  ].map((item, i) => (
                    <motion.div 
                      whileHover={{ scale: 1.02, x: 5 }}
                      key={i} 
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-blue-500 shadow-sm border border-blue-500/20">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.email}</p>
                        </div>
                      </div>
                      <div className="font-semibold text-emerald-500 text-sm privacy-mask">{item.amount}</div>
                    </motion.div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

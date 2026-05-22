import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, LineChart, PieChart, TrendingUp, ArrowUpRight, Globe, Share2, Search, Mail, IndianRupee, ArrowDownRight } from "lucide-react"
import { motion } from "framer-motion"

// Premium metrics card skeleton
function MetricCardSkeleton() {
  return (
    <Card className="border border-border/20 shadow-lg bg-card/50 backdrop-blur-sm h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-28 bg-muted-foreground/10 rounded animate-pulse" />
        <div className="h-9 w-9 bg-muted-foreground/10 rounded-full animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-8 w-32 bg-muted-foreground/10 rounded animate-pulse" />
        <div className="h-4 w-24 bg-muted-foreground/10 rounded animate-pulse" />
      </CardContent>
    </Card>
  )
}

// Coordinate chart grid skeleton matching Dashboard
function ChartSkeleton() {
  const staticHeights = ["35%", "55%", "45%", "70%", "85%", "95%"]
  return (
    <Card className="h-full shadow-lg border-none bg-card/60 backdrop-blur flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="h-5 w-44 bg-muted-foreground/10 rounded animate-pulse mb-1.5" />
        <div className="h-4 w-64 bg-muted-foreground/10 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="pt-6 relative flex-1 flex flex-col justify-end">
        <div className="flex gap-2 sm:gap-4 items-stretch h-[200px] sm:h-[280px]">
          {/* Y-Axis tick placeholders */}
          <div className="flex flex-col justify-between w-10 sm:w-14 text-right py-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-3 w-8 ml-auto bg-muted-foreground/10 rounded animate-pulse" />
            ))}
          </div>
          {/* Axis lines and pulsing bars */}
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
        {/* Decoupled X-axis label row */}
        <div className="flex gap-2 sm:gap-4 items-center mt-2">
          <div className="w-10 sm:w-14" />
          <div className="flex-1 flex justify-between gap-2 sm:gap-3 px-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-3 w-8 bg-muted-foreground/10 rounded animate-pulse mx-auto" />
            ))}
          </div>
        </div>
        <div className="h-14 w-full bg-muted-foreground/10 rounded-lg animate-pulse mt-6" />
      </CardContent>
    </Card>
  )
}

// Traffic source progress rows skeleton
function TrafficOverviewSkeleton() {
  return (
    <Card className="h-full shadow-lg border-none bg-card/60 backdrop-blur">
      <CardHeader>
        <div className="h-5 w-44 bg-muted-foreground/10 rounded animate-pulse mb-1.5" />
        <div className="h-4 w-52 bg-muted-foreground/10 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded bg-muted-foreground/10 animate-pulse" />
                <div className="h-4 w-24 bg-muted-foreground/10 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-12 bg-muted-foreground/10 rounded animate-pulse" />
                <div className="h-4 w-8 bg-muted-foreground/10 rounded animate-pulse font-bold" />
              </div>
            </div>
            <div className="w-full bg-muted-foreground/5 rounded-full h-3" />
          </div>
        ))}
        <div className="h-16 w-full bg-muted-foreground/10 rounded-xl animate-pulse mt-6" />
      </CardContent>
    </Card>
  )
}

export function Analytics() {
  const [hoveredMonth, setHoveredMonth] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate premium skeleton shimmers loading for 800ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 80 } }
  }

  // 1. Localized Revenue Data (Jan - Jun)
  const monthlyRevenue = [
    { month: "Jan", revenue: 450000, projects: 4 },
    { month: "Feb", revenue: 520000, projects: 6 },
    { month: "Mar", revenue: 490000, projects: 5 },
    { month: "Apr", revenue: 680000, projects: 8 },
    { month: "May", revenue: 840000, projects: 12 },
    { month: "Jun", revenue: 950000, projects: 15 },
  ]

  // Find max revenue to scale chart heights proportionally
  const maxRevenue = Math.max(...monthlyRevenue.map((d) => d.revenue))
  const yMax = Math.ceil(maxRevenue / 100000) * 100000
  const yTicks = Array.from({ length: 5 }, (_, i) => yMax - (yMax / 4) * i)

  // 2. Traffic Sources Data
  const trafficSources = [
    { name: "Organic Search", percentage: 42, visitors: "24,500", icon: Search, color: "bg-blue-500", text: "text-blue-500" },
    { name: "Direct Link", percentage: 28, visitors: "16,200", icon: Globe, color: "bg-emerald-500", text: "text-emerald-500" },
    { name: "Social Referrals", percentage: 18, visitors: "10,800", icon: Share2, color: "bg-purple-500", text: "text-purple-500" },
    { name: "Email Campaigns", percentage: 12, visitors: "6,900", icon: Mail, color: "bg-orange-500", text: "text-orange-500" },
  ]

  // Render high-fidelity shimmers during loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        {/* Page Title Header Skeleton */}
        <div className="flex flex-col gap-2">
          <div className="h-9 w-64 bg-muted-foreground/10 rounded animate-pulse" />
          <div className="h-5 w-96 bg-muted-foreground/10 rounded animate-pulse" />
        </div>

        {/* Top Level Metric Skeletons */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>

        {/* Main Charts Row Skeletons */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <TrafficOverviewSkeleton />
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
      {/* Page Title Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent w-fit pb-1">
          Analytics & Reports
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Detailed analysis of your monthly enterprise revenues and customer traffic sources.</p>
      </motion.div>

      {/* Top Level Metric Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
          <Card className="glass-panel border-none shadow-lg h-full bg-card/60 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Conversion Rate</CardTitle>
              <PieChart className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">3.24%</div>
              <p className="text-sm text-emerald-500 flex items-center mt-2 font-medium">
                <ArrowUpRight className="h-4 w-4 mr-1" /> +0.4% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
          <Card className="glass-panel border-none shadow-lg h-full bg-card/60 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Average Deal Value</CardTitle>
              <IndianRupee className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold privacy-mask">₹1,48,500</div>
              <p className="text-sm text-blue-500 flex items-center mt-2 font-medium">
                <ArrowUpRight className="h-4 w-4 mr-1" /> +12.3% SaaS contract growth
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
          <Card className="glass-panel border-none shadow-lg h-full bg-card/60 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Platform Bounce Rate</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">38.4%</div>
              <p className="text-sm text-emerald-500 flex items-center mt-2 font-medium">
                <ArrowDownRight className="h-4 w-4 mr-1" /> -3.2% drop (Better retention!)
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* CHART 1: REVENUE OVERVIEW */}
        <motion.div variants={itemVariants}>
          <Card className="glass-panel border-none shadow-xl bg-card/60 backdrop-blur h-full flex flex-col justify-between">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Revenue Overview</CardTitle>
                  <CardDescription>Monthly recurring revenue metrics in INR (₹)</CardDescription>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-xs font-bold">
                  <TrendingUp className="h-3 w-3" />
                  <span>+18.5% YTD</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pt-6 select-none">
              
              {/* Flex container for Y-axis + Chart area */}
              <div className="flex gap-2 sm:gap-4 items-stretch h-[200px] sm:h-[280px]">
                
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

                  {/* Vertical focus crosshair guide line */}
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
                        <span className="text-[9px] text-muted-foreground uppercase font-black">Performance</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground mt-1">
                        <span>Total Revenue:</span>
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
                            className="w-8 sm:w-12 rounded-t-sm bg-gradient-to-t from-blue-600 to-cyan-500 group-hover:from-blue-500 group-hover:to-cyan-400 opacity-80 group-hover:opacity-100 transition-all duration-300 shadow-md group-hover:shadow-[0_0_12px_rgba(59,130,246,0.55)]"
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

              {/* Extra Performance Meta Footer */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border/10 text-center">
                <div className="p-2.5 rounded-lg bg-background/25">
                  <p className="text-xs text-muted-foreground font-semibold">Total Revenue (H1)</p>
                  <p className="text-xl font-black text-foreground mt-1 privacy-mask">₹39,30,000</p>
                </div>
                <div className="p-2.5 rounded-lg bg-background/25">
                  <p className="text-xs text-muted-foreground font-semibold">Avg. Growth / Mo</p>
                  <p className="text-xl font-black text-blue-500 mt-1 privacy-mask">+₹83,333</p>
                </div>
              </div>

            </CardContent>
          </Card>
        </motion.div>

        {/* CHART 2: TRAFFIC SOURCES */}
        <motion.div variants={itemVariants}>
          <Card className="glass-panel border-none shadow-xl bg-card/60 backdrop-blur h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-xl">Traffic Overview</CardTitle>
              <CardDescription>Detailed channels driving platform acquisition</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pt-6">
              
              <div className="flex flex-col gap-5">
                {trafficSources.map((source) => {
                  const Icon = source.icon
                  return (
                    <div key={source.name} className="flex flex-col gap-2">
                      {/* Metric info headers */}
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <div className="flex items-center gap-2 text-foreground/80">
                          <div className={`p-1.5 rounded-md bg-background border border-border/50 ${source.text}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span>{source.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-xs">{source.visitors} users</span>
                          <span className="font-bold text-foreground">{source.percentage}%</span>
                        </div>
                      </div>

                      {/* Animated Progress Bar */}
                      <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                        <motion.div 
                          className={`h-3 rounded-full ${source.color} opacity-80`}
                          initial={{ width: 0 }}
                          animate={{ width: `${source.percentage}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Traffic Analysis summary footer */}
              <div className="p-3 rounded-xl bg-background/25 border border-border/20 mt-6 flex justify-between items-center">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground font-semibold">Total Unique Acquisitions</p>
                  <p className="text-lg font-black text-foreground">58,400 <span className="text-xs text-emerald-500 font-bold">+14.2%</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground font-semibold">Top Source Channel</p>
                  <p className="text-sm font-bold text-blue-500">Google SEO (Organic)</p>
                </div>
              </div>

            </CardContent>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  )
}

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Activity, CreditCard, DollarSign, Users, TrendingUp, Briefcase } from "lucide-react"
import { motion } from "framer-motion"
import Tilt from "react-parallax-tilt"

export function Dashboard() {
  const [hoveredMonth, setHoveredMonth] = useState(null)
  const [isLaptop, setIsLaptop] = useState(false)

  // Track if screen is a laptop/desktop (>= 1024px) to only enable 3D tilts there
  useEffect(() => {
    const handleResize = () => {
      setIsLaptop(window.innerWidth >= 1024)
    }
    handleResize() // Init on mount
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
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

  // Localized Revenue Chart Data (matching Analytics page)
  const monthlyRevenue = [
    { month: "Jan", revenue: 450000 },
    { month: "Feb", revenue: 520000 },
    { month: "Mar", revenue: 490000 },
    { month: "Apr", revenue: 680000 },
    { month: "May", revenue: 840000 },
    { month: "Jun", revenue: 950000 },
  ]
  const maxRevenue = Math.max(...monthlyRevenue.map((d) => d.revenue))

  // Tilt settings for uniform premium feel
  const tiltOptions = {
    glareMaxOpacity: 0.1,
    glareColor: "#3b82f6",
    glarePosition: "all",
    scale: 1.03,
    transitionSpeed: 400,
    className: "h-full"
  }

  return (
    <motion.div 
      className="flex flex-col gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Title Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent w-fit pb-1">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground text-lg">Welcome back! Hover over cards for 3D perspective and see the latest enterprise metrics.</p>
      </motion.div>

      {/* 4 Metric Cards with Parallax-Tilt 3D Effects */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
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
                <div className="text-3xl font-extrabold">142</div>
                <p className="text-sm text-green-500 flex items-center mt-2 font-medium">
                  <TrendingUp className="h-4 w-4 mr-1" /> +19% from database
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
        
        {/* Dynamic Month-on-Month Revenue Graph (Replaced Pending Placeholder!) */}
        <motion.div variants={itemVariants} className="col-span-full lg:col-span-4 h-full">
          <Card className="h-full shadow-lg border-none bg-card/60 backdrop-blur flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Revenue Growth Trend</CardTitle>
              <CardDescription>Visual chart overview for the first half of the year (INR ₹)</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 relative flex-1 flex flex-col justify-end">
              
              {/* Interactive bars representation */}
              <div className="h-[230px] flex items-end justify-between gap-3 px-2 border-b border-border/50 pb-4 relative">
                
                {/* Floating tooltip */}
                {hoveredMonth !== null && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 bg-popover border border-border p-2 rounded-lg shadow-xl text-xs z-20 flex flex-col gap-0.5 w-40"
                  >
                    <p className="font-bold text-foreground">{monthlyRevenue[hoveredMonth].month}</p>
                    <div className="flex items-center justify-between text-muted-foreground mt-0.5">
                      <span>Revenue:</span>
                      <span className="font-bold text-blue-500 privacy-mask">₹{monthlyRevenue[hoveredMonth].revenue.toLocaleString("en-IN")}</span>
                    </div>
                  </motion.div>
                )}

                {monthlyRevenue.map((d, index) => {
                  const heightPercentage = (d.revenue / maxRevenue) * 100
                  return (
                    <div 
                      key={d.month} 
                      className="flex flex-col items-center flex-1 h-full justify-end cursor-pointer group"
                      onMouseEnter={() => setHoveredMonth(index)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      <div className="relative w-full flex justify-center h-full items-end">
                        <motion.div 
                          className="w-full rounded-t-sm bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400 opacity-80 group-hover:opacity-100 transition-opacity shadow-md"
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercentage}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground mt-2 group-hover:text-foreground transition-colors">
                        {d.month}
                      </span>
                    </div>
                  )
                })}
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

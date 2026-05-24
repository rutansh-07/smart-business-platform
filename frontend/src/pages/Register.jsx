import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Loader2, Zap, Crown, Users, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import axios from "axios"
import { toast } from "sonner"
import { ParticlesBackground } from "../components/ParticlesBackground"

export function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState("employee")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await axios.post("/api/auth/register", { name, email, password, role })
      localStorage.setItem("smartbiz_token", response.data.token)
      localStorage.setItem("smartbiz_user", JSON.stringify(response.data))
      toast.success("Account created successfully! Welcome to SmartBiz.")
      navigate("/dashboard")
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during registration.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-screen overflow-hidden py-8 px-4">
      <ParticlesBackground />

      {/* Brand Header */}
      <motion.div
        className="relative z-10 flex flex-col items-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">SmartBiz</span>
        </div>
        <p className="text-sm text-muted-foreground text-center max-w-[260px]">
          Enterprise CRM & Project Intelligence Platform
        </p>
      </motion.div>

      <motion.div
        className="relative z-10 w-full max-w-[420px]"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.6, delay: 0.1 }}
      >
        <Card className="w-full shadow-2xl border border-border/40 bg-card/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-5">
            <CardTitle className="text-xl font-bold tracking-tight">Create your account</CardTitle>
            <CardDescription>
              Get started with SmartBiz for free — no credit card required
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="name">Full Name</label>
                <Input
                  id="name"
                  placeholder="Rahul Sharma"
                  required
                  className="bg-background/50 h-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="email">Email address</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="rahul.sharma@example.in"
                  required
                  className="bg-background/50 h-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="password">Password</label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="At least 6 characters"
                    className="bg-background/50 h-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                  >
                    <motion.div whileHover={{ scale: 1.2, rotate: showPassword ? -10 : 10 }} whileTap={{ scale: 0.8 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </motion.div>
                  </button>
                </div>
              </div>

              {/* Role Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">I am registering as</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all duration-200 cursor-pointer ${
                      role === "admin"
                        ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                        : "border-border/60 bg-background/30 hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <Crown className={`h-5 w-5 transition-colors ${role === "admin" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-xs font-bold transition-colors ${role === "admin" ? "text-primary" : "text-muted-foreground"}`}>
                      Owner / Admin
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight text-center">
                      Full platform access
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("employee")}
                    className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all duration-200 cursor-pointer ${
                      role === "employee"
                        ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                        : "border-border/60 bg-background/30 hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <Users className={`h-5 w-5 transition-colors ${role === "employee" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-xs font-bold transition-colors ${role === "employee" ? "text-primary" : "text-muted-foreground"}`}>
                      Employee
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight text-center">
                      Standard team member
                    </span>
                  </button>
                </div>
              </div>

              <motion.div whileHover={!isLoading ? { scale: 1.02 } : {}} whileTap={!isLoading ? { scale: 0.98 } : {}}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border/50 pt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-semibold">
                Sign in instead
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Trust badge */}
        <motion.div
          className="flex items-center justify-center gap-1.5 mt-5 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Zap className="h-3 w-3 text-primary/60" />
          <span>Secured with JWT authentication & bcrypt encryption</span>
        </motion.div>
      </motion.div>
    </div>
  )
}


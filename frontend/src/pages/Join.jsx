import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Loader2, Zap, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import api from "../utils/api"
import { toast } from "sonner"
import { ParticlesBackground } from "../components/ParticlesBackground"

export function Join() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [workspaceName, setWorkspaceName] = useState(null)
  
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    if (token) {
      api.get(`/api/workspaces/verify-invite/${token}`)
        .then((res) => setWorkspaceName(res.data.name))
        .catch(() => toast.error("Invalid or expired invite link."));
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!token) {
      toast.error("Invite token is missing from the URL.")
      return
    }

    setIsLoading(true)
    try {
      const response = await api.post("/api/auth/register-employee", { 
        name, email, password, token 
      })
      localStorage.setItem("smartbiz_token", response.data.token)
      localStorage.setItem("smartbiz_user", JSON.stringify(response.data))
      toast.success(`Successfully joined ${workspaceName || "the workspace"}!`)
      navigate("/dashboard")
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-screen overflow-hidden py-8 px-4">
      <ParticlesBackground />

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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="w-full shadow-2xl border border-border/40 bg-card/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-5">
            <CardTitle className="text-xl font-bold tracking-tight">
              {workspaceName ? `Join ${workspaceName}` : "Join Workspace"}
            </CardTitle>
            <CardDescription>
              Create your employee account to join the team
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="name">Full name</label>
                <Input
                  id="name"
                  type="text"
                  required
                  placeholder="Ravi Kumar"
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
                  required
                  placeholder="ravi.kumar@smartbiz.in"
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
                    "Join Workspace"
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border/50 pt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

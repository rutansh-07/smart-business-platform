import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import axios from "axios"
import { toast } from "sonner"

import { ParticlesBackground } from "../components/ParticlesBackground"

export function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      })
      
      // Store token in localStorage
      localStorage.setItem("smartbiz_token", response.data.token)
      localStorage.setItem("smartbiz_user", JSON.stringify(response.data))
      
      toast.success(`Welcome back, ${response.data.name}!`)
      navigate("/dashboard")
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid email or password.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative w-full flex items-center justify-center min-h-[80vh] overflow-hidden py-12 px-4">
      <ParticlesBackground />
      <motion.div 
        className="relative z-10 w-full flex items-center justify-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
      <Card className="w-full max-w-[400px] mx-auto shadow-2xl border-none bg-card/60 backdrop-blur">
        <CardHeader className="space-y-2 text-center pb-6">
          <motion.div 
            className="flex justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </motion.div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                Email
              </label>
              <Input 
                id="email" 
                type="email" 
                placeholder="ravi.kumar@smartbiz.in" 
                required 
                className="bg-background/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                  Password
                </label>
                <Link to="#" className="text-xs text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                className="bg-background/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <motion.div whileHover={!isLoading ? { scale: 1.03 } : {}} whileTap={!isLoading ? { scale: 0.97 } : {}}>
              <Button type="submit" disabled={isLoading} className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/50 pt-4">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
    </div>
  )
}

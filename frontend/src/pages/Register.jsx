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

export function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      })
      
      // Store token in localStorage
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
    <div className="relative w-full flex items-center justify-center min-h-[80vh] overflow-hidden py-12 px-4">
      <ParticlesBackground />
      <motion.div 
        className="relative z-10 w-full flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
      >
      <Card className="w-full max-w-[400px] mx-auto shadow-2xl border-none bg-card/60 backdrop-blur">
        <CardHeader className="space-y-2 text-center pb-6">
          <motion.div 
            className="flex justify-center mb-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-3 bg-purple-500/10 rounded-full">
              <Building2 className="h-8 w-8 text-purple-500" />
            </div>
          </motion.div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription>
            Enter your details to get started with SmartBiz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="name">
                Full Name
              </label>
              <Input 
                id="name" 
                placeholder="Rahul Sharma" 
                required 
                className="bg-background/50"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="email">
                Email
              </label>
              <Input 
                id="email" 
                type="email" 
                placeholder="rahul.sharma@example.in" 
                required 
                className="bg-background/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="password">
                Password
              </label>
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
              <Button type="submit" disabled={isLoading} className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/50 pt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-500 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
    </div>
  )
}

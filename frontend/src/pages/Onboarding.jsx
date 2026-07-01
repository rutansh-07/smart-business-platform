import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, ArrowRight, ArrowLeft, Check, Copy, Loader2, Sparkles, Mail } from "lucide-react"
import { Logo } from "../components/ui/Logo"
import { motion, AnimatePresence } from "framer-motion"
import api from "../utils/api"
import { toast } from "sonner"
import { ParticlesBackground } from "../components/ParticlesBackground"

export function Onboarding() {
  const [step, setStep] = useState(1)
  const [workspaceName, setWorkspaceName] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [inviteToken, setInviteToken] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [isFetchingInvite, setIsFetchingInvite] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [copiedInvite, setCopiedInvite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    const savedUser = localStorage.getItem("smartbiz_user")
    if (savedUser) {
      const parsed = JSON.parse(savedUser)
      setUser(parsed)
      setWorkspaceName(parsed.name ? `${parsed.name}'s Workspace` : "")
    }
  }, [])

  // Load invite link for step 3
  useEffect(() => {
    if (step === 3 && !inviteToken) {
      const fetchInvite = async () => {
        try {
          setIsFetchingInvite(true)
          const { data } = await api.get("/api/workspaces/invite")
          setInviteToken(data.token)
        } catch (error) {
          console.error("Failed to fetch invite token:", error)
        } finally {
          setIsFetchingInvite(false)
        }
      }
      fetchInvite()
    }
  }, [step, inviteToken])

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/join?token=${inviteToken}`
    navigator.clipboard.writeText(inviteUrl)
    setCopiedInvite(true)
    toast.success("Invite link copied to clipboard!")
    setTimeout(() => setCopiedInvite(false), 2000)
  }

  const handleSendInvite = async (e) => {
    e.preventDefault()
    if (!inviteEmail) return
    try {
      setIsInviting(true)
      await api.post("/api/workspaces/invite-email", { email: inviteEmail })
      toast.success(`Invite sent successfully to ${inviteEmail}!`)
      setInviteEmail("")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send invite.")
    } finally {
      setIsInviting(false)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      await api.put("/api/workspaces/onboarding", {
        name: workspaceName,
        businessType: businessType || "Other"
      })
      toast.success("Workspace setup completed successfully!")
      navigate("/dashboard")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to complete onboarding.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    setIsLoading(true)
    try {
      await api.put("/api/workspaces/skip-onboarding")
      toast.info("Onboarding skipped.")
      navigate("/dashboard")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to skip onboarding.")
    } finally {
      setIsLoading(false)
    }
  }

  const businessTypes = [
    { id: "Tech", label: "Tech & Software", description: "SaaS, IT Services, Dev shops" },
    { id: "Consulting", label: "Consulting", description: "Business advisory, Strategy, HR" },
    { id: "Agency", label: "Agency & Design", description: "Marketing, Creative, UX/UI" },
    { id: "Retail", label: "Retail & E-commerce", description: "Physical shops, online brands" },
    { id: "Manufacturing", label: "Manufacturing", description: "Goods production, Logistics" },
    { id: "Other", label: "Other Services", description: "General business management" }
  ]

  const cardVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-screen overflow-hidden py-12 px-4">
      <ParticlesBackground />

      {/* Brand Header */}
      <motion.div
        className="relative z-10 flex flex-col items-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
            <Logo className="h-6 w-6 text-primary" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">SmartBiz</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-primary/80 bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10">
          <Sparkles className="h-3.5 w-3.5 animate-pulse text-yellow-400" />
          <span>Setting up your business intelligence platform</span>
        </div>
      </motion.div>

      {/* Progress Tracker */}
      <div className="relative z-10 w-full max-w-[480px] mb-8">
        <div className="flex justify-between items-center px-2">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex flex-col items-center">
              <button
                disabled={stepNum > step}
                onClick={() => setStep(stepNum)}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all border ${
                  step === stepNum
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                    : step > stepNum
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-background/40 text-muted-foreground border-border/50"
                }`}
              >
                {step > stepNum ? <Check className="h-4 w-4" /> : stepNum}
              </button>
              <span className={`text-xs mt-2 font-medium ${step === stepNum ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                {stepNum === 1 ? "Workspace" : stepNum === 2 ? "Industry" : "Team"}
              </span>
            </div>
          ))}
        </div>
        {/* Progress line */}
        <div className="absolute left-[15%] right-[15%] top-4.5 h-[2px] bg-border/20 -z-10">
          <div
            className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-300"
            style={{ width: `${(step - 1) * 50}%` }}
          ></div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[480px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="w-full shadow-2xl border border-border/40 bg-card/85 backdrop-blur-xl">
              
              {/* STEP 1: WORKSPACE NAME */}
              {step === 1 && (
                <>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold tracking-tight">Name your workspace</CardTitle>
                    <CardDescription>
                      This is the name of your organization, team, or company. It will appear at the top of your sidebar.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="ws-name">Workspace Name</label>
                      <Input
                        id="ws-name"
                        type="text"
                        placeholder="Rahul's Workspace"
                        className="bg-background/40 h-11 border-border/50 text-slate-200"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-border/25 pt-4 mt-2">
                    <Button variant="ghost" onClick={handleSkip} disabled={isLoading} className="text-muted-foreground hover:text-foreground">
                      Skip Onboarding
                    </Button>
                    <Button onClick={handleNext} disabled={!workspaceName} className="gap-1.5 font-semibold">
                      Next Step <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </>
              )}

              {/* STEP 2: BUSINESS TYPE */}
              {step === 2 && (
                <>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold tracking-tight">Select your industry</CardTitle>
                    <CardDescription>
                      Choose the category that best describes your workspace. This helps customize features.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {businessTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setBusinessType(type.id)}
                        className={`flex flex-col text-left p-3 rounded-lg border transition-all cursor-pointer ${
                          businessType === type.id
                            ? "bg-primary/15 border-primary shadow-[0_0_10px_rgba(var(--primary),0.15)]"
                            : "bg-background/30 border-border/40 hover:bg-background/60"
                        }`}
                      >
                        <span className="font-bold text-sm text-foreground">{type.label}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">{type.description}</span>
                      </button>
                    ))}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-border/25 pt-4 mt-2">
                    <Button variant="ghost" onClick={handleBack} className="gap-1 text-muted-foreground hover:text-foreground">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={handleSkip} disabled={isLoading} className="text-muted-foreground hover:text-foreground">
                        Skip
                      </Button>
                      <Button onClick={handleNext} className="gap-1.5 font-semibold">
                        Next <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </>
              )}

              {/* STEP 3: INVITE TEAM */}
              {step === 3 && (
                <>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold tracking-tight">Invite your team</CardTitle>
                    <CardDescription>
                      Onboard employees to delegate tasks and track progress together.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Invite via email form */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-primary uppercase tracking-wider">Invite by email address</label>
                      <form onSubmit={handleSendInvite} className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="teammate@company.com"
                            className="bg-background/40 h-10 pl-9 border-border/50"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                        </div>
                        <Button type="submit" disabled={isInviting || !inviteEmail} className="bg-secondary text-foreground hover:bg-secondary/80">
                          {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
                        </Button>
                      </form>
                    </div>

                    <div className="relative my-4 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/30"></div>
                      </div>
                      <span className="relative bg-card px-2.5 text-xs text-muted-foreground font-semibold">OR</span>
                    </div>

                    {/* Magic Link */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-primary uppercase tracking-wider">Share Magic Registration Link</label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={
                            isFetchingInvite
                              ? "Fetching link..."
                              : inviteToken
                              ? `${window.location.origin}/join?token=${inviteToken}`
                              : "Invite token unavailable."
                          }
                          className="bg-black/30 text-xs font-mono text-muted-foreground border-border/50"
                        />
                        <Button
                          type="button"
                          onClick={handleCopyInvite}
                          disabled={isFetchingInvite || !inviteToken}
                          className="bg-primary hover:bg-primary/95 text-primary-foreground min-w-[100px]"
                        >
                          {copiedInvite ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-border/25 pt-4 mt-2">
                    <Button variant="ghost" onClick={handleBack} disabled={isLoading} className="gap-1 text-muted-foreground hover:text-foreground">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={handleSkip} disabled={isLoading} className="text-muted-foreground hover:text-foreground">
                        Skip
                      </Button>
                      <Button onClick={handleComplete} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Complete Setup
                      </Button>
                    </div>
                  </CardFooter>
                </>
              )}

            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

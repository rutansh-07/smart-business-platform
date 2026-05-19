import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Bell, Shield, Key, Loader2, Check, Copy } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import api from "../utils/api"
import { toast } from "sonner"

export function Settings() {
  const [activeTab, setActiveTab] = useState("profile")
  
  // Profile State
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Security State
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // Notifications State (Mocked preferences)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [desktopAlerts, setDesktopAlerts] = useState(false)
  const [weeklyReports, setWeeklyReports] = useState(true)

  // API Keys State
  const [apiKeys, setApiKeys] = useState([])
  const [copiedKeyId, setCopiedKeyId] = useState(null)

  // Load user data on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("smartbiz_user")
    if (savedUser) {
      const parsed = JSON.parse(savedUser)
      setName(parsed.name || "")
      setEmail(parsed.email || "")
    }
  }, [])

  // 1. Update Profile Info in MongoDB & localStorage
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!name || !email) {
      return toast.warning("Name and Email are required.")
    }

    try {
      setIsSavingProfile(true)
      const response = await api.put("/api/auth/profile", { name, email })
      
      // Update local storage so the Navbar instantly changes too!
      const savedUser = JSON.parse(localStorage.getItem("smartbiz_user") || "{}")
      const updatedUser = { ...savedUser, name: response.data.name, email: response.data.email }
      localStorage.setItem("smartbiz_user", JSON.stringify(updatedUser))

      toast.success("Profile information updated successfully!")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.")
    } finally {
      setIsSavingProfile(false)
    }
  }

  // 2. Change Password in MongoDB
  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.warning("Please fill in all password fields.")
    }
    if (newPassword.length < 6) {
      return toast.warning("New password must be at least 6 characters.")
    }
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match.")
    }

    try {
      setIsSavingPassword(true)
      await api.put("/api/auth/password", { currentPassword, newPassword })
      toast.success("Password changed successfully!")
      
      // Reset form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password.")
    } finally {
      setIsSavingPassword(false)
    }
  }

  // 3. Generate a Mock API Key
  const handleGenerateKey = () => {
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
    const newKey = {
      id: Date.now(),
      name: `Key_${apiKeys.length + 1}`,
      value: `sb_live_${randomHex}`,
      createdAt: new Date().toLocaleDateString(),
    }
    setApiKeys([...apiKeys, newKey])
    toast.success("New API Key generated!")
  }

  // 4. Revoke API Key
  const handleRevokeKey = (id) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id))
    toast.success("API Key revoked successfully.")
  }

  // 5. Copy API Key to Clipboard
  const handleCopyKey = (id, value) => {
    navigator.clipboard.writeText(value)
    setCopiedKeyId(id)
    toast.success("API Key copied to clipboard!")
    setTimeout(() => setCopiedKeyId(null), 2000)
  }

  // Animation variants
  const tabContentVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
    transition: { duration: 0.2 }
  }

  return (
    <motion.div 
      className="flex flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent w-fit pb-1">
          Account Settings
        </h1>
        <p className="text-muted-foreground text-lg">Manage your profile updates, security, alerts, and SaaS developer settings.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[250px_1fr]">
        
        {/* Left Interactive Sidebar Nav - Dynamic Flex (Row on Mobile, Column on Desktop) */}
        <div className="flex flex-row overflow-x-auto md:flex-col gap-2 pb-3 md:pb-0 text-sm font-medium scrollbar-none snap-x whitespace-nowrap w-full">
          <Button 
            onClick={() => setActiveTab("profile")}
            variant={activeTab === "profile" ? "secondary" : "ghost"} 
            className="justify-start shadow-sm font-semibold gap-2 flex-shrink-0 snap-center cursor-pointer"
          >
            <User className="h-4 w-4 text-blue-500" /> Profile Information
          </Button>
          <Button 
            onClick={() => setActiveTab("security")}
            variant={activeTab === "security" ? "secondary" : "ghost"} 
            className="justify-start font-semibold gap-2 flex-shrink-0 snap-center cursor-pointer"
          >
            <Shield className="h-4 w-4 text-green-500" /> Passwords & Security
          </Button>
          <Button 
            onClick={() => setActiveTab("notifications")}
            variant={activeTab === "notifications" ? "secondary" : "ghost"} 
            className="justify-start font-semibold gap-2 flex-shrink-0 snap-center cursor-pointer"
          >
            <Bell className="h-4 w-4 text-orange-500" /> Notifications & Alerts
          </Button>
          <Button 
            onClick={() => setActiveTab("apikeys")}
            variant={activeTab === "apikeys" ? "secondary" : "ghost"} 
            className="justify-start font-semibold gap-2 flex-shrink-0 snap-center cursor-pointer"
          >
            <Key className="h-4 w-4 text-purple-500" /> Developer API Keys
          </Button>
        </div>

        {/* Right Tab Content Rendering Area */}
        <div className="flex flex-col gap-6 min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* 1. PROFILE INFORMATION TAB */}
            {activeTab === "profile" && (
              <motion.div key="profile" {...tabContentVariants}>
                <Card className="glass-panel border-none shadow-lg bg-card/60 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Update your personal details synced live to MongoDB Compass.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          className="bg-background/40 border-border/50" 
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <Input 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          type="email" 
                          className="bg-background/40 border-border/50" 
                          required
                        />
                      </div>
                      
                      <div className="flex justify-end pt-2">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button type="submit" disabled={isSavingProfile} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                            {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Save Profile
                          </Button>
                        </motion.div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 2. SECURITY & PASSWORDS TAB */}
            {activeTab === "security" && (
              <motion.div key="security" {...tabContentVariants}>
                <Card className="glass-panel border-none shadow-lg bg-card/60 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Passwords & Security</CardTitle>
                    <CardDescription>Update your password. New password will be re-hashed securely.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Current Password</label>
                        <Input 
                          type="password" 
                          placeholder="••••••••"
                          value={currentPassword} 
                          onChange={(e) => setCurrentPassword(e.target.value)} 
                          className="bg-background/40 border-border/50" 
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">New Password</label>
                        <Input 
                          type="password" 
                          placeholder="At least 6 characters"
                          value={newPassword} 
                          onChange={(e) => setNewPassword(e.target.value)} 
                          className="bg-background/40 border-border/50" 
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Confirm New Password</label>
                        <Input 
                          type="password" 
                          placeholder="Repeat new password"
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)} 
                          className="bg-background/40 border-border/50" 
                          required
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button type="submit" disabled={isSavingPassword} className="bg-green-600 hover:bg-green-700 text-white font-semibold">
                            {isSavingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Change Password
                          </Button>
                        </motion.div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 3. NOTIFICATIONS & ALERTS TAB */}
            {activeTab === "notifications" && (
              <motion.div key="notifications" {...tabContentVariants}>
                <Card className="glass-panel border-none shadow-lg bg-card/60 backdrop-blur">
                  <CardHeader>
                    <CardTitle>System Notifications</CardTitle>
                    <CardDescription>Toggle alerts and update preferences.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/20 border border-border/20">
                      <div>
                        <p className="font-bold text-sm text-foreground">Email Notifications</p>
                        <p className="text-xs text-muted-foreground">Receive daily performance digests and active alerts.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={emailAlerts} 
                        onChange={() => setEmailAlerts(!emailAlerts)}
                        className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/20 border border-border/20">
                      <div>
                        <p className="font-bold text-sm text-foreground">Desktop Instant Alerts</p>
                        <p className="text-xs text-muted-foreground">Show push notification banners on client changes.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={desktopAlerts} 
                        onChange={() => setDesktopAlerts(!desktopAlerts)}
                        className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-background/20 border border-border/20">
                      <div>
                        <p className="font-bold text-sm text-foreground">Weekly Enterprise Reports</p>
                        <p className="text-xs text-muted-foreground">Receive custom summary metrics every Monday morning.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={weeklyReports} 
                        onChange={() => setWeeklyReports(!weeklyReports)}
                        className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 4. DEVELOPER API KEYS TAB */}
            {activeTab === "apikeys" && (
              <motion.div key="apikeys" {...tabContentVariants}>
                <Card className="glass-panel border-none shadow-lg bg-card/60 backdrop-blur">
                  <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                      <CardTitle>Developer Access Keys</CardTitle>
                      <CardDescription>Integrate external scripts with the SmartBiz Platform API.</CardDescription>
                    </div>
                    <Button onClick={handleGenerateKey} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                      Generate Key
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {apiKeys.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm font-medium border border-dashed border-border/50 rounded-lg">
                        No active API keys. Click "Generate Key" to create your first credential.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {apiKeys.map((key) => (
                          <div 
                            key={key.id} 
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-background/30 border border-border/50"
                          >
                            <div className="space-y-1">
                              <p className="font-bold text-xs text-purple-400">{key.name}</p>
                              <code className="text-xs font-mono bg-black/30 px-2 py-1 rounded select-all block sm:inline-block w-fit text-muted-foreground truncate max-w-[280px]">
                                {key.value}
                              </code>
                            </div>
                            <div className="flex gap-2 self-end sm:self-auto">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 gap-1.5"
                                onClick={() => handleCopyKey(key.id, key.value)}
                              >
                                {copiedKeyId === key.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                <span>{copiedKeyId === key.id ? "Copied" : "Copy"}</span>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="h-8"
                                onClick={() => handleRevokeKey(key.id)}
                              >
                                Revoke
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  )
}

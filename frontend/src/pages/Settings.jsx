import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Bell, Shield, Key, Loader2, Check, Copy, Users, RefreshCw, Trash2, Mail } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import api from "../utils/api"
import { toast } from "sonner"

export function Settings() {
  const [activeTab, setActiveTab] = useState("profile")
  
  // Profile State
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [avatar, setAvatar] = useState("")
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [user, setUser] = useState(null)

  // Workspace State
  const [workspaceInfo, setWorkspaceInfo] = useState(null)
  const [wsName, setWsName] = useState("")
  const [wsBusinessType, setWsBusinessType] = useState("")
  const [isSavingWorkspace, setIsSavingWorkspace] = useState(false)
  const [isFetchingWorkspace, setIsFetchingWorkspace] = useState(false)

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

  // Invite Team State
  const [inviteToken, setInviteToken] = useState("")
  const [copiedInvite, setCopiedInvite] = useState(false)
  const [isFetchingInvite, setIsFetchingInvite] = useState(false)
  const [isRegeneratingInvite, setIsRegeneratingInvite] = useState(false)

  // Team Members State
  const [teamMembers, setTeamMembers] = useState([])
  const [isFetchingMembers, setIsFetchingMembers] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)

  // Load user data on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("smartbiz_user")
    if (savedUser) {
      const parsed = JSON.parse(savedUser)
      setUser(parsed)
      setName(parsed.name || "")
      setEmail(parsed.email || "")
      setAvatar(parsed.avatar || "")
    }
  }, [])

  const fetchWorkspaceDetails = async () => {
    try {
      setIsFetchingWorkspace(true)
      const { data } = await api.get("/api/workspaces")
      setWorkspaceInfo(data)
      setWsName(data.name || "")
      setWsBusinessType(data.businessType || "")
    } catch (error) {
      console.error("Failed to fetch workspace details:", error)
    } finally {
      setIsFetchingWorkspace(false)
    }
  }

  useEffect(() => {
    if (user?.role === "admin" && activeTab === "profile") {
      fetchWorkspaceDetails()
    }
  }, [user, activeTab])

  const handleUpdateWorkspace = async (e) => {
    e.preventDefault()
    if (!wsName) {
      return toast.warning("Workspace name is required.")
    }

    try {
      setIsSavingWorkspace(true)
      const response = await api.put("/api/workspaces", { name: wsName, businessType: wsBusinessType })
      setWorkspaceInfo(response.data.workspace)
      
      // Update local copy of workspaceName if any or just notify
      toast.success("Workspace settings updated successfully!")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update workspace settings.")
    } finally {
      setIsSavingWorkspace(false)
    }
  }

  // 1. Update Profile Info in MongoDB & localStorage
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!name || !email) {
      return toast.warning("Name and Email are required.")
    }

    try {
      setIsSavingProfile(true)
      const response = await api.put("/api/auth/profile", { name, email, avatar })
      
      // Update local storage so the Navbar instantly changes too!
      const savedUser = JSON.parse(localStorage.getItem("smartbiz_user") || "{}")
      const updatedUser = { ...savedUser, name: response.data.name, email: response.data.email, avatar: response.data.avatar }
      localStorage.setItem("smartbiz_user", JSON.stringify(updatedUser))

      toast.success("Profile information updated successfully!")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.")
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Upload Avatar Image
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append("image", file)

    try {
      setIsUploading(true)
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
      const { data } = await api.post("/api/upload", formData, config)
      setAvatar(data)
      toast.success("Image uploaded successfully! Click 'Save Profile' to apply.")
    } catch (error) {
      toast.error(error.response?.data?.message || "Image upload failed.")
    } finally {
      setIsUploading(false)
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

  // 6. Fetch/Generate Invite Link
  const handleFetchInvite = async () => {
    try {
      setIsFetchingInvite(true)
      const { data } = await api.get("/api/workspaces/invite")
      setInviteToken(data.token)
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to fetch invite token."
      toast.error(msg)
    } finally {
      setIsFetchingInvite(false)
    }
  }

  // 7. Regenerate Invite Link (get a brand-new token)
  const handleRegenerateInvite = async () => {
    try {
      setIsRegeneratingInvite(true)
      const { data } = await api.post("/api/workspaces/regenerate-invite")
      setInviteToken(data.token)
      toast.success("New invite link generated! Share it with your team.")
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to regenerate invite token."
      toast.error(msg)
    } finally {
      setIsRegeneratingInvite(false)
    }
  }

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/join?token=${inviteToken}`
    navigator.clipboard.writeText(inviteUrl)
    setCopiedInvite(true)
    toast.success("Magic Invite Link copied to clipboard!")
    setTimeout(() => setCopiedInvite(false), 2000)
  }

  // 8. Fetch Team Members
  const fetchTeamMembers = async () => {
    try {
      setIsFetchingMembers(true)
      const { data } = await api.get("/api/workspaces/members")
      setTeamMembers(data)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch team members.")
    } finally {
      setIsFetchingMembers(false)
    }
  }

  // 9. Invite Member by Email
  const handleInviteEmail = async (e) => {
    e.preventDefault()
    if (!inviteEmail) return
    try {
      setIsInviting(true)
      await api.post("/api/workspaces/invite-email", { email: inviteEmail })
      toast.success("User invited successfully!")
      setInviteEmail("")
      fetchTeamMembers()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to invite user.")
    } finally {
      setIsInviting(false)
    }
  }

  // 10. Remove Team Member
  const handleRemoveMember = async (id) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return
    try {
      await api.delete(`/api/workspaces/members/${id}`)
      toast.success("Member removed.")
      fetchTeamMembers()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member.")
    }
  }

  // Fetch invite and members on load when team tab is opened
  useEffect(() => {
    if (activeTab === "team") {
      if (!inviteToken) handleFetchInvite()
      fetchTeamMembers()
    }
  }, [activeTab])

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
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent w-fit pb-1">
          Account Settings
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your profile, security, alerts, and developer settings.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[250px_1fr]">
        
        {/* Left Interactive Sidebar Nav */}
        <div className="flex flex-row overflow-x-auto scrollbar-none md:flex-col gap-1.5 pb-2 md:pb-0 text-sm font-medium snap-x shrink-0">
          {[
            { key: "profile", icon: User, color: "text-blue-500", label: "Profile" },
            { key: "security", icon: Shield, color: "text-green-500", label: "Security" },
            { key: "notifications", icon: Bell, color: "text-orange-500", label: "Notifications" },
            ...(user?.role === "admin" ? [
              { key: "team", icon: Users, color: "text-blue-500", label: "Invite Team" },
              { key: "apikeys", icon: Key, color: "text-purple-500", label: "API Keys" }
            ] : []),
          ].map(({ key, icon: Icon, color, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold whitespace-nowrap snap-center transition-all cursor-pointer shrink-0 text-left ${
                activeTab === key
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${color}`} />
              {label}
            </button>
          ))}
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
                      
                      {/* Avatar Upload Section */}
                      <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border/50">
                        <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center shrink-0">
                          {avatar ? (
                            <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-10 w-10 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Profile Picture</label>
                          <div className="flex items-center gap-3">
                            <Input 
                              type="file" 
                              id="image-file" 
                              onChange={uploadFileHandler}
                              className="text-xs max-w-[250px] cursor-pointer"
                              accept="image/*"
                            />
                            {isUploading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                          </div>
                          <p className="text-xs text-muted-foreground">JPG, PNG or GIF up to 5MB.</p>
                        </div>
                      </div>

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
                </Card>

                {user?.role === "admin" && (
                  <Card className="glass-panel border-none shadow-lg bg-card/60 backdrop-blur mt-6">
                    <CardHeader>
                      <CardTitle>Workspace Settings</CardTitle>
                      <CardDescription>Configure your organization's workspace name and industry.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isFetchingWorkspace ? (
                        <div className="flex justify-center py-6">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : (
                        <form onSubmit={handleUpdateWorkspace} className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Workspace Name</label>
                            <Input
                              value={wsName}
                              onChange={(e) => setWsName(e.target.value)}
                              className="bg-background/40 border-border/50"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Business / Industry Type</label>
                            <select
                              value={wsBusinessType}
                              onChange={(e) => setWsBusinessType(e.target.value)}
                              className="flex h-10 w-full rounded-md border border-border/50 bg-background/40 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-200"
                            >
                              <option value="Tech">Tech & Software</option>
                              <option value="Consulting">Consulting</option>
                              <option value="Agency">Agency & Design</option>
                              <option value="Retail">Retail & E-commerce</option>
                              <option value="Manufacturing">Manufacturing</option>
                              <option value="Other">Other Services</option>
                            </select>
                          </div>

                          <div className="flex justify-end pt-2">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button type="submit" disabled={isSavingWorkspace} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                                {isSavingWorkspace ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Save Workspace
                              </Button>
                            </motion.div>
                          </div>
                        </form>
                      )}
                    </CardContent>
                  </Card>
                )}
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
            {activeTab === "apikeys" && user?.role === "admin" && (
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

            {/* 5. INVITE TEAM TAB */}
            {activeTab === "team" && user?.role === "admin" && (
              <motion.div key="team" {...tabContentVariants}>
                <Card className="glass-panel border-none shadow-lg bg-card/60 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Invite Team Members</CardTitle>
                    <CardDescription>
                      Share this magic link with your employees. When they click it, they will automatically join your secure company workspace.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-blue-400">Workspace Magic Link</label>

                      {/* Link Input + Copy Button */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Input
                            readOnly
                            value={
                              isFetchingInvite
                                ? "Fetching your invite link..."
                                : inviteToken
                                ? `${window.location.origin}/join?token=${inviteToken}`
                                : "Could not load invite link — try regenerating below."
                            }
                            className="bg-black/40 font-mono text-xs pr-10 border-blue-500/30 text-muted-foreground"
                          />
                          {isFetchingInvite && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-400" />
                          )}
                        </div>
                        <Button
                          onClick={handleCopyInvite}
                          disabled={!inviteToken || isFetchingInvite}
                          className="bg-blue-600 hover:bg-blue-700 text-white min-w-[130px]"
                        >
                          {copiedInvite ? (
                            <><Check className="h-4 w-4 mr-2" /> Copied!</>
                          ) : (
                            <><Copy className="h-4 w-4 mr-2" /> Copy Link</>
                          )}
                        </Button>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Anyone with this link can create an employee account inside your workspace. Keep it private.
                      </p>

                      {/* Regenerate Button */}
                      <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                        <div className="flex-1">
                          <p className="text-sm font-medium">Rotate Invite Link</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Generate a new token. The old link will immediately stop working.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleRegenerateInvite}
                          disabled={isRegeneratingInvite || isFetchingInvite}
                          className="border-blue-500/40 hover:bg-blue-500/10 text-blue-400 shrink-0"
                        >
                          {isRegeneratingInvite ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Regenerating...</>
                          ) : (
                            <><RefreshCw className="h-4 w-4 mr-2" /> Regenerate</>
                          )}
                        </Button>
                      </div>

                      {/* Invite By Email Form */}
                      <div className="pt-4 mt-2 border-t border-border/30">
                        <label className="text-sm font-bold text-blue-400 mb-2 block">Invite via Email</label>
                        <form onSubmit={handleInviteEmail} className="flex flex-col sm:flex-row gap-3">
                          <div className="relative flex-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="employee@company.com"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              className="pl-9 bg-black/40 border-blue-500/30"
                              required
                            />
                          </div>
                          <Button 
                            type="submit" 
                            disabled={isInviting || !inviteEmail}
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[130px]"
                          >
                            {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Invite"}
                          </Button>
                        </form>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Members Table */}
                <Card className="glass-panel border-none shadow-lg bg-card/60 backdrop-blur mt-6">
                  <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      Manage employees in your workspace. Pending users have been invited but haven't joined yet.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isFetchingMembers ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                      </div>
                    ) : teamMembers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No team members found.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-muted-foreground uppercase bg-black/20">
                            <tr>
                              <th className="px-4 py-3 rounded-tl-lg">User</th>
                              <th className="px-4 py-3">Role</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {teamMembers.map((member) => (
                              <tr key={member._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 overflow-hidden shrink-0">
                                      {member.avatar ? (
                                        <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                                      ) : (
                                        <User className="h-4 w-4" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-medium text-slate-200">{member.name}</div>
                                      <div className="text-xs text-muted-foreground">{member.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="capitalize">{member.role}</span>
                                </td>
                                <td className="px-4 py-3">
                                  {member.status === "pending" ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
                                      Pending
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                      Active
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {member._id !== user?._id && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                      onClick={() => handleRemoveMember(member._id)}
                                      title="Remove Member"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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

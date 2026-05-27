import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Briefcase, Clock, CheckCircle2, CircleDashed, Plus, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import api from "../utils/api"
import { toast } from "sonner"
import { useSocket } from "../context/SocketContext"

function ProjectCardSkeleton() {
  return (
    <Card className="shadow-md bg-card/60 backdrop-blur border border-border/20 h-full flex flex-col justify-between p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-5 w-44 bg-muted-foreground/10 rounded animate-pulse" />
          <div className="h-4 w-32 bg-muted-foreground/10 rounded animate-pulse" />
        </div>
        <div className="h-10 w-10 bg-muted-foreground/10 rounded-full animate-pulse" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 bg-muted-foreground/10 rounded animate-pulse" />
          <div className="h-4 w-8 bg-muted-foreground/10 rounded animate-pulse" />
        </div>
        <div className="w-full bg-muted-foreground/5 rounded-full h-2.5 animate-pulse" />
        <div className="h-3 w-20 bg-muted-foreground/10 rounded ml-auto animate-pulse" />
      </div>
    </Card>
  )
}

export function Projects() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [user, setUser] = useState(null)
  
  const { socket } = useSocket()

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  
  // New Project Form State
  const [name, setName] = useState("")
  const [client, setClient] = useState("")
  const [status, setStatus] = useState("Planning")
  const [progress, setProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch projects from MongoDB
  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const response = await api.get("/api/projects")
      setProjects(response.data)
    } catch (error) {
      toast.error("Failed to load projects from database.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const savedUser = localStorage.getItem("smartbiz_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    fetchProjects()
  }, [])

  // Socket.IO Real-Time Updates
  useEffect(() => {
    if (!socket) return

    socket.on("project_created", (newProject) => {
      setProjects((prev) => {
        // Prevent duplicate if this client created it
        if (prev.some((p) => p._id === newProject._id)) return prev;
        return [newProject, ...prev];
      })
      toast.info(`New Project Added: ${newProject.name}`)
    })

    socket.on("project_updated", (updatedProject) => {
      setProjects((prev) => prev.map((p) => (p._id === updatedProject._id ? updatedProject : p)))
      // Only toast for updates not made by us. Too much noise otherwise.
    })

    socket.on("project_deleted", (deletedId) => {
      setProjects((prev) => prev.filter((p) => p._id !== deletedId))
      toast.warning("A project was removed.")
    })

    return () => {
      socket.off("project_created")
      socket.off("project_updated")
      socket.off("project_deleted")
    }
  }, [socket])

  // Create Project
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !client) {
      return toast.warning("Please fill out all required fields.")
    }

    try {
      setIsSubmitting(true)
      const response = await api.post("/api/projects", {
        name,
        client,
        status,
        progress: Number(progress),
      })
      
      setProjects([response.data, ...projects])
      toast.success("Project created successfully!")
      
      // Reset form
      setName("")
      setClient("")
      setStatus("Planning")
      setProgress(0)
      setIsFormOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete Project
  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/projects/${id}`)
      setProjects(projects.filter((p) => p._id !== id))
      toast.success("Project deleted successfully.")
    } catch (error) {
      toast.error("Failed to delete project.")
    }
  }

  // Quick Progress Increment
  const handleIncrementProgress = async (project) => {
    if (project.progress >= 100) return
    const nextProgress = Math.min(project.progress + 10, 100)
    const nextStatus = nextProgress === 100 ? "Completed" : "In Progress"

    try {
      const response = await api.put(`/api/projects/${project._id}`, {
        progress: nextProgress,
        status: nextStatus,
      })
      
      setProjects(projects.map((p) => p._id === project._id ? response.data : p))
    } catch (error) {
      toast.error("Failed to update progress.")
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return { icon: CheckCircle2, color: "text-green-500" }
      case "In Progress":
        return { icon: CircleDashed, color: "text-blue-500 animate-spin" }
      default:
        return { icon: Clock, color: "text-orange-500" }
    }
  }

  // Derived filtered projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.client.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "All" || project.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <motion.div 
      className="flex flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header: Title on top, controls on bottom row */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent w-fit pb-1">
            Active Projects
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage and track your deliverables inside MongoDB.</p>
        </div>

        {/* Controls Row: Search + Filter + Add Button — all in one responsive row */}
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search by name or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[160px] max-w-xs bg-card/60 backdrop-blur h-9 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-border/50 bg-card/60 backdrop-blur text-sm font-medium focus:outline-none min-w-[130px]"
          >
            <option className="bg-card" value="All">All Status</option>
            <option className="bg-card" value="Planning">Planning</option>
            <option className="bg-card" value="In Progress">In Progress</option>
            <option className="bg-card" value="Completed">Completed</option>
          </select>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="ml-auto">
            <Button onClick={() => setIsFormOpen(!isFormOpen)} className="shadow-lg bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold h-9 text-sm whitespace-nowrap">
              {isFormOpen ? "Close" : "Add Project"}
              <Plus className={`h-4 w-4 transition-transform duration-300 ${isFormOpen ? "rotate-45" : ""}`} />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Expandable Add Project Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="border-none bg-card/60 backdrop-blur shadow-lg">
              <CardHeader>
                <CardTitle>Create New Project</CardTitle>
                <CardDescription>Enter details to add this project straight to MongoDB Compass.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project Name</label>
                    <Input 
                      placeholder="e.g. Website Redesign" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background/40 border-border/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Client Name</label>
                    <Input 
                      placeholder="e.g. Tata Consultancy" 
                      value={client} 
                      onChange={(e) => setClient(e.target.value)}
                      className="bg-background/40 border-border/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-border/50 bg-background/40 text-sm font-medium text-foreground focus:outline-none"
                    >
                      <option className="bg-card text-foreground" value="Planning">Planning</option>
                      <option className="bg-card text-foreground" value="In Progress">In Progress</option>
                      <option className="bg-card text-foreground" value="Completed">Completed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Progress ({progress}%)</label>
                    <Input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={progress} 
                      onChange={(e) => setProgress(e.target.value)}
                      className="bg-transparent h-10 cursor-pointer"
                    />
                  </div>
                  <div className="col-span-full flex justify-end mt-2">
                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold min-w-[120px]">
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save to DB"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects List Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      ) : projects.length === 0 ? (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/50 rounded-xl bg-card/20 backdrop-blur text-center"
        >
          <Briefcase className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-bold">No Projects Found</h3>
          <p className="text-muted-foreground max-w-sm mt-1">
            {projects.length === 0 
              ? 'Get started by creating your very first project using the "Add Project" button above!'
              : 'Try adjusting your search or filters.'}
          </p>
        </motion.div>
      ) : (
        <motion.div 
          className="grid gap-6 md:grid-cols-2"
          layout
        >
          <AnimatePresence>
            {filteredProjects.map((project) => {
              const { icon: Icon, color } = getStatusIcon(project.status)
              return (
                <motion.div 
                  key={project._id} 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="shadow-md bg-card/60 backdrop-blur border-none glass-panel h-full flex flex-col justify-between group">
                    <CardHeader className="pb-3 flex flex-row justify-between items-start">
                      <div>
                        <CardTitle className="text-xl mb-1 flex items-center gap-2">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="text-base font-medium text-foreground/70">{project.client}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {user?.role === "admin" && (
                          <Button 
                            onClick={() => handleDelete(project._id)}
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <div className={`p-3 rounded-full bg-background/50 shadow-inner ${color.replace('animate-spin', '')}`}>
                          <Briefcase className="h-5 w-5 text-blue-500" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-bold flex items-center gap-1.5 cursor-pointer select-none`} onClick={() => handleIncrementProgress(project)}>
                          <Icon className="h-4 w-4" />
                          {project.status}
                          {project.progress < 100 && (
                            <ChevronUp className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                          )}
                        </span>
                        <span className="text-sm font-bold">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                        <motion.div 
                          className={`h-2.5 rounded-full bg-blue-500 opacity-80`} 
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        ></motion.div>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2 text-right">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}

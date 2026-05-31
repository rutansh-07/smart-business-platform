import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Kanban,
  Users2,
  CheckCircle2,
  Timer,
  ListTodo,
  Zap,
} from "lucide-react";
import { TaskProvider, useTask } from "../context/TaskContext";
import { KanbanBoard } from "../components/KanbanBoard";
import api from "../utils/api";

// Inner component (uses TaskContext)
function ProjectTasksInner({ project, members }) {
  const { tasks, isLoading } = useTask();

  const stats = {
    todo: tasks.filter((t) => t.status === "todo").length,
    inprogress: tasks.filter((t) => t.status === "inprogress").length,
    done: tasks.filter((t) => t.status === "done").length,
    total: tasks.length,
  };

  const completion = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── Stats Bar ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
      >
        {[
          {
            label: "Total Tasks",
            value: stats.total,
            icon: Kanban,
            color: "from-slate-500 to-slate-600",
            bg: "bg-slate-500/10",
            text: "text-slate-800 dark:text-slate-300",
          },
          {
            label: "To Do",
            value: stats.todo,
            icon: ListTodo,
            color: "from-slate-400 to-slate-500",
            bg: "bg-slate-500/10",
            text: "text-slate-800 dark:text-slate-300",
          },
          {
            label: "In Progress",
            value: stats.inprogress,
            icon: Timer,
            color: "from-violet-500 to-indigo-600",
            bg: "bg-violet-500/10",
            text: "text-violet-700 dark:text-violet-300",
          },
          {
            label: "Completed",
            value: stats.done,
            icon: CheckCircle2,
            color: "from-emerald-500 to-teal-500",
            bg: "bg-emerald-500/10",
            text: "text-emerald-700 dark:text-emerald-300",
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -2 }}
            className={`flex items-center gap-3 p-4 rounded-xl border border-border ${stat.bg} backdrop-blur`}
          >
            <div className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg flex-shrink-0`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className={`text-xl font-bold ${stat.text}`}>{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── Progress Bar ─────────────────────────────────────── */}
      {stats.total > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 px-1"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium">
              Overall Completion
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{completion}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}

      {/* ─── Team Avatars ────────────────────────────────────── */}
      {members.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-2 mb-6"
        >
          <Users2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground mr-2">Team:</span>
          <div className="flex -space-x-2">
            {members.slice(0, 6).map((m) => {
              const initials = m.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              return (
                <div
                  key={m._id}
                  title={m.name}
                  className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white border-2 border-background shadow"
                >
                  {initials}
                </div>
              );
            })}
            {members.length > 6 && (
              <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-muted-foreground border-2 border-background">
                +{members.length - 6}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ─── Kanban Board ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex-1"
      >
        <KanbanBoard
          projectId={project._id}
          projectName={project.name}
          members={members}
        />
      </motion.div>
    </div>
  );
}

// Outer page component
export function ProjectTasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [projectRes, membersRes] = await Promise.all([
          api.get(`/api/projects/${projectId}`),
          api.get("/api/workspaces/team"),
        ]);
        setProject(projectRes.data);
        setMembers(membersRes.data || []);
      } catch {
        // If members endpoint fails, just continue without assignee support
        try {
          const projectRes = await api.get(`/api/projects/${projectId}`);
          setProject(projectRes.data);
        } catch {
          navigate("/projects");
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [projectId, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
            <Zap className="absolute inset-0 m-auto h-5 w-5 text-violet-400" />
          </div>
          <p className="text-sm text-muted-foreground">Loading task board...</p>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <TaskProvider>
      <motion.div
        className="flex flex-col gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* ─── Page Header ─────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/projects")}
              className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white transition-colors border border-white/5 hover:border-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                  <Kanban className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
                  Task Board
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                {project.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Client: <span className="text-foreground/80 font-medium">{project.client}</span>
                {" · "}
                <span
                  className={`font-medium ${
                    project.status === "Completed"
                      ? "text-emerald-400"
                      : project.status === "In Progress"
                      ? "text-violet-400"
                      : "text-amber-400"
                  }`}
                >
                  {project.status}
                </span>
              </p>
            </div>
          </div>

          {/* Live badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
        </div>

        {/* ─── Inner board ─────────────────────────────────── */}
        <ProjectTasksInner project={project} members={members} />
      </motion.div>
    </TaskProvider>
  );
}

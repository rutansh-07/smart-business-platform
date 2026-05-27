import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import {
  Plus,
  Loader2,
  CheckCircle2,
  Timer,
  ListTodo,
  X,
  Zap,
  User,
  Users,
  Filter,
  BarChart2,
} from "lucide-react";
import { toast } from "sonner";
import { useTask } from "../context/TaskContext";
import { useSocket } from "../context/SocketContext";
import { TaskCard } from "./TaskCard";

// ─── Helpers ─────────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function MemberAvatar({ member, size = "sm", selected = false, onClick }) {
  const cls = size === "sm" ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-xs";
  return (
    <button
      type={onClick ? "button" : undefined}
      onClick={onClick}
      title={member.name}
      className={`${cls} rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white flex-shrink-0 transition-all
        ${onClick ? "hover:ring-2 hover:ring-violet-400 cursor-pointer" : ""}
        ${selected ? "ring-2 ring-violet-400 scale-110" : ""}
      `}
    >
      {getInitials(member.name)}
    </button>
  );
}

// ─── Column Config ───────────────────────────────────────────────
const COLUMNS = [
  {
    id: "todo",
    label: "To Do",
    icon: ListTodo,
    accent: "from-slate-500 to-slate-600",
    badge: "bg-slate-500/20 text-slate-300",
    border: "border-slate-500/20",
    headerBg: "bg-slate-500/10",
  },
  {
    id: "inprogress",
    label: "In Progress",
    icon: Timer,
    accent: "from-violet-500 to-indigo-600",
    badge: "bg-violet-500/20 text-violet-300",
    border: "border-violet-500/20",
    headerBg: "bg-violet-500/10",
  },
  {
    id: "done",
    label: "Done",
    icon: CheckCircle2,
    accent: "from-emerald-500 to-teal-600",
    badge: "bg-emerald-500/20 text-emerald-300",
    border: "border-emerald-500/20",
    headerBg: "bg-emerald-500/10",
  },
];

// ─── Assignee Picker ─────────────────────────────────────────────
function AssigneePicker({ members, value, onChange, currentUser }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
        Assign To
      </p>
      {/* Quick "Assign to me" */}
      {currentUser && (
        <button
          type="button"
          onClick={() =>
            onChange(value === currentUser._id ? "" : currentUser._id)
          }
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all
            ${
              value === currentUser._id
                ? "bg-violet-600/30 border-violet-500/50 text-violet-300"
                : "bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:border-white/20"
            }`}
        >
          <User className="h-3.5 w-3.5" />
          {value === currentUser._id ? "✓ Assigned to me" : "Assign to me"}
        </button>
      )}
      {/* Member avatars row */}
      {members.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <button
              key={m._id}
              type="button"
              onClick={() => onChange(value === m._id ? "" : m._id)}
              title={m.name}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-semibold transition-all
                ${
                  value === m._id
                    ? "bg-violet-600/30 border-violet-500/50 text-white"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20 hover:text-white"
                }`}
            >
              <span
                className={`h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white
                  ${value === m._id ? "bg-violet-500" : "bg-slate-600"}`}
              >
                {getInitials(m.name)}
              </span>
              {m.name.split(" ")[0]}
              {m._id === currentUser?._id && (
                <span className="text-violet-400">(me)</span>
              )}
            </button>
          ))}
        </div>
      )}
      {/* Fallback: unassigned */}
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-[10px] text-rose-400/70 hover:text-rose-400 transition-colors underline underline-offset-2"
        >
          Remove assignee
        </button>
      )}
    </div>
  );
}

// ─── Quick Add Form ───────────────────────────────────────────────
function QuickAddForm({ columnId, projectId, onClose, members, currentUser }) {
  const { createTask } = useTask();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.warning("Task title is required");
    setIsSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        status: columnId,
        priority,
        assignee: assignee || null,
        projectId,
        dueDate: dueDate || null,
      });
      toast.success("Task created!");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-xl border border-white/10 bg-[#13172b]/95 backdrop-blur p-4 shadow-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Title */}
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-semibold text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Add details (optional)..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-muted-foreground placeholder:text-white/20 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        />

        {/* Priority & Due date */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              Priority
            </p>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="low" className="bg-[#1a1f2e]">🟢 Low</option>
              <option value="medium" className="bg-[#1a1f2e]">🟡 Medium</option>
              <option value="high" className="bg-[#1a1f2e]">🔴 High</option>
            </select>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              Due Date
            </p>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Assignee Picker */}
        <div className="pt-1 border-t border-white/5">
          <AssigneePicker
            members={members}
            value={assignee}
            onChange={setAssignee}
            currentUser={currentUser}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/10 text-muted-foreground text-xs transition-colors"
          >
            <X className="h-3.5 w-3.5" /> Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-violet-500/20"
          >
            {isSubmitting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Plus className="h-3 w-3" />
            )}
            Create Task
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Team Members Bar ─────────────────────────────────────────────
function TeamMembersBar({ members }) {
  if (!members.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur"
    >
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <Users className="h-3.5 w-3.5" /> Workspace Team
      </p>
      <div className="flex flex-wrap gap-3">
        {members.map((m) => (
          <div
            key={m._id}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 shadow">
              {getInitials(m.name)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-white/90 truncate leading-snug">
                  {m.name}
                </p>
                {m.status === "pending" && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/10 uppercase tracking-widest scale-90 flex-shrink-0">
                    Invited
                  </span>
                )}
              </div>
              <p className="text-[9px] text-muted-foreground leading-none mt-0.5 uppercase tracking-wider">
                {m.role === "admin" ? "Owner" : "Employee"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Filter Bar ──────────────────────────────────────────────────
function FilterBar({ members, currentUser, activeFilter, onFilterChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
        <Filter className="h-3 w-3" /> Filter:
      </span>
      <button
        onClick={() => onFilterChange(null)}
        className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all
          ${!activeFilter
            ? "bg-violet-600/30 border-violet-500/50 text-violet-300"
            : "bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:border-white/20"
          }`}
      >
        All Tasks
      </button>
      {currentUser && (
        <button
          onClick={() =>
            onFilterChange(
              activeFilter === currentUser._id ? null : currentUser._id
            )
          }
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all
            ${activeFilter === currentUser._id
              ? "bg-violet-600/30 border-violet-500/50 text-violet-300"
              : "bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:border-white/20"
            }`}
        >
          <User className="h-3 w-3" /> My Tasks
        </button>
      )}
      {members
        .filter((m) => m._id !== currentUser?._id)
        .map((m) => (
          <button
            key={m._id}
            onClick={() =>
              onFilterChange(activeFilter === m._id ? null : m._id)
            }
            title={m.name}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all
              ${activeFilter === m._id
                ? "bg-violet-600/30 border-violet-500/50 text-violet-300"
                : "bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:border-white/20"
              }`}
          >
            <span
              className={`h-3.5 w-3.5 rounded-full flex items-center justify-center text-[7px] font-bold text-white
                ${activeFilter === m._id ? "bg-violet-500" : "bg-slate-600"}`}
            >
              {getInitials(m.name)}
            </span>
            {m.name.split(" ")[0]}
          </button>
        ))}
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────
function KanbanColumn({ column, tasks, projectId, currentUser, members }) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const taskIds = tasks.map((t) => t._id);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Column Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 rounded-t-2xl ${column.headerBg} border-b ${column.border}`}
      >
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${column.accent}`}>
            <column.icon className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white">{column.label}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${column.badge}`}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setShowQuickAdd(true)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
          title="Add task"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Tasks container */}
      <div
        className={`flex-1 overflow-y-auto p-3 space-y-3 rounded-b-2xl bg-white/[0.02] border ${column.border} border-t-0 min-h-[200px] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10`}
      >
        <AnimatePresence>
          {showQuickAdd && (
            <QuickAddForm
              key="quick-add"
              columnId={column.id}
              projectId={projectId}
              onClose={() => setShowQuickAdd(false)}
              members={members}
              currentUser={currentUser}
            />
          )}
        </AnimatePresence>

        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                currentUser={currentUser}
                members={members}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        {tasks.length === 0 && !showQuickAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <div className={`p-3 rounded-full bg-gradient-to-br ${column.accent} opacity-20 mb-3`}>
              <column.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-xs text-muted-foreground/60">No tasks here</p>
            <button
              onClick={() => setShowQuickAdd(true)}
              className="mt-2 text-xs text-muted-foreground hover:text-white transition-colors underline underline-offset-2"
            >
              Add one
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Main Kanban Board ────────────────────────────────────────────
export function KanbanBoard({ projectId, projectName, members = [] }) {
  const {
    tasks,
    isLoading,
    loadTasks,
    reorderTasksLocally,
    persistReorder,
    handleSocketTaskCreated,
    handleSocketTaskUpdated,
    handleSocketTaskDeleted,
    handleSocketTasksReordered,
  } = useTask();

  const { socket, joinWorkspace } = useSocket();
  const [activeTask, setActiveTask] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [assigneeFilter, setAssigneeFilter] = useState(null);
  const [showWorkload, setShowWorkload] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("smartbiz_user");
    if (saved) {
      const user = JSON.parse(saved);
      setCurrentUser(user);
      if (user.workspaceId && joinWorkspace) {
        joinWorkspace(user.workspaceId);
      }
    }
    loadTasks(projectId);
  }, [projectId, loadTasks, joinWorkspace]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    const onCreated = (task) => {
      if (String(task.project) === String(projectId)) {
        handleSocketTaskCreated(task);
        toast.info(`New task: ${task.title}`, { icon: <Zap className="h-4 w-4" /> });
      }
    };
    const onUpdated = (task) => {
      if (String(task.project) === String(projectId)) handleSocketTaskUpdated(task);
    };
    const onDeleted = (payload) => {
      if (String(payload.projectId) === String(projectId)) handleSocketTaskDeleted(payload);
    };
    const onReordered = (payload) => handleSocketTasksReordered(payload);

    socket.on("task_created", onCreated);
    socket.on("task_updated", onUpdated);
    socket.on("task_deleted", onDeleted);
    socket.on("tasks_reordered", onReordered);
    return () => {
      socket.off("task_created", onCreated);
      socket.off("task_updated", onUpdated);
      socket.off("task_deleted", onDeleted);
      socket.off("tasks_reordered", onReordered);
    };
  }, [socket, projectId, handleSocketTaskCreated, handleSocketTaskUpdated, handleSocketTaskDeleted, handleSocketTasksReordered]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Apply assignee filter
  const filteredTasks = assigneeFilter
    ? tasks.filter(
        (t) => t.assignee?._id === assigneeFilter || t.assignee === assigneeFilter
      )
    : tasks;

  // Split into columns
  const tasksByColumn = COLUMNS.reduce((acc, col) => {
    acc[col.id] = filteredTasks
      .filter((t) => t.status === col.id)
      .sort((a, b) => a.order - b.order);
    return acc;
  }, {});

  const handleDragStart = useCallback(
    ({ active }) => {
      const task = tasks.find((t) => t._id === active.id);
      setActiveTask(task || null);
    },
    [tasks]
  );

  const handleDragOver = useCallback(
    ({ active, over }) => {
      if (!over) return;
      const activeId = active.id;
      const overId = over.id;
      if (activeId === overId) return;
      const activeTask = tasks.find((t) => t._id === activeId);
      const overTask = tasks.find((t) => t._id === overId);
      const overColumn = COLUMNS.find((c) => c.id === overId);
      if (!activeTask) return;
      const targetStatus = overColumn?.id || overTask?.status;
      if (!targetStatus || activeTask.status === targetStatus) return;
      reorderTasksLocally(
        tasks.map((t) => (t._id === activeId ? { ...t, status: targetStatus } : t))
      );
    },
    [tasks, reorderTasksLocally]
  );

  const handleDragEnd = useCallback(
    async ({ active, over }) => {
      setActiveTask(null);
      if (!over) return;
      const activeId = active.id;
      const overId = over.id;
      const activeTask = tasks.find((t) => t._id === activeId);
      const overTask = tasks.find((t) => t._id === overId);
      const overColumn = COLUMNS.find((c) => c.id === overId);
      if (!activeTask) return;
      const targetStatus = overColumn?.id || overTask?.status || activeTask.status;
      let columnTasks = tasks.filter((t) =>
        t._id === activeId ? t.status === targetStatus : t.status === targetStatus
      );
      if (activeTask.status === targetStatus && overTask) {
        const oldIdx = columnTasks.findIndex((t) => t._id === activeId);
        const newIdx = columnTasks.findIndex((t) => t._id === overId);
        columnTasks = arrayMove(columnTasks, oldIdx, newIdx);
      }
      const reorderData = columnTasks.map((t, i) => ({
        _id: t._id,
        status: targetStatus,
        order: i,
      }));
      const allUpdated = tasks.map((t) => {
        const found = reorderData.find((r) => r._id === t._id);
        return found ? { ...t, status: found.status, order: found.order } : t;
      });
      reorderTasksLocally(allUpdated);
      try {
        await persistReorder(reorderData);
        if (activeTask.status !== targetStatus) {
          toast.success(`Moved to "${COLUMNS.find((c) => c.id === targetStatus)?.label}"`);
        }
      } catch {
        toast.error("Failed to save reorder");
        loadTasks(projectId);
      }
    },
    [tasks, reorderTasksLocally, persistReorder, loadTasks, projectId]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Toolbar ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
        <FilterBar
          members={members}
          currentUser={currentUser}
          activeFilter={assigneeFilter}
          onFilterChange={setAssigneeFilter}
        />
        {members.length > 0 && (
          <button
            onClick={() => setShowWorkload((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all mb-4
              ${showWorkload
                ? "bg-indigo-600/30 border-indigo-500/50 text-indigo-300"
                : "bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:border-white/20"
              }`}
          >
            <Users className="h-3.5 w-3.5" />
            {showWorkload ? "Hide Team" : "Show Team"}
          </button>
        )}
      </div>

      {/* ── Team Members Bar ───────────────────────────────── */}
      <AnimatePresence>
        {showWorkload && <TeamMembersBar members={members} />}
      </AnimatePresence>

      {/* ── Kanban columns ────────────────────────────────── */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={tasksByColumn[col.id] || []}
              projectId={projectId}
              currentUser={currentUser}
              members={members}
            />
          ))}
        </div>

        {createPortal(
          <DragOverlay>
            {activeTask && (
              <div className="rotate-2 scale-105 opacity-90 pointer-events-none">
                <TaskCard task={activeTask} currentUser={currentUser} members={members} />
              </div>
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  Pencil,
  User2,
  Calendar,
  X,
  Check,
  Loader2,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useTask } from "../context/TaskContext";

// ─── Helpers ──────────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const PRIORITY_CONFIG = {
  low: {
    label: "Low",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  medium: {
    label: "Medium",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    dot: "bg-amber-400",
  },
  high: {
    label: "High",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/30",
    dot: "bg-rose-400",
  },
};

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Completion Checkbox ──────────────────────────────────────────
function CompletionCheckbox({ isDone, isToggling, onToggle }) {
  return (
    <button
      onClick={onToggle}
      disabled={isToggling}
      title={isDone ? "Mark as In Progress" : "Mark as Done"}
      className={`
        flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center
        transition-all duration-200 focus:outline-none
        ${isDone
          ? "bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          : "border-white/20 hover:border-emerald-400 bg-transparent hover:bg-emerald-500/10"
        }
        ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <AnimatePresence>
        {isDone && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <Check className="h-2.5 w-2.5 text-white stroke-[3]" />
          </motion.div>
        )}
        {isToggling && !isDone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Loader2 className="h-2.5 w-2.5 text-emerald-400 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

// ─── Assignee Chip (with reassign dropdown) ───────────────────────
function AssigneeChip({ task, currentUser, members, canEdit, onReassign }) {
  const [open, setOpen] = useState(false);
  const assignee = task.assignee;
  const isAssignedToMe =
    assignee?._id === currentUser?._id || assignee === currentUser?._id;

  const displayName = assignee?.name
    ? assignee.name.split(" ")[0]
    : null;
  const initials = assignee?.name ? getInitials(assignee.name) : null;

  return (
    <div className="relative">
      <button
        onClick={() => canEdit && setOpen((o) => !o)}
        disabled={!canEdit}
        className={`flex items-center gap-1.5 transition-all group/assignee
          ${canEdit ? "cursor-pointer hover:opacity-80" : "cursor-default"}
        `}
        title={assignee ? `Assigned to ${assignee.name}` : "Unassigned"}
      >
        {initials ? (
          <>
            <div
              className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow
                ${isAssignedToMe
                  ? "bg-gradient-to-br from-violet-500 to-indigo-600 ring-2 ring-violet-400/50"
                  : "bg-gradient-to-br from-slate-500 to-slate-600"
                }`}
            >
              {initials}
            </div>
            <span
              className={`text-[10px] font-semibold ${
                isAssignedToMe ? "text-violet-400" : "text-muted-foreground"
              }`}
            >
              {isAssignedToMe ? "Me" : displayName}
            </span>
          </>
        ) : (
          <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <User2 className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
        {canEdit && (
          <ChevronDown className="h-3 w-3 text-muted-foreground opacity-0 group-hover/assignee:opacity-100 transition-opacity" />
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && canEdit && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="absolute bottom-full right-0 mb-2 w-48 rounded-xl border border-white/10 bg-[#13172b] shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-2">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-1">
                  Assign to
                </p>
                {/* Unassign option */}
                <button
                  onClick={() => { onReassign(null); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors
                    ${!assignee ? "text-white bg-white/10" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                >
                  <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center border border-white/10 flex-shrink-0">
                    <User2 className="h-3 w-3" />
                  </div>
                  Unassigned
                  {!assignee && <Check className="h-3 w-3 ml-auto text-violet-400" />}
                </button>

                {/* Me first */}
                {currentUser && (
                  <button
                    onClick={() => { onReassign(currentUser._id); setOpen(false); }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors
                      ${isAssignedToMe ? "text-white bg-violet-600/20" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                  >
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                      {getInitials(currentUser.name || "")}
                    </div>
                    <span className="truncate">{currentUser.name?.split(" ")[0]} (me)</span>
                    {isAssignedToMe && <Check className="h-3 w-3 ml-auto text-violet-400 flex-shrink-0" />}
                  </button>
                )}

                {/* Other members */}
                {members
                  .filter((m) => m._id !== currentUser?._id)
                  .map((m) => {
                    const isSelected =
                      assignee?._id === m._id || assignee === m._id;
                    return (
                      <button
                        key={m._id}
                        onClick={() => { onReassign(m._id); setOpen(false); }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors
                          ${isSelected ? "text-white bg-white/10" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                      >
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                          {getInitials(m.name)}
                        </div>
                        <span className="truncate">{m.name.split(" ")[0]}</span>
                        <span className="text-[9px] text-muted-foreground/60 ml-1">{m.role}</span>
                        {isSelected && <Check className="h-3 w-3 ml-auto text-violet-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main TaskCard ────────────────────────────────────────────────
export function TaskCard({ task, currentUser, members = [] }) {
  const { updateTask, deleteTask } = useTask();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const isDone = task.status === "done";
  const isCreator = task.creator?._id === currentUser?._id || task.creator === currentUser?._id;
  const isAdmin = currentUser?.role === "admin";
  const canEdit = isCreator || isAdmin;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { type: "task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  // ── Completion toggle ─────────────────────────────────────────
  const handleToggleComplete = async () => {
    setIsToggling(true);
    const newStatus = isDone ? "inprogress" : "done";
    try {
      await updateTask(task._id, { status: newStatus });
      if (!isDone) {
        toast.success("🎉 Task marked as done!", { description: task.title });
      } else {
        toast.info("Task moved back to In Progress");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update task");
    } finally {
      setIsToggling(false);
    }
  };

  // ── Reassign ──────────────────────────────────────────────────
  const handleReassign = async (memberId) => {
    try {
      await updateTask(task._id, { assignee: memberId });
      const name = members.find((m) => m._id === memberId)?.name;
      toast.success(memberId ? `Assigned to ${name}` : "Assignee removed");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reassign task");
    }
  };

  // ── Edit save ─────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return toast.warning("Task title cannot be empty");
    setIsSaving(true);
    try {
      await updateTask(task._id, { title: editTitle.trim(), description: editDesc.trim() });
      toast.success("Task updated!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update task");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask(task._id);
      toast.success("Task deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete task");
      setIsDeleting(false);
    }
  };

  const dueDateStr = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : null;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`group relative rounded-xl border backdrop-blur-sm p-4 shadow-lg hover:shadow-xl transition-all duration-200
        ${isDragging
          ? "shadow-2xl ring-2 ring-violet-500/50 scale-[1.02] bg-[#1a1f2e]/80"
          : isDone
          ? "bg-emerald-950/30 border-emerald-500/20 hover:border-emerald-500/30"
          : "bg-[#1a1f2e]/80 border-white/5 hover:border-white/10"
        }
      `}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 cursor-grab active:cursor-grabbing transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          /* ── Edit Mode ─────────────────────────────────── */
          <motion.div
            key="editing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              placeholder="Task title..."
            />
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              placeholder="Description (optional)..."
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => { setIsEditing(false); setEditTitle(task.title); setEditDesc(task.description || ""); }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Save
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── View Mode ─────────────────────────────────── */
          <motion.div key="viewing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Edit / Delete buttons — creator or admin */}
            {canEdit && (
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                  title="Edit task"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-colors"
                  title="Delete task"
                >
                  {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}

            {/* Checkbox + Title ─────────────────────────── */}
            <div className="flex items-start gap-2.5 pr-14 pl-1 mb-2">
              <div className="mt-0.5">
                <CompletionCheckbox
                  isDone={isDone}
                  isToggling={isToggling}
                  onToggle={handleToggleComplete}
                />
              </div>
              <p className={`text-sm font-semibold leading-snug transition-all duration-300 line-clamp-2
                ${isDone ? "line-through text-muted-foreground/50" : "text-white"}`}
              >
                {task.title}
              </p>
            </div>

            {/* Description ──────────────────────────────── */}
            {task.description && (
              <p className={`text-xs line-clamp-2 pl-1 mb-3 ${isDone ? "text-muted-foreground/40 line-through" : "text-muted-foreground"}`}>
                {task.description}
              </p>
            )}

            {/* Done stamp ───────────────────────────────── */}
            {isDone && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 pl-1 mb-2"
              >
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <Check className="h-2.5 w-2.5 stroke-[3]" /> Completed
                </span>
              </motion.div>
            )}

            {/* Footer: priority + due + assignee chip ───── */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <PriorityBadge priority={task.priority} />
                {dueDateStr && (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${isOverdue ? "text-rose-400" : "text-muted-foreground"}`}>
                    <Calendar className="h-2.5 w-2.5" />
                    {dueDateStr}
                  </span>
                )}
              </div>

              {/* Assignee chip — creator/admin can click to reassign */}
              <AssigneeChip
                task={task}
                currentUser={currentUser}
                members={members}
                canEdit={canEdit}
                onReassign={handleReassign}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

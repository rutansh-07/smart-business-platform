import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { createWorkspaceNotification } from "./notificationController.js";
// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Protected
export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const workspaceId = req.user.workspaceId;

    // Make sure the project belongs to this workspace
    const project = await Project.findOne({ _id: projectId, workspaceId });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const tasks = await Task.find({ project: projectId, workspaceId })
      .populate("assignee", "name email avatar")
      .populate("creator", "name email avatar")
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("getTasksByProject error:", error);
    res.status(500).json({ message: "Server error fetching tasks" });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Protected
export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignee, projectId, order, dueDate } = req.body;
    const workspaceId = req.user.workspaceId;

    // Verify project belongs to this workspace
    const project = await Project.findOne({ _id: projectId, workspaceId });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Determine order: put it at the bottom of the status column
    let taskOrder = order;
    if (taskOrder === undefined || taskOrder === null) {
      const lastTask = await Task.findOne({ project: projectId, status: status || "todo" })
        .sort({ order: -1 })
        .select("order");
      taskOrder = lastTask ? lastTask.order + 1 : 0;
    }

    const task = await Task.create({
      title,
      description: description || "",
      status: status || "todo",
      priority: priority || "medium",
      assignee: assignee || null,
      project: projectId,
      workspaceId,
      creator: req.user._id,
      order: taskOrder,
      dueDate: dueDate || null,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignee", "name email avatar")
      .populate("creator", "name email avatar");

    // Create Notification
    await createWorkspaceNotification(
      workspaceId,
      req.user._id,
      "created task",
      populatedTask.title
    );

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error("createTask error:", error);
    res.status(500).json({ message: "Server error creating task" });
  }
};

// @desc    Update a task (status, title, description, assignee, order, priority)
// @route   PUT /api/tasks/:id
// @access  Protected
//   - status/order changes: any workspace member (for completion tick & drag-drop)
//   - title/description/priority/assignee changes: creator or admin only
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user.workspaceId;
    const { title, description, status, priority, assignee, order, dueDate } = req.body;

    const task = await Task.findOne({ _id: id, workspaceId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Capture the old assignee before mutation so we can detect changes
    const previousAssignee = task.assignee ? task.assignee.toString() : null;

    const isCreator = task.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isAnyMember = true; // Already verified by workspaceId match above

    // Determine if sensitive fields are being changed
    const hasSensitiveChanges =
      title !== undefined ||
      description !== undefined ||
      priority !== undefined ||
      dueDate !== undefined;

    // Only creator or admin can change sensitive content fields
    if (hasSensitiveChanges && !isCreator && !isAdmin) {
      return res.status(403).json({ message: "Only the task creator can edit task details" });
    }

    // Any workspace member can change status, order, and assignee
    if (status !== undefined) task.status = status;
    if (order !== undefined) task.order = order;
    if (assignee !== undefined) task.assignee = assignee;

    // Sensitive fields — creator/admin only
    if (hasSensitiveChanges) {
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignee", "name email avatar")
      .populate("creator", "name email avatar");

    // Create Notification
    await createWorkspaceNotification(
      workspaceId,
      req.user._id,
      "updated task",
      updatedTask.title
    );

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("updateTask error:", error);
    res.status(500).json({ message: "Server error updating task" });
  }
};


// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Protected (creator or admin only)
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user.workspaceId;

    const task = await Task.findOne({ _id: id, workspaceId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isCreator = task.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: "Only the task creator can delete this task" });
    }

    await task.deleteOne();

    // Create Notification
    await createWorkspaceNotification(
      workspaceId,
      req.user._id,
      "deleted task",
      task.title
    );

    res.status(200).json({ message: "Task deleted", taskId: id });
  } catch (error) {
    console.error("deleteTask error:", error);
    res.status(500).json({ message: "Server error deleting task" });
  }
};

// @desc    Reorder tasks (bulk update orders after drag-and-drop)
// @route   PUT /api/tasks/reorder
// @access  Protected
export const reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body; // Array of { _id, status, order }
    const workspaceId = req.user.workspaceId;

    const bulkOps = tasks.map(({ _id, status, order }) => ({
      updateOne: {
        filter: { _id, workspaceId },
        update: { $set: { status, order } },
      },
    }));

    await Task.bulkWrite(bulkOps);

    // Create Notification
    await createWorkspaceNotification(
      workspaceId,
      req.user._id,
      "reordered tasks",
      "Board"
    );

    res.status(200).json({ message: "Tasks reordered successfully" });
  } catch (error) {
    console.error("reorderTasks error:", error);
    res.status(500).json({ message: "Server error reordering tasks" });
  }
};

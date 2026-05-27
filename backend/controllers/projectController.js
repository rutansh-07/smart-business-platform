import Project from "../models/Project.js";
import { getIO } from "../socket.js";

// @desc    Get all projects for the logged-in user
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    // Filter by the logged-in user's workspace to isolate data
    // Fallback: If old user has no workspaceId, return empty array instead of throwing Mongoose error
    if (!req.user.workspaceId) {
      return res.json([]);
    }
    const projects = await Project.find({ workspaceId: req.user.workspaceId });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
  try {
    const { name, client, status, progress } = req.body;

    if (!req.user.workspaceId) {
      return res.status(403).json({ message: "You must belong to a workspace to create projects. Please create a new account." });
    }

    const project = new Project({
      name,
      client,
      status,
      progress,
      user: req.user._id, // Set the creator ID
      workspaceId: req.user.workspaceId, // Isolate to the workspace
    });

    const createdProject = await project.save();
    
    // Emit real-time event to the workspace room
    try {
      getIO().to(`workspace_${req.user.workspaceId}`).emit("project_created", createdProject);
    } catch (err) {
      console.error("Socket emit failed:", err);
    }

    res.status(201).json(createdProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res) => {
  try {
    const { name, client, status, progress } = req.body;
    const project = await Project.findById(req.params.id);

    if (project) {
      // Verify workspace ownership — guard against null/undefined workspaceId on legacy data
      if (!req.user.workspaceId || !project.workspaceId) {
        return res.status(403).json({ message: "Workspace data is missing. Please use a valid account." });
      }
      if (project.workspaceId.toString() !== req.user.workspaceId.toString()) {
        return res.status(403).json({ message: "Not authorized to update this project in this workspace" });
      }

      project.name = name || project.name;
      project.client = client || project.client;
      project.status = status || project.status;
      project.progress = progress !== undefined ? progress : project.progress;

      const updatedProject = await project.save();

      // Emit real-time event
      try {
        getIO().to(`workspace_${req.user.workspaceId}`).emit("project_updated", updatedProject);
      } catch (err) {
        console.error("Socket emit failed:", err);
      }

      res.json(updatedProject);
    } else {
      res.status(404).json({ message: "Project not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (project) {
      // Verify workspace ownership — guard against null/undefined workspaceId on legacy data
      if (!req.user.workspaceId || !project.workspaceId) {
        return res.status(403).json({ message: "Workspace data is missing. Please use a valid account." });
      }
      if (project.workspaceId.toString() !== req.user.workspaceId.toString()) {
        return res.status(403).json({ message: "Not authorized to delete this project in this workspace" });
      }

      await project.deleteOne();

      // Emit real-time event
      try {
        getIO().to(`workspace_${req.user.workspaceId}`).emit("project_deleted", req.params.id);
      } catch (err) {
        console.error("Socket emit failed:", err);
      }

      res.json({ message: "Project removed successfully" });
    } else {
      res.status(404).json({ message: "Project not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

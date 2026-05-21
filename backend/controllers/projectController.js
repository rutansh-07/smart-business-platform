import Project from "../models/Project.js";

// @desc    Get all projects for the logged-in user
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id });
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

    const project = new Project({
      name,
      client,
      status,
      progress,
      user: req.user._id, // Set the creator ID from request object (loaded by authMiddleware)
    });

    const createdProject = await project.save();
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
      // Verify ownership
      if (project.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to update this project" });
      }

      project.name = name || project.name;
      project.client = client || project.client;
      project.status = status || project.status;
      project.progress = progress !== undefined ? progress : project.progress;

      const updatedProject = await project.save();
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
      // Verify ownership
      if (project.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to delete this project" });
      }

      await project.deleteOne();
      res.json({ message: "Project removed successfully" });
    } else {
      res.status(404).json({ message: "Project not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

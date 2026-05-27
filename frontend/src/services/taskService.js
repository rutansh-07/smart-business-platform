import api from "../utils/api";

/**
 * Fetch all tasks for a specific project
 * @param {string} projectId
 */
export const fetchProjectTasks = async (projectId) => {
  const response = await api.get(`/api/tasks/project/${projectId}`);
  return response.data;
};

/**
 * Create a new task
 * @param {Object} taskData - { title, description, status, priority, assignee, projectId, dueDate }
 */
export const createTask = async (taskData) => {
  const response = await api.post("/api/tasks", taskData);
  return response.data;
};

/**
 * Update an existing task
 * @param {string} taskId
 * @param {Object} updates - fields to update
 */
export const updateTask = async (taskId, updates) => {
  const response = await api.put(`/api/tasks/${taskId}`, updates);
  return response.data;
};

/**
 * Delete a task
 * @param {string} taskId
 */
export const deleteTask = async (taskId) => {
  const response = await api.delete(`/api/tasks/${taskId}`);
  return response.data;
};

/**
 * Bulk reorder tasks after a drag-and-drop operation
 * @param {Array} tasks - Array of { _id, status, order }
 */
export const reorderTasks = async (tasks) => {
  const response = await api.put("/api/tasks/reorder", { tasks });
  return response.data;
};

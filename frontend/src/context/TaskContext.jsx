import { createContext, useContext, useState, useCallback } from "react";
import {
  fetchProjectTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  reorderTasks as apiReorderTasks,
} from "../services/taskService";

const TaskContext = createContext();

export const useTask = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load all tasks for a project
  const loadTasks = useCallback(async (projectId) => {
    setIsLoading(true);
    try {
      const data = await fetchProjectTasks(projectId);
      setTasks(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a task and optimistically update local state
  const createTask = useCallback(async (taskData) => {
    const newTask = await apiCreateTask(taskData);
    setTasks((prev) => {
      // Prevent duplicate in case socket fires first
      if (prev.some((t) => t._id === newTask._id)) return prev;
      return [...prev, newTask];
    });
    return newTask;
  }, []);

  // Update a task
  const updateTask = useCallback(async (taskId, updates) => {
    const updated = await apiUpdateTask(taskId, updates);
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    return updated;
  }, []);

  // Delete a task
  const deleteTask = useCallback(async (taskId) => {
    await apiDeleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  }, []);

  // Reorder tasks (after drag and drop) - optimistic
  const reorderTasksLocally = useCallback((updatedTasks) => {
    setTasks(updatedTasks);
  }, []);

  const persistReorder = useCallback(async (reorderData) => {
    await apiReorderTasks(reorderData);
  }, []);

  // Socket handlers — called from KanbanBoard to sync external updates
  const handleSocketTaskCreated = useCallback((task) => {
    setTasks((prev) => {
      if (prev.some((t) => t._id === task._id)) return prev;
      return [...prev, task];
    });
  }, []);

  const handleSocketTaskUpdated = useCallback((task) => {
    setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
  }, []);

  const handleSocketTaskDeleted = useCallback(({ taskId }) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  }, []);

  const handleSocketTasksReordered = useCallback(({ tasks: reordered }) => {
    setTasks((prev) => {
      const map = Object.fromEntries(reordered.map((r) => [r._id, r]));
      return prev.map((t) =>
        map[t._id] ? { ...t, status: map[t._id].status, order: map[t._id].order } : t
      );
    });
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        loadTasks,
        createTask,
        updateTask,
        deleteTask,
        reorderTasksLocally,
        persistReorder,
        handleSocketTaskCreated,
        handleSocketTaskUpdated,
        handleSocketTaskDeleted,
        handleSocketTasksReordered,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

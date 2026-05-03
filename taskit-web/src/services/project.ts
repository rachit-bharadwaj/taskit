import api from '../lib/api';

export const projectService = {
  getProjects: async () => {
    const response = await api.get('/projects');
    return response.data.projects;
  },
  getStats: async () => {
    const response = await api.get('/projects/stats');
    return response.data.stats;
  },
  createProject: async (data: { name: string; description?: string }) => {
    const response = await api.post('/projects', data);
    return response.data.project;
  },
  addMember: async (data: { projectId: number; email: string; role?: string }) => {
    const response = await api.post('/projects/members', data);
    return response.data;
  },
};

export const taskService = {
  getProjectTasks: async (projectId: number) => {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data.tasks;
  },
  createTask: async (data: {
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: string;
    projectId: number;
    assigneeId?: number;
  }) => {
    const response = await api.post('/tasks', data);
    return response.data.task;
  },
  updateTask: async (taskId: number, data: any) => {
    const response = await api.put(`/tasks/${taskId}`, data);
    return response.data.task;
  },
};

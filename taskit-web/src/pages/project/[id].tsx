import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  Search,
  User,
  Users,
  Clock
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'revine';
import { taskService, projectService } from '../../services/project';

export default function ProjectDetails() {
  const { id } = useParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [newTask, setNewTask] = useState<any>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    projectId: parseInt(id || '0'),
    assigneeId: undefined
  });

  useEffect(() => {
    if (id) {
      fetchTasks();
      fetchMembers();
    }
  }, [id]);

  const fetchTasks = async () => {
    try {
      const data = await taskService.getProjectTasks(parseInt(id || '0'));
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    // I need to implement this in the service and backend
    try {
      const response = await projectService.getMembers(parseInt(id || '0'));
      setMembers(response);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await taskService.createTask(newTask);
      setNewTask({ ...newTask, title: '', description: '' });
      setShowTaskModal(false);
      fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectService.addMember({ projectId: parseInt(id || '0'), email: memberEmail, role: 'member' });
      setMemberEmail('');
      setShowMemberModal(false);
      fetchMembers();
    } catch (error) {
      console.error("Error adding member:", error);
      alert('Failed to add member. Make sure the user exists.');
    }
  };

  const updateTaskStatus = async (taskId: number, status: string) => {
    try {
      await taskService.updateTask(taskId, { status });
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-8">
      <header className="mb-12">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors mb-6 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold mb-2">Project Tasks</h1>
            <div className="flex items-center gap-4 text-slate-400">
              <p>Track individual tasks and project milestones.</p>
              <div className="h-4 w-px bg-white/10" />
              <button 
                onClick={() => setShowMemberModal(true)}
                className="flex items-center gap-2 hover:text-indigo-400 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>{members.length} Members</span>
              </button>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          </div>
        </div>
      </header>

      {/* Kanban-style Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <TaskColumn
          title="To Do"
          tasks={tasks.filter(t => t.status === 'todo' && t.title.toLowerCase().includes(searchQuery.toLowerCase()))}
          onStatusChange={updateTaskStatus}
        />
        <TaskColumn
          title="In Progress"
          tasks={tasks.filter(t => t.status === 'in_progress' && t.title.toLowerCase().includes(searchQuery.toLowerCase()))}
          onStatusChange={updateTaskStatus}
        />
        <TaskColumn
          title="Done"
          tasks={tasks.filter(t => t.status === 'done' && t.title.toLowerCase().includes(searchQuery.toLowerCase()))}
          onStatusChange={updateTaskStatus}
        />
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-6">Add New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Priority</label>
                <select 
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Assignee</label>
                <select 
                  value={newTask.assigneeId || ''}
                  onChange={(e) => setNewTask({ ...newTask, assigneeId: parseInt(e.target.value) || undefined })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                >
                  <option value="">Unassigned</option>
                  {members.map((m: any) => (
                    <option key={m.user.id} value={m.user.id}>{m.user.name || m.user.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors h-32 resize-none"
                  placeholder="Task details..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold transition-all shadow-lg shadow-indigo-600/20"
                >
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Member Management Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Team Members</h2>
              <button onClick={() => setShowMemberModal(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {members.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
                      {m.user.name?.[0] || m.user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{m.user.name || 'User'}</div>
                      <div className="text-xs text-slate-500">{m.user.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">Add New Member</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <input 
                  type="email" 
                  required
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="user@example.com"
                />
              </div>
              <button 
                type="submit"
                className="w-full px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold transition-all shadow-lg shadow-indigo-600/20"
              >
                Add to Team
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function TaskColumn({ title, tasks, onStatusChange }: { title: string, tasks: any[], onStatusChange: (id: number, status: string) => void }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col h-[700px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full ${title === 'To Do' ? 'bg-indigo-500' :
              title === 'In Progress' ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
          <h3 className="font-bold text-slate-300">{title}</h3>
          <span className="bg-white/5 px-2 py-0.5 rounded text-xs text-slate-500">{tasks.length}</span>
        </div>
        <button className="text-slate-600 hover:text-white transition-colors">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task, onStatusChange }: { task: any, onStatusChange: (id: number, status: string) => void }) {
  return (
    <motion.div
      layoutId={task.id.toString()}
      className="bg-slate-900 border border-white/10 p-5 rounded-2xl hover:border-white/20 transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${task.priority === 'high' ? 'bg-rose-500/10 text-rose-500' :
            task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'
          }`}>
          {task.priority}
        </span>
        <div className="flex gap-1">
          {task.status !== 'done' && (
            <button
              onClick={() => onStatusChange(task.id, task.status === 'todo' ? 'in_progress' : 'done')}
              className="text-slate-600 hover:text-emerald-400 transition-colors"
              title="Move to next status"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <h4 className="font-bold mb-2 text-slate-200">{task.title}</h4>
      <p className="text-slate-400 text-xs line-clamp-2 mb-4">{task.description}</p>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
          <Calendar className="h-3 w-3" />
          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
        </div>
        <div className="h-6 w-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-400">
          {task.assigneeName ? task.assigneeName[0].toUpperCase() : (task.assigneeId ? 'U' : <User className="h-3 w-3 text-slate-500" />)}
        </div>
      </div>
    </motion.div>
  );
}

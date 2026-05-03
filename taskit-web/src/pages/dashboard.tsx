import { 
  LayoutDashboard, 
  Plus, 
  Folder, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Search
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { projectService } from '../services/project';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalProjects: 0, inProgress: 0, completed: 0, overdue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsData, statsData] = await Promise.all([
        projectService.getProjects(),
        projectService.getStats()
      ]);
      setProjects(projectsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectService.createProject(newProject);
      setNewProject({ name: '', description: '' });
      setShowCreateModal(false);
      fetchData();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-8">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Projects</h1>
          <p className="text-slate-400">Manage your teams and track progress across all projects.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="h-5 w-5" />
          New Project
        </button>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<Folder className="text-indigo-400" />} label="Total Projects" value={stats.totalProjects} />
        <StatCard icon={<Clock className="text-amber-400" />} label="In Progress" value={stats.inProgress} />
        <StatCard icon={<CheckCircle2 className="text-emerald-400" />} label="Completed" value={stats.completed} />
        <StatCard icon={<AlertCircle className="text-rose-400" />} label="Overdue" value={stats.overdue} />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-20">
            <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : projects.length > 0 ? (
          projects.map((p: any) => (
            <ProjectCard key={p.project.id} project={p.project} role={p.role} />
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <Folder className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-400">No projects found</h3>
            <p className="text-slate-500 mb-6">Start by creating your first project.</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="text-indigo-400 font-bold hover:underline"
            >
              Create Project
            </button>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Project Name</label>
                <input 
                  type="text" 
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g. Website Redesign"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                <textarea 
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors h-32 resize-none"
                  placeholder="What is this project about?"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold transition-all shadow-lg shadow-indigo-600/20"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: any, label: string, value: any }) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-white/20 transition-all">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center border border-white/5">
          {icon}
        </div>
        <span className="text-slate-400 font-medium text-sm">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

import { Link } from 'revine';

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

function ProjectCard({ project, role }: { project: any, role: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-indigo-500/50 transition-all group"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="h-12 w-12 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
          <Folder className="h-6 w-6 text-indigo-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${role === 'admin' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
            {role}
          </span>
          <button className="text-slate-500 hover:text-white transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <Link href={`/project/${project.id}`} className="block">
        <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{project.name}</h3>
        <p className="text-slate-400 text-sm line-clamp-2 mb-6 h-10">{project.description || 'No description provided.'}</p>
      </Link>

      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <div className="flex -space-x-2">
          <div className="h-8 w-8 rounded-full border-2 border-slate-950 bg-indigo-600 flex items-center justify-center text-[10px] font-bold">
            {role === 'admin' ? 'A' : 'M'}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          <span>Updated {formatRelativeTime(project.updatedAt)}</span>
        </div>
      </div>
    </motion.div>
  );
}

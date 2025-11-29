import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', project_id: '' });
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [activeTab, setActiveTab] = useState('tasks');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchStats();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      if (response.ok) {
        setNewTask({ title: '', description: '', project_id: '' });
        fetchTasks();
        fetchStats();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
    setLoading(false);
  };

  const createProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });
      if (response.ok) {
        setNewProject({ name: '', description: '' });
        fetchProjects();
        fetchStats();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
    setLoading(false);
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentStatus === 'completed' ? 'pending' : 'completed' })
      });
      if (response.ok) {
        fetchTasks();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
        if (response.ok) {
          fetchTasks();
          fetchStats();
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'No Project';
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
          <h1>📋 TaskFlow</h1>
          <p>AWS DevOps Project - React + Express + PostgreSQL</p>
        </div>
      </header>

      <div className="container">
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h3>{stats.totalTasks}</h3>
                <p>Total Tasks</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{stats.completedTasks}</h3>
                <p>Completed</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>{stats.pendingTasks}</h3>
                <p>Pending</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📁</div>
              <div className="stat-info">
                <h3>{stats.totalProjects}</h3>
                <p>Projects</p>
              </div>
            </div>
          </div>
        )}

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
          <button 
            className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
        </div>

        {activeTab === 'tasks' && (
          <div className="tab-content">
            <div className="form-card">
              <h2>Create New Task</h2>
              <form onSubmit={createTask}>
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                />
                <select
                  value={newTask.project_id}
                  onChange={(e) => setNewTask({...newTask, project_id: e.target.value})}
                >
                  <option value="">No Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                <button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </form>
            </div>

            <div className="filter-bar">
              <button 
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={filter === 'pending' ? 'active' : ''}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={filter === 'completed' ? 'active' : ''}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
            </div>

            <div className="tasks-list">
              {filteredTasks.length === 0 ? (
                <div className="empty-state">
                  <p>No tasks found. Create your first task!</p>
                </div>
              ) : (
                filteredTasks.map(task => (
                  <div key={task.id} className={`task-card ${task.status}`}>
                    <div className="task-header">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => toggleTaskStatus(task.id, task.status)}
                      />
                      <h3>{task.title}</h3>
                      <button 
                        className="delete-btn"
                        onClick={() => deleteTask(task.id)}
                      >
                        🗑️
                      </button>
                    </div>
                    <p className="task-description">{task.description}</p>
                    <div className="task-footer">
                      <span className="project-tag">{getProjectName(task.project_id)}</span>
                      <span className="task-date">
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="tab-content">
            <div className="form-card">
              <h2>Create New Project</h2>
              <form onSubmit={createProject}>
                <input
                  type="text"
                  placeholder="Project name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Project description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
              </form>
            </div>

            <div className="projects-grid">
              {projects.length === 0 ? (
                <div className="empty-state">
                  <p>No projects found. Create your first project!</p>
                </div>
              ) : (
                projects.map(project => {
                  const projectTasks = tasks.filter(t => t.project_id === project.id);
                  const completedCount = projectTasks.filter(t => t.status === 'completed').length;
                  
                  return (
                    <div key={project.id} className="project-card">
                      <h3>{project.name}</h3>
                      <p>{project.description}</p>
                      <div className="project-stats">
                        <span>{projectTasks.length} tasks</span>
                        <span>{completedCount} completed</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{
                            width: projectTasks.length > 0 
                              ? `${(completedCount / projectTasks.length) * 100}%` 
                              : '0%'
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="app-footer">
        <p>🚀 Deployed on AWS EC2 with CI/CD Pipeline</p>
        <p>React + Express.js + PostgreSQL + CloudWatch + SNS</p>
      </footer>
    </div>
  );
}

export default App;
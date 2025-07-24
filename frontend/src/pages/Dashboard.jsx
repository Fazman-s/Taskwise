import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const statusList = [
  { key: 'todo', label: 'Todo' },
  { key: 'inprogress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  // Access the environment variable here, at the top of the component
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!token) return navigate('/login');
    fetchTasks();
    // eslint-disable-next-line
  }, [token]); // Added token to dependency array as it's used inside fetchTasks

  const fetchTasks = async () => {
    setError('');
    try {
      // Use API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch tasks');
      setTasks(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Use API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, status: 'todo' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add task');
      setTitle('');
      setDescription('');
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMove = async (task, direction) => {
    const currentIndex = statusList.findIndex(s => s.key === task.status);
    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= statusList.length) return;
    try {
      // Use API_BASE_URL
      await fetch(`${API_BASE_URL}/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: statusList[newIndex].key }),
      });
      fetchTasks();
    } catch (err) {
      setError('Failed to move task');
    }
  };

  const handleDelete = async (taskId) => {
    try {
      // Use API_BASE_URL
      await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchTasks(); // Re-fetch tasks to update the UI
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const startEdit = (task) => {
    setEditId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      // Use API_BASE_URL
      await fetch(`${API_BASE_URL}/api/tasks/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });
      setEditId(null);
      setEditTitle('');
      setEditDescription('');
      fetchTasks();
    } catch (err) {
      setError('Failed to edit task');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Kanban Board</h1>
        {/* ... rest of your JSX ... */}
        <form onSubmit={handleAddTask} className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="Task title"
            className="p-2 border rounded w-1/3"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Description"
            className="p-2 border rounded w-1/2"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Task</button>
        </form>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusList.map((status, colIdx) => (
            <div key={status.key} className="bg-white rounded shadow p-4">
              <h2 className="text-xl font-semibold mb-4">{status.label}</h2>
              {tasks.filter(t => t.status === status.key).map(task => (
                <div key={task._id} className="bg-gray-100 rounded p-3 mb-3 flex flex-col gap-2">
                  {editId === task._id ? (
                    <form onSubmit={handleEdit} className="flex flex-col gap-2">
                      <input
                        className="p-1 border rounded"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        required
                      />
                      <input
                        className="p-1 border rounded"
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="bg-green-600 text-white px-2 py-1 rounded">Save</button>
                        <button type="button" className="bg-gray-400 text-white px-2 py-1 rounded" onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="font-bold">{task.title}</div>
                      <div className="text-sm text-gray-600">{task.description}</div>
                      <div className="flex gap-2 mt-2">
                        <button
                          className="bg-blue-400 text-white px-2 py-1 rounded disabled:opacity-50"
                          disabled={colIdx === 0}
                          onClick={() => handleMove(task, -1)}
                        >
                          ◀
                        </button>
                        <button
                          className="bg-blue-400 text-white px-2 py-1 rounded disabled:opacity-50"
                          disabled={colIdx === statusList.length - 1}
                          onClick={() => handleMove(task, 1)}
                        >
                          ▶
                        </button>
                        <button
                          className="bg-yellow-500 text-white px-2 py-1 rounded"
                          onClick={() => startEdit(task)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-600 text-white px-2 py-1 rounded"
                          onClick={() => handleDelete(task._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
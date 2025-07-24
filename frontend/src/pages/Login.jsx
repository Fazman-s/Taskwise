import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Access the environment variable. For Vite, it's import.meta.env
  // When running locally, if you have frontend/.env with VITE_BACKEND_URL=http://localhost:5000, it will use that.
  // When deployed on Netlify, it will use the value you set in Netlify's environment variables.
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Use the API_BASE_URL here
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // Your error handling logic for the response itself
      if (!res.ok) {
        // If the server responded with an error status (e.g., 401, 400)
        throw new Error(data.message || 'Login failed due to server error.');
      }

      // If res.ok is true and you have the token, then login was successful
      localStorage.setItem('token', data.token);
      navigate('/dashboard');

    } catch (err) {
      // This catch block handles network errors (like 'Failed to fetch' if the server is unreachable)
      // or errors thrown by 'throw new Error(data.message)' if res.ok was false.
      console.error("Login attempt error:", err); // Log the error for debugging
      setError(err.message || 'Failed to connect to the server. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-2 border rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
        <div className="mt-4 text-center">
          <a href="/register" className="text-blue-600 hover:underline">Don't have an account? Register</a>
        </div>
      </form>
    </div>
  );
}
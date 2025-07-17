// import { useEffect, useRef, useState } from 'react';
// import { io } from 'socket.io-client';

// const SOCKET_URL = 'http://localhost:5000';

// export default function ChatBar() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [error, setError] = useState('');
//   const socketRef = useRef(null);
//   const token = localStorage.getItem('token');
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     // Fetch existing messages
//     fetch('http://localhost:5000/api/chat', {
//       headers: { 'Authorization': `Bearer ${token}` },
//     })
//       .then(res => res.json())
//       .then(data => setMessages(data))
//       .catch(() => setError('Failed to load messages'));

//     // Connect to Socket.io
//     socketRef.current = io(SOCKET_URL, {
//       auth: { token },
//       transports: ['websocket'],
//     });

//     socketRef.current.on('chatMessage', (msg) => {
//       setMessages(prev => [...prev, msg]);
//     });

//     return () => {
//       socketRef.current.disconnect();
//     };
//     // eslint-disable-next-line
//   }, []);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const handleSend = (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;
//     socketRef.current.emit('chatMessage', { content: input, sender: 'user' });
//     setInput('');
//   };

//   return (
//     <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md z-50">
//       <div className="max-w-3xl mx-auto p-2">
//         <div className="h-48 overflow-y-auto mb-2 bg-gray-50 rounded p-2">
//           {messages.map((msg, idx) => (
//             <div key={msg._id || idx} className="mb-1">
//               <span className="font-semibold text-blue-600">User:</span> {msg.content}
//             </div>
//           ))}
//           <div ref={messagesEndRef} />
//         </div>
//         <form onSubmit={handleSend} className="flex gap-2">
//           <input
//             className="flex-1 border rounded p-2"
//             placeholder="Type a message..."
//             value={input}
//             onChange={e => setInput(e.target.value)}
//           />
//           <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Send</button>
//         </form>
//         {error && <div className="text-red-500 mt-2">{error}</div>}
//       </div>
//     </div>
//   );
// } 
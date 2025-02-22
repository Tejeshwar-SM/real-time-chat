// File: server/app.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Create an in-memory store for messages
const messages = [];

// Serve static files from the public folder located in the project root
app.use(express.static(path.join(__dirname, '../public')));

// Serve the main index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Socket.IO connection event handler
io.on('connection', (socket) => {
  console.log(`Client Connected: ${socket.id}`);

  // Send existing chat history to the newly connected client
  socket.emit('chatHistory', messages);

  // Listen for new chat messages from this client
  socket.on('chatMessage', (msg) => {
    console.log(`Message received from ${socket.id}: ${msg}`);
    // Add the message to the in-memory store
    messages.push(msg);
    // Broadcast the new message to all connected clients
    io.emit('chatMessage', msg);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

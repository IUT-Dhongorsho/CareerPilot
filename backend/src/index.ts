import http from 'http';
import app from './app';
import { initSocket } from './ws';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize WebSockets
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

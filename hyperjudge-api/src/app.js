const express = require('express');
const config = require('./config/env');
const { connectMongo } = require('./mongodb/connection');

const app = express();

app.use(express.json());

// TODO: API Routes (To be implemented by User)
// app.use('/api/users', require('./routes/users'));
// app.use('/api/problems', require('./routes/problems'));
// app.use('/api/submissions', require('./routes/submissions'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Start the server
async function startServer() {
  try {
    await connectMongo();
    // Additional initializations (Kafka producer, Redis ping, Prisma connect) could go here
    
    app.listen(config.port, () => {
      console.log(`HyperJudge API listening on port ${config.port} in ${config.env} mode`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Support graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  // Close DB connections, Kafka, Redis, etc.
  process.exit(0);
});

if (require.main === module) {
  startServer();
}

module.exports = app;

const express = require('express');
const cors = require('cors');

const studentsRouter = require('./Backend/prisma/routes/students');
const coursesRouter = require('./routes/courses');
const paymentsRouter = require('./routes/payments');
const expensesRouter = require('./routes/expenses');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/students', studentsRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/expenses', expensesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

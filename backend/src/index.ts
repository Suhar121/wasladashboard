import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Students CRUD
app.get('/api/students', async (_, res) => {
  const students = await prisma.student.findMany({ include: { course: true } });
  res.json(students);
});
app.post('/api/students', async (req, res) => {
  const student = await prisma.student.create({ data: req.body });
  res.json(student);
});
app.put('/api/students/:id', async (req, res) => {
  const student = await prisma.student.update({ where: { id: req.params.id }, data: req.body });
  res.json(student);
});
app.delete('/api/students/:id', async (req, res) => {
  await prisma.student.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// Courses CRUD
app.get('/api/courses', async (_, res) => res.json(await prisma.course.findMany()));
app.post('/api/courses', async (req, res) => res.json(await prisma.course.create({ data: req.body })));
app.put('/api/courses/:id', async (req, res) => res.json(await prisma.course.update({ where: { id: req.params.id }, data: req.body })));
app.delete('/api/courses/:id', async (req, res) => { await prisma.course.delete({ where: { id: req.params.id } }); res.json({ success: true }); });

// Payments CRUD
app.get('/api/payments', async (_, res) => res.json(await prisma.payment.findMany({ include: { student: true } })));
app.post('/api/payments', async (req, res) => res.json(await prisma.payment.create({ data: req.body })));
app.put('/api/payments/:id', async (req, res) => res.json(await prisma.payment.update({ where: { id: req.params.id }, data: req.body })));
app.delete('/api/payments/:id', async (req, res) => { await prisma.payment.delete({ where: { id: req.params.id } }); res.json({ success: true }); });

// Expenses CRUD
app.get('/api/expenses', async (_, res) => res.json(await prisma.expense.findMany()));
app.post('/api/expenses', async (req, res) => res.json(await prisma.expense.create({ data: req.body })));
app.put('/api/expenses/:id', async (req, res) => res.json(await prisma.expense.update({ where: { id: req.params.id }, data: req.body })));
app.delete('/api/expenses/:id', async (req, res) => { await prisma.expense.delete({ where: { id: req.params.id } }); res.json({ success: true }); });

app.listen(3001, () => console.log('API running on http://localhost:3001'));

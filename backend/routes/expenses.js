const express = require('express');
const { z } = require('zod');
const pool = require('../db');

const router = express.Router();

const expenseSchema = z.object({
  description: z.string().trim().min(1).max(255),
  amount: z.number().positive(),
  category: z.string().max(50).optional().nullable(),
  date: z.string().optional()
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const validated = expenseSchema.parse(req.body);
    const result = await pool.query(
      'INSERT INTO expenses (description, amount, category, date) VALUES ($1, $2, $3, $4) RETURNING *',
      [validated.description, validated.amount, validated.category, validated.date || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validated = expenseSchema.partial().parse(req.body);
    const fields = Object.keys(validated);
    const values = Object.values(validated);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const result = await pool.query(
      `UPDATE expenses SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted', expense: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

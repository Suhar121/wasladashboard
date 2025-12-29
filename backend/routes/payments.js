const express = require('express');
const { z } = require('zod');
const pool = require('../db');

const router = express.Router();

const paymentSchema = z.object({
  student_id: z.string().uuid(),
  amount: z.number().positive(),
  date: z.string().optional(),
  mode: z.enum(['Cash', 'UPI', 'Bank', 'Card']).optional(),
  status: z.enum(['completed', 'pending', 'failed']).optional()
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, s.name as student_name 
      FROM payments p 
      LEFT JOIN students s ON p.student_id = s.id 
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const validated = paymentSchema.parse(req.body);
    const result = await pool.query(
      `INSERT INTO payments (student_id, amount, date, mode, status) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [validated.student_id, validated.amount, validated.date || new Date(), validated.mode || 'Cash', validated.status || 'completed']
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
    const validated = paymentSchema.partial().parse(req.body);
    const fields = Object.keys(validated);
    const values = Object.values(validated);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const result = await pool.query(
      `UPDATE payments SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
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
    const result = await pool.query('DELETE FROM payments WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted', payment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

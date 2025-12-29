const express = require('express');
const { z } = require('zod');
const pool = require('../db');

const router = express.Router();

const courseSchema = z.object({
  name: z.string().trim().min(1).max(255),
  fee: z.number().positive(),
  duration: z.string().max(50).optional().nullable()
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const validated = courseSchema.parse(req.body);
    const result = await pool.query(
      'INSERT INTO courses (name, fee, duration) VALUES ($1, $2, $3) RETURNING *',
      [validated.name, validated.fee, validated.duration]
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
    const validated = courseSchema.partial().parse(req.body);
    const fields = Object.keys(validated);
    const values = Object.values(validated);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const result = await pool.query(
      `UPDATE courses SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
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
    const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ message: 'Course deleted', course: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

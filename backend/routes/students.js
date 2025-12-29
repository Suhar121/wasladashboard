const express = require('express');
const { z } = require('zod');
const pool = require('../db');

const router = express.Router();

const studentSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  course_id: z.string().uuid().optional().nullable(),
  status: z.enum(['active', 'inactive', 'completed']).optional()
});

// Get all students
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, c.name as course_name 
      FROM students s 
      LEFT JOIN courses c ON s.course_id = c.id 
      ORDER BY s.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single student
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create student
router.post('/', async (req, res) => {
  try {
    const validated = studentSchema.parse(req.body);
    const result = await pool.query(
      `INSERT INTO students (name, email, phone, course_id, status) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [validated.name, validated.email, validated.phone, validated.course_id, validated.status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: err.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validated = studentSchema.partial().parse(req.body);
    const fields = Object.keys(validated);
    const values = Object.values(validated);
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const result = await pool.query(
      `UPDATE students SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted', student: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

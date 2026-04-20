const express = require('express');
const pool    = require('./db');
require('dotenv').config();


const app  = express();
const cors = require('cors')
app.use(cors())
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ─────────────────────────────────────────────
// ROOT ROUTE
// ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Real Estate CRM API is running!' });
});

// ─────────────────────────────────────────────
// 1. GET ALL LEADS
// GET /leads
// ─────────────────────────────────────────────
app.get('/leads', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT leads.id, leads.name, leads.phone,
             leads.email, leads.source, leads.budget,
             leads.status, leads.notes,
             users.name AS agent_name
      FROM   leads
      JOIN   users ON leads.assigned_to = users.id
      ORDER  BY leads.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────
// 2. GET ONE LEAD BY ID
// GET /leads/1
// ─────────────────────────────────────────────
app.get('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT leads.*, users.name AS agent_name
       FROM   leads
       JOIN   users ON leads.assigned_to = users.id
       WHERE  leads.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────
// 3. CREATE A NEW LEAD
// POST /leads
// ─────────────────────────────────────────────
app.post('/leads', async (req, res) => {
  try {
    const { name, phone, email, source, budget, assigned_to, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO leads (name, phone, email, source, budget, assigned_to, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, phone, email, source, budget, assigned_to, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────
// 4. UPDATE A LEAD
// PUT /leads/1
// ─────────────────────────────────────────────
app.put('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, status, budget, notes, assigned_to } = req.body;

    const result = await pool.query(
      `UPDATE leads
       SET    name        = $1,
              phone       = $2,
              email       = $3,
              status      = $4,
              budget      = $5,
              notes       = $6,
              assigned_to = $7
       WHERE  id = $8
       RETURNING *`,
      [name, phone, email, status, budget, notes, assigned_to, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────
// 5. DELETE A LEAD
// DELETE /leads/1
// ─────────────────────────────────────────────
app.delete('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM leads WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ message: 'Lead deleted successfully', lead: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// ─────────────────────────────────────────────
// PROPERTIES CRUD
// ─────────────────────────────────────────────

// 1. GET ALL PROPERTIES
app.get('/properties', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT properties.*, users.name AS agent_name
      FROM   properties
      JOIN   users ON properties.agent_id = users.id
      ORDER  BY properties.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET ONE PROPERTY
app.get('/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT properties.*, users.name AS agent_name
       FROM   properties
       JOIN   users ON properties.agent_id = users.id
       WHERE  properties.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. CREATE A PROPERTY
app.post('/properties', async (req, res) => {
  try {
    const { title, type, price, location, city, size_sqft, agent_id } = req.body;
    const result = await pool.query(
      `INSERT INTO properties (title, type, price, location, city, size_sqft, agent_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, type, price, location, city, size_sqft, agent_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. UPDATE A PROPERTY
app.put('/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, price, location, city, size_sqft, status, agent_id } = req.body;
    const result = await pool.query(
      `UPDATE properties
       SET    title      = $1,
              type       = $2,
              price      = $3,
              location   = $4,
              city       = $5,
              size_sqft  = $6,
              status     = $7,
              agent_id   = $8
       WHERE  id = $9
       RETURNING *`,
      [title, type, price, location, city, size_sqft, status, agent_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. DELETE A PROPERTY
app.delete('/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM properties WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// const express = require('express');
// const cors    = require('cors');
// const pool    = require('./db');
// require('dotenv').config();

// const app  = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors());
// app.use(express.json());

// // ─────────────────────────────────────────────
// // ROOT
// // ─────────────────────────────────────────────
// app.get('/', (req, res) => {
//   res.json({ message: 'Real Estate CRM API is running!' });
// });

// // ─────────────────────────────────────────────
// // LEADS
// // ─────────────────────────────────────────────
// app.get('/leads', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT leads.id, leads.name, leads.phone,
//              leads.email, leads.source, leads.budget,
//              leads.status, leads.notes,
//              users.name AS agent_name
//       FROM   leads
//       JOIN   users ON leads.assigned_to = users.id
//       ORDER  BY leads.created_at DESC
//     `);
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.get('/leads/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await pool.query(
//       `SELECT leads.*, users.name AS agent_name
//        FROM   leads
//        JOIN   users ON leads.assigned_to = users.id
//        WHERE  leads.id = $1`,
//       [id]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Lead not found' });
//     }
//     res.json(result.rows[0]);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.post('/leads', async (req, res) => {
//   try {
//     const { name, phone, email, source, budget, assigned_to, notes } = req.body;
//     const result = await pool.query(
//       `INSERT INTO leads (name, phone, email, source, budget, assigned_to, notes)
//        VALUES ($1, $2, $3, $4, $5, $6, $7)
//        RETURNING *`,
//       [name, phone, email, source, budget, assigned_to, notes]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.put('/leads/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, phone, email, status, budget, notes, assigned_to } = req.body;
//     const result = await pool.query(
//       `UPDATE leads
//        SET    name        = $1,
//               phone       = $2,
//               email       = $3,
//               status      = $4,
//               budget      = $5,
//               notes       = $6,
//               assigned_to = $7
//        WHERE  id = $8
//        RETURNING *`,
//       [name, phone, email, status, budget, notes, assigned_to, id]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Lead not found' });
//     }
//     res.json(result.rows[0]);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.delete('/leads/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await pool.query(
//       'DELETE FROM leads WHERE id = $1 RETURNING *',
//       [id]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Lead not found' });
//     }
//     res.json({ message: 'Lead deleted successfully', lead: result.rows[0] });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // ─────────────────────────────────────────────
// // PROPERTIES
// // ─────────────────────────────────────────────
// app.get('/properties', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT properties.*, users.name AS agent_name
//       FROM   properties
//       JOIN   users ON properties.agent_id = users.id
//       ORDER  BY properties.created_at DESC
//     `);
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.get('/properties/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await pool.query(
//       `SELECT properties.*, users.name AS agent_name
//        FROM   properties
//        JOIN   users ON properties.agent_id = users.id
//        WHERE  properties.id = $1`,
//       [id]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Property not found' });
//     }
//     res.json(result.rows[0]);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.post('/properties', async (req, res) => {
//   try {
//     const { title, type, price, location, city, size_sqft, agent_id } = req.body;
//     const result = await pool.query(
//       `INSERT INTO properties (title, type, price, location, city, size_sqft, agent_id)
//        VALUES ($1, $2, $3, $4, $5, $6, $7)
//        RETURNING *`,
//       [title, type, price, location, city, size_sqft, agent_id]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.put('/properties/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, type, price, location, city, size_sqft, status, agent_id } = req.body;
//     const result = await pool.query(
//       `UPDATE properties
//        SET    title      = $1,
//               type       = $2,
//               price      = $3,
//               location   = $4,
//               city       = $5,
//               size_sqft  = $6,
//               status     = $7,
//               agent_id   = $8
//        WHERE  id = $9
//        RETURNING *`,
//       [title, type, price, location, city, size_sqft, status, agent_id, id]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Property not found' });
//     }
//     res.json(result.rows[0]);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.delete('/properties/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await pool.query(
//       'DELETE FROM properties WHERE id = $1 RETURNING *',
//       [id]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Property not found' });
//     }
//     res.json({ message: 'Property deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // ─────────────────────────────────────────────
// // START SERVER
// // ─────────────────────────────────────────────
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
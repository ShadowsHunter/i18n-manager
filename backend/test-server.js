const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

app.use(cors());
app.use(express.json());

const JWT_SECRET = 'dev-secret-key-change-in-production-min-32-chars-long';

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    database: 'connected',
  });
});

// Login
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: { token, user },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
});

// Get projects
app.get('/api/v1/projects', (req, res) => {
  try {
    const { status, search } = req.query;

    let query = 'SELECT * FROM projects';
    const params = [];

    if (status && status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }

    if (search) {
      query += params.length === 0 ? ' WHERE' : ' AND';
      query += ' name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY createdAt DESC';

    const projects = db.prepare(query).all(...params);
    const total = db
      .prepare(
        'SELECT COUNT(*) as count FROM projects' +
          (params.length > 0
            ? ' WHERE ' + (status ? 'status = ?' : search ? 'name LIKE ?' : '')
            : '')
      )
      .get(...params.filter((_, i) => i < (status ? 1 : search ? 1 : 0)));

    res.json({
      success: true,
      data: {
        projects,
        total: total ? total.count : projects.length,
      },
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects',
    });
  }
});

// Get single project
app.get('/api/v1/projects/:id', (req, res) => {
  try {
    const { id } = req.params;

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    const entries = db.prepare('SELECT * FROM entries WHERE projectId = ?').all(id);
    project.entries = entries;

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project',
    });
  }
});

// Create project
app.post('/api/v1/projects', (req, res) => {
  try {
    const { name, description, languages } = req.body;

    if (!name || !description || !languages || !Array.isArray(languages)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
      });
    }

    const languagesStr = JSON.stringify(languages);

    const projectResult = db
      .prepare(
        `
        INSERT INTO projects (id, name, description, status, languages, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `
      )
      .run(
        crypto.randomUUID(),
        name,
        description,
        'ACTIVE',
        languagesStr,
        new Date().toISOString(),
        new Date().toISOString()
      );

    res.status(201).json({
      success: true,
      data: { id: projectResult.lastInsertRowid.toString() },
      message: 'Project created successfully',
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create project',
    });
  }
});

// Update project
app.put('/api/v1/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, languages } = req.body;

    const updateFields = [];
    const params = [];

    if (name) {
      updateFields.push('name = ?');
      params.push(name);
    }
    if (description) {
      updateFields.push('description = ?');
      params.push(description);
    }
    if (status) {
      updateFields.push('status = ?');
      params.push(status);
    }
    if (languages) {
      updateFields.push('languages = ?');
      params.push(JSON.stringify(languages));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    updateFields.push('updatedAt = ?');
    params.push(new Date().toISOString());
    params.push(id);

    const query = `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`;
    const result = db.prepare(query).run(...params);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    const updatedProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    res.json({
      success: true,
      data: updatedProject,
      message: 'Project updated successfully',
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update project',
    });
  }
});

// Get entries for project
app.get('/api/v1/projects/:projectId/entries', (req, res) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 100, search } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM entries WHERE projectId = ?';
    const params = [projectId];

    if (search) {
      query += ' AND key LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), skip);

    const entries = db.prepare(query).all(...params);
    const total = db
      .prepare('SELECT COUNT(*) as count FROM entries WHERE projectId = ?')
      .get(projectId);

    res.json({
      success: true,
      data: {
        entries,
        total: total.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total.count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch entries',
    });
  }
});

// Create entry
app.post('/api/v1/projects/:projectId/entries', (req, res) => {
  try {
    const { projectId } = req.params;
    const { key, cn, en, de, es, fi, fr, it, nl, no, pl, se } = req.body;

    if (!key || key.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Key is required',
      });
    }

    const newEntry = {
      id: crypto.randomUUID(),
      projectId,
      key: key.trim(),
      cn: cn || null,
      en: en || null,
      de: de || null,
      es: es || null,
      fi: fi || null,
      fr: fr || null,
      it: it || null,
      nl: nl || null,
      no: no || null,
      pl: pl || null,
      se: se || null,
      status: 'NEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.prepare(
      `INSERT INTO entries (id, projectId, key, cn, en, de, es, fi, fr, it, nl, no, pl, se, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      newEntry.id,
      newEntry.projectId,
      newEntry.key,
      newEntry.cn,
      newEntry.en,
      newEntry.de,
      newEntry.es,
      newEntry.fi,
      newEntry.fr,
      newEntry.it,
      newEntry.nl,
      newEntry.no,
      newEntry.pl,
      newEntry.se,
      newEntry.status,
      newEntry.createdAt,
      newEntry.updatedAt
    );

    res.status(201).json({
      success: true,
      data: newEntry,
      message: 'Entry created successfully',
    });
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create entry',
    });
  }
});

// Update entry
app.put('/api/v1/projects/:projectId/entries/:id', (req, res) => {
  try {
    const { projectId, id } = req.params;
    const { key, cn, en, de, es, fi, fr, it, nl, no, pl, se, status } = req.body;

    const updateFields = [];
    const params = [];

    if (key) {
      updateFields.push('key = ?');
      params.push(key);
    }
    if (cn) {
      updateFields.push('cn = ?');
      params.push(cn);
    }
    if (en) {
      updateFields.push('en = ?');
      params.push(en);
    }
    if (de) {
      updateFields.push('de = ?');
      params.push(de);
    }
    if (es) {
      updateFields.push('es = ?');
      params.push(es);
    }
    if (fi) {
      updateFields.push('fi = ?');
      params.push(fi);
    }
    if (fr) {
      updateFields.push('fr = ?');
      params.push(fr);
    }
    if (it) {
      updateFields.push('it = ?');
      params.push(it);
    }
    if (nl) {
      updateFields.push('nl = ?');
      params.push(nl);
    }
    if (no) {
      updateFields.push('no = ?');
      params.push(no);
    }
    if (pl) {
      updateFields.push('pl = ?');
      params.push(pl);
    }
    if (se) {
      updateFields.push('se = ?');
      params.push(se);
    }
    if (status) {
      updateFields.push('status = ?');
      params.push(status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    updateFields.push('updatedAt = ?');
    params.push(new Date().toISOString());
    params.push(projectId, id);

    const query = `UPDATE entries SET ${updateFields.join(', ')} WHERE projectId = ? AND id = ?`;
    const result = db.prepare(query).run(...params);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found',
      });
    }

    const updatedEntry = db
      .prepare('SELECT * FROM entries WHERE projectId = ? AND id = ?')
      .get(projectId, id);
    res.json({
      success: true,
      data: updatedEntry,
      message: 'Entry updated successfully',
    });
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update entry',
    });
  }
});

// Delete entry
app.delete('/api/v1/projects/:projectId/entries/:id', (req, res) => {
  try {
    const { projectId, id } = req.params;

    const entry = db
      .prepare('SELECT * FROM entries WHERE id = ? AND projectId = ?')
      .get(id, projectId);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Entry not found',
          code: 'NOT_FOUND',
          statusCode: 404,
        },
      });
    }

    const deleteStmt = db.prepare('DELETE FROM entries WHERE id = ? AND projectId = ?');
    deleteStmt.run(id, projectId);

    res.json({
      success: true,
      data: {
        id: id,
        message: 'Entry deleted successfully',
      },
    });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete entry',
    });
  }
});

// Delete project
app.delete('/api/v1/projects/:id', (req, res) => {
  try {
    const { id } = req.params;

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Project not found',
          code: 'NOT_FOUND',
          statusCode: 404,
        },
      });
    }

    // 首先删除所有相关的条目（级联删除）
    db.prepare('DELETE FROM entries WHERE projectId = ?').run(id);

    // 然后删除项目
    const deleteStmt = db.prepare('DELETE FROM projects WHERE id = ?');
    deleteStmt.run(id);

    res.json({
      success: true,
      data: {
        id: id,
        message: 'Project deleted successfully',
      },
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete project',
    });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('MultiLanguageManager Backend API Server');
  console.log('='.repeat(60));
  console.log('');
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api/v1`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET    /api/v1/health - Health check');
  console.log('  POST   /api/v1/auth/login - User login');
  console.log('  GET    /api/v1/projects - Get all projects');
  console.log('  GET    /api/v1/projects/:id - Get single project');
  console.log('  POST   /api/v1/projects - Create new project');
  console.log('  PUT    /api/v1/projects/:id - Update project');
  console.log('  DELETE /api/v1/projects/:id - Delete project');
  console.log('  GET    /api/v1/projects/:projectId/entries - Get entries for project');
  console.log('  POST   /api/v1/projects/:projectId/entries - Create new entry');
  console.log('  PUT    /api/v1/projects/:projectId/entries/:id - Update entry');
  console.log('  DELETE /api/v1/projects/:projectId/entries/:id - Delete entry');
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('='.repeat(60));
});

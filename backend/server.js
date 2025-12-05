require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
app.use(express.json());

// --- Global error logging so the process doesn't die silently ---
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

// Basic CORS for local dev; adjust origin if you need stricter rules
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, x-user-id'
  );
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Static file serving for images (books/authors)
app.use('/static', express.static(path.join(__dirname, 'static')));


// ---- DB POOL ----
const DB_PORT = Number(process.env.DB_PORT || 3306);

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function withTransaction(work) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getSettings(conn = null) {
  if (conn) {
    const [rows] = await conn.execute(
      'SELECT loan_days, fine_per_day, max_books_per_member FROM system_settings WHERE id = 1'
    );
    if (!rows || rows.length === 0) {
      return { loan_days: 14, fine_per_day: 0, max_books_per_member: 5 };
    }
    return rows[0];
  } else {
    const rows = await query(
      'SELECT loan_days, fine_per_day, max_books_per_member FROM system_settings WHERE id = 1'
    );
    if (!rows || rows.length === 0) {
      return { loan_days: 14, fine_per_day: 0, max_books_per_member: 5 };
    }
    return rows[0];
  }
}

// ---- Auth middleware (x-user-id header) ----
app.use(async (req, res, next) => {
  const userIdHeader = req.header('x-user-id');
  if (!userIdHeader) {
    req.user = null;
    return next();
  }

  const userId = Number(userIdHeader);
  if (!Number.isFinite(userId)) {
    req.user = null;
    return next();
  }

  try {
    const users = await query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId]
    );
    req.user = users.length > 0 ? users[0] : null;
  } catch (err) {
    console.error('Error loading user from header:', err);
    req.user = null;
  }

  next();
});

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

function requireLibrarian(req, res, next) {
  if (!req.user || req.user.role !== 'LIBRARIAN') {
    return res.status(403).json({ error: 'Librarian role required' });
  }
  next();
}

// ---- Auth routes ----
app.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  try {
    const existingUsers = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    const saltRounds = Number(process.env.BCRYPT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const now = new Date();

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
       VALUES (?, ?, ?, 'MEMBER', ?, ?)`,
      [name, email, passwordHash, now, now]
    );

    const userId = result.insertId;

    res.status(201).json({
      id: userId,
      name,
      email,
      role: 'MEMBER',
      created_at: now,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const users = await query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const now = new Date();

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      timestamp: now,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---- Authors (to replace static authors array) ----
app.get('/authors', async (req, res) => {
  try {
    const authors = await query(
      `SELECT
         id,
         name,
         bio,
         image_path,
         wikipedia_url,
         born_raw
       FROM authors
       ORDER BY name`
    );
    res.json(authors);
  } catch (err) {
    console.error('Error fetching authors:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/authors/:id', async (req, res) => {
  const authorId = Number(req.params.id);
  if (!Number.isFinite(authorId)) {
    return res.status(400).json({ error: 'Invalid author id' });
  }

  try {
    const authors = await query(
      `SELECT
         id,
         name,
         bio,
         image_path,
         wikipedia_url,
         born_raw
       FROM authors
       WHERE id = ?`,
      [authorId]
    );

    if (authors.length === 0) {
      return res.status(404).json({ error: 'Author not found' });
    }

    const author = authors[0];

    const books = await query(
      `SELECT b.id, b.title, b.image_path, b.material_type
       FROM books b
       JOIN book_authors ba ON ba.book_id = b.id
       WHERE ba.author_id = ?
       ORDER BY b.title`,
      [authorId]
    );

    res.json({
      ...author,
      books,
    });
  } catch (err) {
    console.error('Error fetching author details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---- Books ----
app.get('/books', async (req, res) => {
  const { q, category_id, available_only } = req.query;

  try {
    let sql = `
      SELECT DISTINCT
        b.id,
        b.title,
        b.isbn,
        b.description,
        b.total_copies,
        b.available_copies,
        b.shelf_location,
        b.image_path,
        b.external_link,
        b.material_type
      FROM books b
      LEFT JOIN book_categories bc ON bc.book_id = b.id
      WHERE 1 = 1
    `;
    const params = [];

    if (q) {
      sql += ' AND b.title LIKE ?';
      params.push(`%${q}%`);
    }

    if (category_id) {
      sql += ' AND bc.category_id = ?';
      params.push(category_id);
    }

    if (available_only === 'true') {
      sql += ' AND b.available_copies > 0';
    }

    sql += ' ORDER BY b.title';

    const books = await query(sql, params);
    res.json(books);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/books/:id', async (req, res) => {
  const bookId = Number(req.params.id);
  if (!Number.isFinite(bookId)) {
    return res.status(400).json({ error: 'Invalid book id' });
  }

  try {
    const books = await query(
      `SELECT
         id,
         title,
         isbn,
         description,
         publisher,
         publication_year,
         language,
         total_copies,
         available_copies,
         shelf_location,
         image_path,
         external_link,
         wikipedia_url,
         material_type
       FROM books
       WHERE id = ?`,
      [bookId]
    );

    if (books.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const book = books[0];

    const authors = await query(
      `SELECT
         a.id,
         a.name,
         a.image_path,
         a.wikipedia_url,
         a.born_raw
       FROM authors a
       JOIN book_authors ba ON ba.author_id = a.id
       WHERE ba.book_id = ?`,
      [bookId]
    );

    const categories = await query(
      `SELECT c.id, c.name
       FROM categories c
       JOIN book_categories bc ON bc.category_id = c.id
       WHERE bc.book_id = ?`,
      [bookId]
    );

    res.json({
      ...book,
      authors,
      categories,
    });
  } catch (err) {
    console.error('Error fetching book details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---- Loans ----
app.post('/loans', requireAuth, async (req, res) => {
  if (req.user.role !== 'MEMBER') {
    return res.status(403).json({ error: 'Only members can borrow books' });
  }

  const { book_id } = req.body;
  if (!book_id) {
    return res.status(400).json({ error: 'book_id is required' });
  }

  try {
    const result = await withTransaction(async (conn) => {
      const settings = await getSettings(conn);
      const loanDays = settings.loan_days || 14;
      const maxBooks = settings.max_books_per_member || 5;

      const [loanCountRows] = await conn.execute(
        `SELECT COUNT(*) AS active_loans
         FROM loans
         WHERE user_id = ? AND status = 'BORROWED'`,
        [req.user.id]
      );
      const activeLoans = loanCountRows[0].active_loans;
      if (activeLoans >= maxBooks) {
        return { error: 'Loan limit reached', status: 400 };
      }

      const [bookRows] = await conn.execute(
        'SELECT id, available_copies FROM books WHERE id = ? FOR UPDATE',
        [book_id]
      );

      if (bookRows.length === 0) {
        return { error: 'Book not found', status: 404 };
      }

      const book = bookRows[0];

      if (book.available_copies <= 0) {
        return { error: 'No copies available. You may create a reservation.', status: 400 };
      }

      const now = new Date();
      const due = new Date(now);
      due.setDate(due.getDate() + loanDays);

      const [loanResult] = await conn.execute(
        `INSERT INTO loans
           (user_id, book_id, borrowed_at, due_at, status, fine_amount, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'BORROWED', 0, ?, ?)`,
        [req.user.id, book_id, now, due, now, now]
      );
      const loanId = loanResult.insertId;

      await conn.execute(
        `UPDATE books
         SET available_copies = available_copies - 1,
             updated_at = ?
         WHERE id = ?`,
        [now, book_id]
      );

      return {
        id: loanId,
        user_id: req.user.id,
        book_id,
        borrowed_at: now,
        due_at: due,
        status: 'BORROWED',
      };
    });

    if (result && result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }

    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating loan:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/loans/:id/return', requireLibrarian, async (req, res) => {
  const loanId = Number(req.params.id);
  if (!Number.isFinite(loanId)) {
    return res.status(400).json({ error: 'Invalid loan id' });
  }

  try {
    const result = await withTransaction(async (conn) => {
      const [loanRows] = await conn.execute(
        `SELECT id, user_id, book_id, borrowed_at, due_at, returned_at, status
         FROM loans
         WHERE id = ? FOR UPDATE`,
        [loanId]
      );

      if (loanRows.length === 0) {
        return { error: 'Loan not found', status: 404 };
      }

      const loan = loanRows[0];
      if (loan.status !== 'BORROWED' || loan.returned_at) {
        return { error: 'Loan is not currently active', status: 400 };
      }

      const settings = await getSettings(conn);
      const finePerDay = settings.fine_per_day || 0;

      const now = new Date();
      const dueAt = new Date(loan.due_at);
      const diffMs = now - dueAt;
      const daysLate = diffMs > 0 ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) : 0;
      const fineAmount = daysLate * finePerDay;

      await conn.execute(
        `UPDATE loans
         SET returned_at = ?, status = 'RETURNED', fine_amount = ?, updated_at = ?
         WHERE id = ?`,
        [now, fineAmount, now, loanId]
      );

      await conn.execute(
        `UPDATE books
         SET available_copies = available_copies + 1,
             updated_at = ?
         WHERE id = ?`,
        [now, loan.book_id]
      );

      const [resRows] = await conn.execute(
        `SELECT id
         FROM reservations
         WHERE book_id = ? AND status = 'WAITING'
         ORDER BY position_in_queue ASC
         LIMIT 1`,
        [loan.book_id]
      );

      if (resRows.length > 0) {
        const reservationId = resRows[0].id;
        await conn.execute(
          `UPDATE reservations
           SET status = 'NOTIFIED', updated_at = ?
           WHERE id = ?`,
          [now, reservationId]
        );
      }

      return {
        id: loanId,
        returned_at: now,
        fine_amount: fineAmount,
        days_late: daysLate,
      };
    });

    if (result && result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }

    res.json(result);
  } catch (err) {
    console.error('Error returning loan:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/loans/my', requireAuth, async (req, res) => {
  try {
    const loans = await query(
      `SELECT
         l.id,
         l.book_id,
         b.title,
         l.borrowed_at,
         l.due_at,
         l.returned_at,
         l.status,
         l.fine_amount
       FROM loans l
       JOIN books b ON b.id = l.book_id
       WHERE l.user_id = ?
       ORDER BY l.borrowed_at DESC`,
      [req.user.id]
    );
    res.json(loans);
  } catch (err) {
    console.error('Error fetching user loans:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---- Reservations ----
app.post('/reservations', requireAuth, async (req, res) => {
  if (req.user.role !== 'MEMBER') {
    return res.status(403).json({ error: 'Only members can reserve books' });
  }

  const { book_id } = req.body;
  if (!book_id) {
    return res.status(400).json({ error: 'book_id is required' });
  }

  try {
    const books = await query('SELECT id, available_copies FROM books WHERE id = ?', [book_id]);
    if (books.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const book = books[0];

    if (book.available_copies > 0) {
      return res.status(400).json({ error: 'Book is available; no need to reserve' });
    }

    const existing = await query(
      `SELECT id FROM reservations
       WHERE user_id = ? AND book_id = ? AND status IN ('WAITING', 'NOTIFIED')`,
      [req.user.id, book_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'You already have a reservation for this book' });
    }

    const rows = await query(
      `SELECT COALESCE(MAX(position_in_queue), 0) AS max_pos
       FROM reservations
       WHERE book_id = ?`,
      [book_id]
    );
    const position = (rows[0]?.max_pos || 0) + 1;
    const now = new Date();

    const result = await query(
      `INSERT INTO reservations (user_id, book_id, status, position_in_queue, created_at, updated_at)
       VALUES (?, ?, 'WAITING', ?, ?, ?)`,
      [req.user.id, book_id, position, now, now]
    );

    res.status(201).json({
      id: result.insertId,
      user_id: req.user.id,
      book_id,
      status: 'WAITING',
      position_in_queue: position,
      created_at: now,
    });
  } catch (err) {
    console.error('Error creating reservation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/reservations/my', requireAuth, async (req, res) => {
  try {
    const reservations = await query(
      `SELECT
         r.id,
         r.book_id,
         b.title,
         r.status,
         r.position_in_queue,
         r.created_at,
         r.updated_at
       FROM reservations r
       JOIN books b ON b.id = r.book_id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(reservations);
  } catch (err) {
    console.error('Error fetching reservations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---- Admin: books ----
app.post('/admin/books', requireLibrarian, async (req, res) => {
  const {
    title,
    isbn,
    total_copies,
    shelf_location,
    description,
    publisher,
    publication_year,
    language,
    image_path,
    external_link,
    wikipedia_url,
    material_type,
  } = req.body;

  if (!title || !total_copies) {
    return res.status(400).json({ error: 'title and total_copies are required' });
  }

  try {
    const now = new Date();
    const result = await query(
      `INSERT INTO books (
         title,
         isbn,
         description,
         publisher,
         publication_year,
         language,
         total_copies,
         available_copies,
         shelf_location,
         image_path,
         external_link,
         wikipedia_url,
         material_type,
         created_at,
         updated_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        isbn || null,
        description || null,
        publisher || null,
        publication_year || null,
        language || null,
        total_copies,
        total_copies,
        shelf_location || null,
        image_path || null,
        external_link || null,
        wikipedia_url || null,
        material_type || 'BOOK',
        now,
        now,
      ]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      isbn: isbn || null,
      description: description || null,
      publisher: publisher || null,
      publication_year: publication_year || null,
      language: language || null,
      total_copies,
      available_copies: total_copies,
      shelf_location: shelf_location || null,
      image_path: image_path || null,
      external_link: external_link || null,
      wikipedia_url: wikipedia_url || null,
      material_type: material_type || 'BOOK',
      created_at: now,
    });
  } catch (err) {
    console.error('Error creating book:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/admin/books/:id', requireLibrarian, async (req, res) => {
  const bookId = Number(req.params.id);
  if (!Number.isFinite(bookId)) {
    return res.status(400).json({ error: 'Invalid book id' });
  }

  const {
    title,
    isbn,
    total_copies,
    available_copies,
    shelf_location,
    description,
    publisher,
    publication_year,
    language,
    image_path,
    external_link,
    wikipedia_url,
    material_type,
  } = req.body;

  try {
    const now = new Date();
    await query(
      `UPDATE books
       SET
         title = COALESCE(?, title),
         isbn = COALESCE(?, isbn),
         description = COALESCE(?, description),
         publisher = COALESCE(?, publisher),
         publication_year = COALESCE(?, publication_year),
         language = COALESCE(?, language),
         total_copies = COALESCE(?, total_copies),
         available_copies = COALESCE(?, available_copies),
         shelf_location = COALESCE(?, shelf_location),
         image_path = COALESCE(?, image_path),
         external_link = COALESCE(?, external_link),
         wikipedia_url = COALESCE(?, wikipedia_url),
         material_type = COALESCE(?, material_type),
         updated_at = ?
       WHERE id = ?`,
      [
        title,
        isbn,
        description,
        publisher,
        publication_year,
        language,
        total_copies,
        available_copies,
        shelf_location,
        image_path,
        external_link,
        wikipedia_url,
        material_type,
        now,
        bookId,
      ]
    );

    const books = await query(
      `SELECT
         id,
         title,
         isbn,
         description,
         publisher,
         publication_year,
         language,
         total_copies,
         available_copies,
         shelf_location,
         image_path,
         external_link,
         wikipedia_url,
         material_type
       FROM books
       WHERE id = ?`,
      [bookId]
    );

    if (books.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(books[0]);
  } catch (err) {
    console.error('Error updating book:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---- Admin reports ----
app.get('/admin/reports/overview', requireLibrarian, async (req, res) => {
  try {
    const [
      members,
      books,
      loans,
      activeLoans,
      overdueLoans,
      mostBorrowed,
      topMembers,
    ] = await Promise.all([
      query(`SELECT COUNT(*) AS totalMembers FROM users WHERE role = 'MEMBER'`),
      query(`SELECT COUNT(*) AS totalBooks FROM books`),
      query(`SELECT COUNT(*) AS totalLoans FROM loans`),
      query(`SELECT COUNT(*) AS activeLoans FROM loans WHERE status = 'BORROWED'`),
      query(`SELECT COUNT(*) AS overdueLoans FROM loans WHERE status = 'BORROWED' AND due_at < NOW()`),
      query(`
        SELECT b.id, b.title, COUNT(*) AS loanCount
        FROM loans l
        JOIN books b ON b.id = l.book_id
        GROUP BY b.id, b.title
        ORDER BY loanCount DESC
        LIMIT 5
      `),
      query(`
        SELECT u.id, u.name, COUNT(*) AS loanCount
        FROM loans l
        JOIN users u ON u.id = l.user_id
        GROUP BY u.id, u.name
        ORDER BY loanCount DESC
        LIMIT 5
      `),
    ]);

    res.json({
      totals: {
        members: members[0]?.totalMembers || 0,
        books: books[0]?.totalBooks || 0,
        loans: loans[0]?.totalLoans || 0,
        activeLoans: activeLoans[0]?.activeLoans || 0,
        overdueLoans: overdueLoans[0]?.overdueLoans || 0,
      },
      mostBorrowedBooks: mostBorrowed,
      topMembers,
    });
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---- Health check ----
app.get('/health', async (req, res) => {
  try {
    await query('SELECT 1 AS ok');
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({ status: 'db_error' });
  }
});

// ---- Start server AFTER verifying DB ----
async function start() {
  try {
    console.log('Testing database connection...');
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('Database connection OK');

    // Route logger (guarded)
    console.log('Registered routes:');
    if (app._router && Array.isArray(app._router.stack)) {
      app._router.stack
        .filter((r) => r.route)
        .forEach((r) => {
          const methods = Object.keys(r.route.methods)
            .map((m) => m.toUpperCase())
            .join(',');
          console.log(`${methods} ${r.route.path}`);
        });
    } else {
      console.log('Router stack not available on app._router');
    }

    const PORT = Number(process.env.APP_PORT || process.env.PORT || 3000);
    console.log(`Using app port: ${PORT}`);

    app.listen(PORT, () => {
      console.log(`Library API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

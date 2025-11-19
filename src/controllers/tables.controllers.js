import pool from "../db/index.js";

const listTables = async (req, res) => {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    // MySQL returns rows like { 'Tables_in_dbname': 'categorias' }
    const tables = rows.map(r => Object.values(r)[0]);
    return res.json(tables);
  } catch (err) {
    console.error('DB error listTables:', err);
    return res.status(500).json({ error: 'Error al listar tablas' });
  }
};

const getPrimaryKey = async (table) => {
  const [keys] = await pool.query(`SHOW KEYS FROM \`${table}\` WHERE Key_name = 'PRIMARY'`);
  if (keys.length > 0) return keys[0].Column_name;
  // fallback: pick first column
  const [cols] = await pool.query(`SHOW COLUMNS FROM \`${table}\``);
  if (cols.length > 0) return cols[0].Field;
  return null;
};

const getRows = async (req, res) => {
  const table = req.params.table;
  try {
    const [rows] = await pool.query(`SELECT * FROM \`${table}\``);
    return res.json(rows);
  } catch (err) {
    console.error('DB error getRows:', err);
    return res.status(500).json({ error: 'Error al obtener filas' });
  }
};

const createRow = async (req, res) => {
  const table = req.params.table;
  const data = req.body || {};
  try {
    const cols = Object.keys(data);
    if (cols.length === 0) return res.status(400).json({ error: 'No data provided' });
    const placeholders = cols.map(() => '?').join(',');
    const sql = `INSERT INTO \`${table}\` (${cols.map(c => `\`${c}\``).join(',')}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, Object.values(data));
    return res.json({ insertId: result.insertId });
  } catch (err) {
    console.error('DB error createRow:', err);
    return res.status(500).json({ error: 'Error al crear fila' });
  }
};

const updateRow = async (req, res) => {
  const table = req.params.table;
  const id = req.params.id;
  const data = req.body || {};
  try {
    const pk = await getPrimaryKey(table);
    if (!pk) return res.status(400).json({ error: 'Primary key not found' });
    const cols = Object.keys(data);
    if (cols.length === 0) return res.status(400).json({ error: 'No data provided' });
    const assignments = cols.map(c => `\`${c}\` = ?`).join(',');
    const sql = `UPDATE \`${table}\` SET ${assignments} WHERE \`${pk}\` = ?`;
    const params = [...Object.values(data), id];
    const [result] = await pool.query(sql, params);
    return res.json({ affectedRows: result.affectedRows });
  } catch (err) {
    console.error('DB error updateRow:', err);
    return res.status(500).json({ error: 'Error al actualizar fila' });
  }
};

const deleteRow = async (req, res) => {
  const table = req.params.table;
  const id = req.params.id;
  try {
    const pk = await getPrimaryKey(table);
    if (!pk) return res.status(400).json({ error: 'Primary key not found' });
    const sql = `DELETE FROM \`${table}\` WHERE \`${pk}\` = ?`;
    const [result] = await pool.query(sql, [id]);
    return res.json({ affectedRows: result.affectedRows });
  } catch (err) {
    console.error('DB error deleteRow:', err);
    return res.status(500).json({ error: 'Error al borrar fila' });
  }
};

export const tablesController = {
  listTables,
  getRows,
  createRow,
  updateRow,
  deleteRow,
  getPrimaryKey
};

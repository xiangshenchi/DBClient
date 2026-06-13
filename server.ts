import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import mysql from 'mysql2/promise';
import { Client } from 'pg';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// API route logic inside functions to isolate DB connections
import { createClient } from 'webdav';

app.post('/api/webdav/backup', async (req, res) => {
  const { url, username, password, data, path = "/dbclient_connections.json" } = req.body;
  if (!url || !username || !password) return res.status(400).json({error: 'Missing details'});
  try {
    const client = createClient(url, { username, password });
    
    // if a directory path is provided, try to create it first.
    const dirPath = path.substring(0, path.lastIndexOf('/'));
    if (dirPath && dirPath.length > 0 && dirPath !== '/') {
        try {
            await client.createDirectory(dirPath);
        } catch (e) {}
    }

    await client.putFileContents(path, JSON.stringify(data));
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/webdav/restore', async (req, res) => {
  const { url, username, password, path = "/dbclient_connections.json" } = req.body;
  if (!url || !username || !password) return res.status(400).json({error: 'Missing details'});
  try {
    const client = createClient(url, { username, password });
    if (await client.exists(path) === false) {
       return res.status(404).json({ error: "Backup file not found on WebDAV server at " + path });
    }
    const data = await client.getFileContents(path, { format: "text" });
    let textData = typeof data === 'string' ? data : (data as Buffer).toString('utf-8');
    try {
      res.json({ success: true, data: JSON.parse(textData) });
    } catch (parseError) {
      const preview = textData.trim().substring(0, 40).replace(/\r?\n|\r/g, ' ');
      return res.status(400).json({ error: `WebDAV server returned an invalid file (not JSON). Server response starts with: "${preview}...". Please check your URL/Path and ensure you have backed up first.` });
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

const connectMysql = async (config: any) => {
  return await mysql.createConnection({
    host: config.host,
    port: config.port || 3306,
    user: config.username,
    password: config.password,
    database: config.database,
    ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
    connectTimeout: 10000,
  });
};

const connectPg = async (config: any) => {
  const client = new Client({
    host: config.host,
    port: config.port || 5432,
    user: config.username,
    password: config.password,
    database: config.database,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
  });
  await client.connect();
  return client;
};

// 1. /api/ping: Test connection
app.post('/api/ping', async (req, res) => {
  const t0 = Date.now();
  const config = req.body;
  try {
    if (config.type === 'mysql') {
      const conn = await connectMysql(config);
      await conn.ping();
      await conn.end();
    } else if (config.type === 'postgres') {
      const conn = await connectPg(config);
      await conn.query('SELECT 1');
      await conn.end();
    } else {
      throw new Error('Unsupported database type');
    }
    res.json({ success: true, ms: Date.now() - t0 });
  } catch (error: any) {
    res.json({ success: false, error: error.message || 'Connection failed' });
  }
});

function applyLimit(sql: string, limit: number): string {
  let trimmed = sql.trim();
  while (trimmed.endsWith(';')) {
    trimmed = trimmed.slice(0, -1).trim();
  }
  
  if (!trimmed) return sql;
  const upperSql = trimmed.toUpperCase();
  
  if (!upperSql.startsWith('SELECT')) {
    return sql;
  }
  
  if (upperSql.includes('LIMIT')) return sql;
  return `${trimmed} LIMIT ${limit}`;
}

const safeSqlKeywords = ['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN'];
function isSafeQuery(sql: string): boolean {
  const trimSqL = sql.trim().toUpperCase();
  return safeSqlKeywords.some(kw => trimSqL.startsWith(kw));
}

// 2. /api/query: Execute queries (only safe ones)
app.post('/api/query', async (req, res) => {
  const config = req.body;
  let sql = req.body.sql as string;
  
  if (!sql || !sql.trim()) {
    return res.status(400).json({ error: 'SQL is empty' });
  }
  
  if (!isSafeQuery(sql)) {
    return res.status(400).json({ error: 'Execution blocked: Only SELECT / SHOW / DESCRIBE / EXPLAIN are allowed' });
  }

  sql = applyLimit(sql, 1000);
  
  const t0 = Date.now();
  try {
    let rows: any[] = [];
    if (config.type === 'mysql') {
      const conn = await connectMysql(config);
      const [results] = await conn.query(sql);
      rows = Array.isArray(results) ? results : [results]; // Ensure it's an array of rows
      await conn.end();
    } else if (config.type === 'postgres') {
      const conn = await connectPg(config);
      const result = await conn.query(sql);
      rows = result.rows;
      await conn.end();
    } else {
      throw new Error('Unsupported database type');
    }
    const ms = Date.now() - t0;
    res.json({ success: true, rows, count: rows.length, ms });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Execution failed' });
  }
});

// 3. /api/structure: Fetch database structure (DB -> Tables -> Columns)
app.post('/api/structure', async (req, res) => {
  const config = req.body;
  
  try {
    let structure: any = {};
    if (config.type === 'mysql') {
      const conn = await connectMysql(config);
      
      const [tablesRow] = await conn.query(`SHOW TABLES`);
      const tables = (tablesRow as any[]).map(r => Object.values(r)[0] as string);
      
      for (const table of tables) {
        const [cols] = await conn.query(`DESCRIBE ??`, [table]);
        structure[table] = (cols as any[]).map(c => ({
          name: c.Field,
          type: c.Type,
          nullable: c.Null === 'YES',
          primaryKey: c.Key === 'PRI'
        }));
      }
      await conn.end();
    } else if (config.type === 'postgres') {
      const conn = await connectPg(config);
      
      const tablesQuery = `
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
      `;
      const tableResult = await conn.query(tablesQuery);
      const tables = tableResult.rows.map(r => r.tablename);
      
      for (const table of tables) {
        const colsQuery = `
          SELECT column_name, data_type, is_nullable,
                 (SELECT count(*) > 0 FROM information_schema.key_column_usage 
                  WHERE table_name = $1 AND column_name = columns.column_name) as is_pk
          FROM information_schema.columns 
          WHERE table_name = $1 AND table_schema = 'public'
        `;
        const colsResult = await conn.query(colsQuery, [table]);
        structure[table] = colsResult.rows.map(c => ({
          name: c.column_name,
          type: c.data_type,
          nullable: c.is_nullable === 'YES',
          primaryKey: c.is_pk
        }));
      }
      await conn.end();
    } else {
      throw new Error('Unsupported database type');
    }
    
    res.json({ success: true, structure });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to fetch structure' });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

(() => {
  'use strict';

  // ─────────────── Utils ───────────────
  const Utils = {
    escapeHTML(str) {
      return String(str ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char]));
    },

    escapeAttr(str) {
      return Utils.escapeHTML(str);
    },

    toast(message, type = 'success') {
      const container = document.getElementById('toast-container');
      if (!container) return;
      const el = document.createElement('div');
      el.className = `toast ${type}`;
      el.textContent = message;
      container.appendChild(el);
      setTimeout(() => el.remove(), 2500);
    },

    copyText(text) {
      const fallback = () => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          Utils.toast('Copied to clipboard');
        } catch {
          Utils.toast('Copy failed', 'error');
        }
        document.body.removeChild(ta);
      };

      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text)
          .then(() => Utils.toast('Copied to clipboard'))
          .catch(fallback);
      } else {
        fallback();
      }
    },

    download(filename, text) {
      const blob = new Blob([text], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    uid() {
      return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    },

    splitTopLevelComma(str) {
      const parts = [];
      let current = '';
      let depth = 0;
      let quote = null;

      for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        if (quote) {
          current += ch;
          if (ch === quote && str[i - 1] !== '\\') quote = null;
          continue;
        }
        if (ch === "'" || ch === '"' || ch === '`') {
          quote = ch;
          current += ch;
          continue;
        }
        if (ch === '(' || ch === '[') {
          depth++;
          current += ch;
          continue;
        }
        if (ch === ')' || ch === ']') {
          depth--;
          current += ch;
          continue;
        }
        if (ch === ',' && depth === 0) {
          parts.push(current.trim());
          current = '';
          continue;
        }
        current += ch;
      }

      if (current.trim()) parts.push(current.trim());
      return parts;
    },

    quoteIdent(name) {
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) return name;
      return `"${String(name).replace(/"/g, '""')}"`;
    },

    formatDefault(defaultVal) {
      if (defaultVal === null || defaultVal === undefined || defaultVal === '') return '';
      const s = String(defaultVal);
      if (/^NULL$/i.test(s)) return ' DEFAULT NULL';
      if (/^(CURRENT_TIMESTAMP|CURRENT_DATE|CURRENT_TIME)$/i.test(s)) return ` DEFAULT ${s.toUpperCase()}`;
      if (/^\(.*\)$/.test(s) || /^-?\d+(\.\d+)?$/.test(s) || /^(true|false)$/i.test(s)) return ` DEFAULT ${s}`;
      return ` DEFAULT '${s.replace(/'/g, "''")}'`;
    },

    formatValue(value) {
      if (value === null || value === undefined) return 'NULL';
      if (typeof value === 'boolean') return value ? 'true' : 'false';
      if (typeof value === 'number') return String(value);
      if (typeof value === 'object') {
        try {
          return JSON.stringify(value, null, 2);
        } catch {
          return String(value);
        }
      }
      return String(value);
    },

    compareValues(a, b, dir) {
      if (a === b) return 0;
      if (a === null || a === undefined) return 1 * dir;
      if (b === null || b === undefined) return -1 * dir;
      if (typeof a === 'number' && typeof b === 'number') return (a - b) * dir;
      if (typeof a === 'boolean' && typeof b === 'boolean') return (a === b ? 0 : a ? 1 : -1) * dir;
      return String(a).localeCompare(String(b), undefined, { numeric: true }) * dir;
    }
  };

  // ─────────────── Parser ───────────────
  const Parser = {
    parseJSONData(text) {
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        throw new Error(`JSON is invalid: ${e.message}`);
      }
      if (!Array.isArray(parsed)) {
        throw new Error('JSON is valid but the top level is not an array. Paste a JSON array of objects.');
      }
      if (parsed.some(row => row === null || typeof row !== 'object' || Array.isArray(row))) {
        throw new Error('JSON rows must be objects. Arrays or primitives are not supported.');
      }
      return parsed;
    },

    detectDelimiter(lines) {
      const first = lines[0] || '';
      if (first.includes('|')) return '|';
      if (first.includes('\t')) return '\t';
      if (first.includes(',')) return ',';
      if (/\s{2,}/.test(first)) return 'spaces';
      if (/\s/.test(first)) return 'spaces-single';
      return 'spaces';
    },

    splitRow(line, delim) {
      if (delim === '|' || delim === ',' || delim === '\t') {
        return line.split(delim).map(s => s.trim());
      }
      if (delim === 'spaces-single') {
        return line.split(/\s+/).map(s => s.trim());
      }
      const parts = line.split(/\s{2,}/).map(s => s.trim());
      if (parts.length === 1 && /\s/.test(line)) {
        return line.split(/\s+/).map(s => s.trim());
      }
      return parts;
    },

    parseSQLTableText(text) {
      const lines = text.replace(/\r/g, '').split('\n')
        .map(l => l.trim())
        .filter(l => l && !/^[+\-|]+$/.test(l) && !/^\+[-+]+$/.test(l));

      if (!lines.length) throw new Error('No rows found in pasted output');
      const delim = Parser.detectDelimiter(lines);
      const headers = Parser.splitRow(lines[0], delim);

      if (!headers.length) throw new Error('Could not parse header row');

      const rows = [];
      const warnings = [];

      for (let i = 1; i < lines.length; i++) {
        const cells = Parser.splitRow(lines[i], delim);
        if (cells.length === 0 || cells.every(c => c === '')) continue;

        if (cells.length !== headers.length) {
          warnings.push(`Row ${i + 1}: expected ${headers.length} cells but got ${cells.length}. Padding or truncating cells.`);
        }

        const row = {};
        headers.forEach((h, idx) => {
          row[h] = cells[idx] !== undefined ? cells[idx] : '';
        });
        rows.push(row);
      }

      const columns = headers.map(h => ({
        name: h,
        type: 'TEXT',
        nullable: true,
        default: null,
        primaryKey: false,
        unique: false,
        extra: '',
        inferred: true
      }));

      return { columns, rows, warnings, sourceType: 'sql' };
    },

    extractColumnsFromConstraint(part) {
      const m = part.match(/\(([^)]*)\)/);
      if (!m) return [];
      return m[1].split(',').map(s => s.trim().replace(/["'`]/g, '')).filter(Boolean);
    },

    parseColumnDef(def) {
      const t = def.trim();
      let name, rest;

      const quotedMatch = t.match(/^([`"[])(.*?)\1\s*(.*)$/);
      if (quotedMatch) {
        name = quotedMatch[2];
        rest = quotedMatch[3];
      } else {
        const parts = t.split(/\s+/);
        name = parts.shift() || '';
        rest = parts.join(' ');
      }

      if (!name) return null;
      if (!rest) {
        return {
          name,
          type: 'UNKNOWN',
          nullable: true,
          default: null,
          primaryKey: false,
          unique: false,
          extra: ''
        };
      }

      const typeMatch = rest.match(/^([A-Za-z][A-Za-z0-9_]*)(?:\s*\(([^)]*)\))?/);
      const type = typeMatch ? typeMatch[1].toUpperCase() : 'UNKNOWN';
      const notNull = /NOT\s+NULL/i.test(rest);
      const primaryKey = /PRIMARY\s+KEY/i.test(rest);
      const unique = /UNIQUE/i.test(rest);

      let defaultVal = null;
      const dm = rest.match(/DEFAULT\s+((?:'[^']*'|"[^"]*"|`[^`]*`|\S+)(?:\([^)]*\))?)/i);
      if (dm) defaultVal = dm[1].replace(/^['"`]|['"`]$/g, '');

      let extra = rest
        .replace(/^[A-Za-z][A-Za-z0-9_]*(?:\s*\([^)]*\))?\s*/, '')
        .replace(/NOT\s+NULL/i, '')
        .replace(/DEFAULT\s+(?:'[^']*'|"[^"]*"|`[^`]*`|\S+)(?:\([^)]*\))?/i, '')
        .replace(/PRIMARY\s+KEY/i, '')
        .replace(/UNIQUE/i, '')
        .trim();

      return {
        name,
        type,
        nullable: !notNull,
        default: defaultVal,
        primaryKey,
        unique,
        extra
      };
    },

    parseSchemaSQL(text) {
      const clean = text
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/--.*$/gm, '')
        .trim();

      let m = clean.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["'`]?([^"'\s(]+)["'`]?\s*\(([\s\S]*)\)\s*;?/i);

      if (!m) {
        const open = clean.indexOf('(');
        const close = clean.lastIndexOf(')');
        if (open === -1 || close === -1 || close < open) {
          throw new Error('Unable to parse schema: CREATE TABLE parentheses not found');
        }
        const nameMatch = clean.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["'`]?([^"'\(]+?)["'`]?\s*\(/i);
        if (!nameMatch) throw new Error('Unable to parse schema: table name not found');
        m = [null, nameMatch[1], clean.slice(open + 1, close)];
      }

      const tableName = (m[1] || '').replace(/["'`]/g, '').trim();
      const body = m[2];
      const parts = Utils.splitTopLevelComma(body);
      const columns = [];
      const warnings = [];
      const tablePKs = [];
      const tableUniques = [];

      for (const part of parts) {
        if (!part) continue;

        if (/^PRIMARY\s+KEY/i.test(part)) {
          tablePKs.push(...Parser.extractColumnsFromConstraint(part));
          continue;
        }
        if (/^UNIQUE/i.test(part)) {
          tableUniques.push(...Parser.extractColumnsFromConstraint(part));
          continue;
        }
        if (/^(FOREIGN\s+KEY|CONSTRAINT|CHECK)/i.test(part)) {
          warnings.push(`Ignored table-level constraint: ${part}`);
          continue;
        }

        const col = Parser.parseColumnDef(part);
        if (col) columns.push(col);
        else warnings.push(`Skipped unrecognized schema item: ${part}`);
      }

      tablePKs.forEach(name => {
        const col = columns.find(c => c.name === name);
        if (col) col.primaryKey = true;
        else warnings.push(`Primary key column not found: ${name}`);
      });

      tableUniques.forEach(name => {
        const col = columns.find(c => c.name === name);
        if (col) col.unique = true;
        else warnings.push(`Unique column not found: ${name}`);
      });

      if (!columns.length) warnings.push('No columns parsed from schema.');
      return { tableName, columns, warnings };
    },

    parseSchemaText(text) {
      const parsed = Parser.parseSQLTableText(text);
      const rows = parsed.rows;
      if (!rows.length) throw new Error('Schema table did not contain any rows');

      const columns = rows.map(row => {
        const name = row['Column Name'] || row['column'] || row['name'] || row['Field'] || row['Column'] || '';
        const type = (row['Type'] || row['type'] || row['Data Type'] || 'TEXT').toUpperCase();
        const nullable = !(String(row['Nullable'] || row['nullable'] || row['Null'] || '').toUpperCase() === 'NO');
        const defaultVal = row['Default'] || row['default'] || null;
        const key = String(row['Key'] || row['Primary Key'] || row['primary'] || row['Unique'] || '').toUpperCase();
        const primaryKey = key.includes('PRI') || key.includes('PRIMARY') || key === 'PK';
        const unique = key.includes('UNI') || key.includes('UNIQUE');
        const extra = row['Extra'] || row['extra'] || '';

        if (!name) throw new Error('Schema table is missing a column name column.');
        return { name, type, nullable, default: defaultVal, primaryKey, unique, extra };
      });

      return { columns, warnings: parsed.warnings };
    },

    parseSchemaInput(text) {
      const trimmed = text.trim();
      if (!trimmed) return { columns: [], warnings: [] };
      if (/^CREATE\s+TABLE/i.test(trimmed)) return Parser.parseSchemaSQL(trimmed);
      return Parser.parseSchemaText(trimmed);
    },

    parseDataInput(text, preferredMode) {
      const trimmed = text.trim();
      if (!trimmed) return { rows: [], warnings: [], sourceType: 'empty', raw: text };
      const looksJSON = trimmed.startsWith('[') || trimmed.startsWith('{');

      if (preferredMode === 'json' || looksJSON) {
        const rows = Parser.parseJSONData(trimmed);
        return { rows, warnings: [], sourceType: 'json', raw: text };
      }

      return Parser.parseSQLTableText(trimmed);
    },

    inferSchemaFromData(rows) {
      const keysSet = new Set();
      rows.forEach(row => {
        if (row && typeof row === 'object') {
          Object.keys(row).forEach(k => keysSet.add(k));
        }
      });

      const columns = Array.from(keysSet).map(key => {
        let type = 'TEXT';

        for (const row of rows) {
          const v = row?.[key];
          if (v === null || v === undefined) continue;

          if (typeof v === 'number') {
            if (Number.isInteger(v)) {
              if (type === 'TEXT') type = 'INTEGER';
            } else {
              type = 'REAL';
            }
          } else if (typeof v === 'boolean') {
            if (type === 'TEXT') type = 'BOOLEAN';
          }
        }

        return {
          name: key,
          type,
          nullable: true,
          default: null,
          primaryKey: false,
          unique: false,
          extra: '',
          inferred: true
        };
      });

      return {
        columns,
        warnings: ['Schema was inferred from JSON data. Constraints and primary keys are not inferred.']
      };
    },

    validateSchemaData(schemaColumns, rows) {
      const warnings = [];
      if (!rows.length) return warnings;

      const schemaNames = new Set(schemaColumns.map(c => c.name));
      const dataNames = new Set();
      rows.forEach(row => {
        if (row && typeof row === 'object') {
          Object.keys(row).forEach(k => dataNames.add(k));
        }
      });

      schemaNames.forEach(name => {
        const present = rows.some(row => row && Object.prototype.hasOwnProperty.call(row, name));
        if (!present) warnings.push(`Column "${name}" defined in schema does not appear in data.`);
      });

      dataNames.forEach(name => {
        if (!schemaNames.has(name)) warnings.push(`Data contains column "${name}" that is not in schema.`);
      });

      return warnings;
    }
  };

  // ─────────────── SQL Generator ───────────────
  const SQLGenerator = {
    _columns(table) {
      if (table.schema && table.schema.length) return table.schema;
      const keys = new Set();
      (table.data || []).forEach(row => {
        if (row && typeof row === 'object') Object.keys(row).forEach(k => keys.add(k));
      });
      return Array.from(keys).map(name => ({ name, type: 'TEXT' }));
    },

    _firstColumn(table) {
      const cols = SQLGenerator._columns(table);
      if (!cols.length) return 'id';
      const pk = cols.find(c => c.primaryKey);
      const id = cols.find(c => c.name.toLowerCase() === 'id');
      return (pk || id || cols[0]).name;
    },

    createTable(table) {
      const cols = table.schema || [];
      const lines = cols.map(col => {
        let line = `  ${Utils.quoteIdent(col.name)} ${col.type || 'TEXT'}`;
        if (col.primaryKey) line += ' PRIMARY KEY';
        if (col.unique) line += ' UNIQUE';
        if (!col.nullable) line += ' NOT NULL';
        if (col.default != null && col.default !== '') line += Utils.formatDefault(col.default);
        if (col.extra) line += ` ${col.extra}`;
        return line;
      });

      return `CREATE TABLE ${Utils.quoteIdent(table.name)} (\n${lines.join(',\n')}\n);`;
    },

    insertRows(table, rows) {
      const cols = (table.schema && table.schema.length)
        ? table.schema.map(c => c.name)
        : Object.keys(rows[0] || {});

      if (!cols.length) return '-- no columns available --';

      const header = `INSERT INTO ${Utils.quoteIdent(table.name)} (${cols.map(c => Utils.quoteIdent(c)).join(', ')})`;
      const values = rows.map(row => {
        const parts = cols.map(col => {
          const v = row[col];
          if (v === null || v === undefined) return 'NULL';
          if (typeof v === 'number') return String(v);
          if (typeof v === 'boolean') return v ? '1' : '0';
          if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
          return `'${String(v).replace(/'/g, "''")}'`;
        });
        return `(${parts.join(', ')})`;
      });

      return `${header}\nVALUES\n${values.join(',\n')};`;
    },

    selectAll(table) {
      return `SELECT * FROM ${Utils.quoteIdent(table.name)};`;
    },

    selectWhere(table) {
      const col = SQLGenerator._firstColumn(table);
      return `SELECT * FROM ${Utils.quoteIdent(table.name)}\nWHERE ${Utils.quoteIdent(col)} = 'value';`;
    },

    insertStatement(table) {
      const cols = SQLGenerator._columns(table).map(c => c.name);
      return `INSERT INTO ${Utils.quoteIdent(table.name)} (${cols.map(c => Utils.quoteIdent(c)).join(', ')})\nVALUES (${cols.map(() => '?').join(', ')});`;
    },

    updateStatement(table) {
      const cols = SQLGenerator._columns(table).map(c => c.name);
      const where = SQLGenerator._firstColumn(table);
      const setCol = cols.find(c => c !== where) || where;
      return `UPDATE ${Utils.quoteIdent(table.name)}\nSET ${Utils.quoteIdent(setCol)} = 'value'\nWHERE ${Utils.quoteIdent(where)} = 1;`;
    },

    deleteStatement(table) {
      const col = SQLGenerator._firstColumn(table);
      return `DELETE FROM ${Utils.quoteIdent(table.name)}\nWHERE ${Utils.quoteIdent(col)} = 1;`;
    },

    count(table) {
      return `SELECT COUNT(*) AS count FROM ${Utils.quoteIdent(table.name)};`;
    },

    drop(table) {
      return `DROP TABLE IF EXISTS ${Utils.quoteIdent(table.name)};`;
    },

    alter(table) {
      return `ALTER TABLE ${Utils.quoteIdent(table.name)} ADD COLUMN "new_column" TEXT;`;
    }
  };

  // ─────────────── Storage ───────────────
  const Storage = {
    WORKSPACE_KEY: 'dbInspector.workspace.v1',
    SETTINGS_KEY: 'dbInspector.settings.v1',

    saveWorkspace(workspace) {
      try {
        localStorage.setItem(this.WORKSPACE_KEY, JSON.stringify(workspace));
      } catch (e) {
        Utils.toast('Failed to save workspace: ' + e.message, 'error');
      }
    },

    loadWorkspace() {
      try {
        const raw = localStorage.getItem(this.WORKSPACE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },

    saveSettings(settings) {
      try {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
      } catch {
        // ignore
      }
    },

    loadSettings() {
      try {
        const raw = localStorage.getItem(this.SETTINGS_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },

    clear() {
      try {
        localStorage.removeItem(this.WORKSPACE_KEY);
        localStorage.removeItem(this.SETTINGS_KEY);
      } catch {
        // ignore
      }
    }
  };

  // ─────────────── Default Sample Workspace ───────────────
  function makeSampleTable(name, schema, data, rawSchema) {
    return {
      id: Utils.uid(),
      name,
      schema,
      data,
      rawSchema,
      rawData: JSON.stringify(data, null, 2),
      warnings: []
    };
  }

  function defaultWorkspace() {
    const usersSchema = [
      { name: 'id', type: 'INTEGER', nullable: false, default: null, primaryKey: true, unique: false, extra: '' },
      { name: 'telegram_id', type: 'TEXT', nullable: false, default: null, primaryKey: false, unique: true, extra: '' },
      { name: 'username', type: 'TEXT', nullable: true, default: null, primaryKey: false, unique: false, extra: '' },
      { name: 'first_name', type: 'TEXT', nullable: true, default: null, primaryKey: false, unique: false, extra: '' },
      { name: 'created_at', type: 'DATETIME', nullable: true, default: 'CURRENT_TIMESTAMP', primaryKey: false, unique: false, extra: '' }
    ];

    const usersData = [
      { id: 1, telegram_id: '123456', username: 'test', first_name: 'Abbas', created_at: '2026-08-23 10:00:00' },
      { id: 2, telegram_id: '456789', username: 'test2', first_name: 'Ali', created_at: '2026-08-23 11:30:00' },
      { id: 3, telegram_id: '789012', username: 'dev', first_name: 'Sara', created_at: '2026-08-23 12:15:00' }
    ];

    const adminsSchema = [
      { name: 'id', type: 'INTEGER', nullable: false, default: null, primaryKey: true, unique: false, extra: '' },
      { name: 'user_id', type: 'INTEGER', nullable: false, default: null, primaryKey: false, unique: false, extra: '' },
      { name: 'role', type: 'TEXT', nullable: true, default: null, primaryKey: false, unique: false, extra: '' },
      { name: 'created_at', type: 'DATETIME', nullable: true, default: 'CURRENT_TIMESTAMP', primaryKey: false, unique: false, extra: '' }
    ];

    const adminsData = [
      { id: 1, user_id: 1, role: 'superadmin', created_at: '2026-08-23 09:00:00' }
    ];

    const ordersSchema = [
      { name: 'id', type: 'INTEGER', nullable: false, default: null, primaryKey: true, unique: false, extra: '' },
      { name: 'user_id', type: 'INTEGER', nullable: false, default: null, primaryKey: false, unique: false, extra: '' },
      { name: 'product', type: 'TEXT', nullable: true, default: null, primaryKey: false, unique: false, extra: '' },
      { name: 'price', type: 'REAL', nullable: true, default: null, primaryKey: false, unique: false, extra: '' },
      { name: 'status', type: 'TEXT', nullable: true, default: 'pending', primaryKey: false, unique: false, extra: '' },
      { name: 'metadata', type: 'TEXT', nullable: true, default: null, primaryKey: false, unique: false, extra: '' },
      { name: 'created_at', type: 'DATETIME', nullable: true, default: 'CURRENT_TIMESTAMP', primaryKey: false, unique: false, extra: '' }
    ];

    const ordersData = [
      { id: 1, user_id: 1, product: 'Bot Pro', price: 29.0, status: 'paid', metadata: { coupon: 'SAVE10', source: 'web' }, created_at: '2026-08-23 10:15:00' },
      { id: 2, user_id: 2, product: 'Telegram Setup', price: 49.5, status: 'pending', metadata: { source: 'mobile' }, created_at: '2026-08-23 11:20:00' },
      { id: 3, user_id: 1, product: 'Custom Bot', price: 99.0, status: 'paid', metadata: null, created_at: '2026-08-23 13:00:00' }
    ];

    const paymentsSchema = [
      { name: 'id', type: 'INTEGER', nullable: false, default: null, primaryKey: true, unique: false, extra: '' },
      { name: 'order_id', type: 'INTEGER', nullable: false, default: null, primaryKey: false, unique: false, extra: '' },
      { name: 'amount', type: 'REAL', nullable: true, default: null, primaryKey: false, unique: false, extra: '' },
      { name: 'method', type: 'TEXT', nullable: true, default: null, primaryKey: false, unique: false, extra: '' },
      { name: 'paid_at', type: 'DATETIME', nullable: true, default: null, primaryKey: false, unique: false, extra: '' }
    ];

    const paymentsData = [
      { id: 1, order_id: 1, amount: 29.0, method: 'card', paid_at: '2026-08-23 10:16:00' },
      { id: 2, order_id: 2, amount: 49.5, method: 'crypto', paid_at: null }
    ];

    const usersRaw = `CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  telegram_id TEXT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`;

    const adminsRaw = `CREATE TABLE admins (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  role TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`;

    const ordersRaw = `CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product TEXT,
  price REAL,
  status TEXT DEFAULT pending,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`;

    const paymentsRaw = `CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  amount REAL,
  method TEXT,
  paid_at DATETIME
);`;

    return {
      name: 'Local Workspace',
      tables: [
        makeSampleTable('users', usersSchema, usersData, usersRaw),
        makeSampleTable('admins', adminsSchema, adminsData, adminsRaw),
        makeSampleTable('orders', ordersSchema, ordersData, ordersRaw),
        makeSampleTable('payments', paymentsSchema, paymentsData, paymentsRaw)
      ]
    };
  }

  // ─────────────── State ───────────────
  const State = {
    workspace: null,
    selectedTableId: null,
    settings: { darkMode: true, compact: false, showLineNumbers: true },
    tab: 'schema',
    dataView: { search: '', sortKey: null, sortDir: 'asc', page: 1, pageSize: 50 },

    init() {
      const savedSettings = Storage.loadSettings();
      if (savedSettings) {
        this.settings = Object.assign({}, this.settings, savedSettings);
      }

      const savedWorkspace = Storage.loadWorkspace();
      if (savedWorkspace && Array.isArray(savedWorkspace.tables)) {
        this.workspace = savedWorkspace;
      } else {
        this.workspace = defaultWorkspace();
      }

      if (this.workspace.tables.length) {
        this.selectedTableId = this.workspace.tables[0].id;
      } else {
        this.selectedTableId = null;
      }

      this.tab = 'schema';
      this.dataView = { search: '', sortKey: null, sortDir: 'asc', page: 1, pageSize: 50 };
    },

    get selectedTable() {
      if (!this.workspace) return null;
      return this.workspace.tables.find(t => t.id === this.selectedTableId) || this.workspace.tables[0] || null;
    },

    get totalRows() {
      return this.workspace.tables.reduce((sum, t) => sum + (t.data?.length || 0), 0);
    },

    save() {
      Storage.saveWorkspace(this.workspace);
    },

    updateSettings(partial) {
      Object.assign(this.settings, partial);
      Storage.saveSettings(this.settings);
      applySettings();
      Renderer.renderMain();
    }
  };

  // ─────────────── Renderer ───────────────
  const Renderer = {
    modalTableId: null,
    modalMode: 'json',

    renderAll() {
      this.renderSidebar();
      this.renderMain();
      this.renderStatusbar();
    },

    renderSidebar() {
      const list = document.getElementById('table-list');
      const workspaceName = document.getElementById('workspace-name');
      if (workspaceName) workspaceName.textContent = State.workspace.name || 'Local Workspace';

      const tables = State.workspace.tables;
      if (!tables.length) {
        list.innerHTML = '<div class="empty-state small">No tables</div>';
        return;
      }

      list.innerHTML = tables.map(table => {
        const active = table.id === State.selectedTableId ? 'active' : '';
        const cols = table.schema.length;
        const rows = table.data?.length || 0;

        return `
          <div class="table-item ${active}" data-action="select-table" data-id="${Utils.escapeAttr(table.id)}" tabindex="0" role="button" aria-label="Table ${Utils.escapeHTML(table.name)}">
            <div class="table-item-main">
              <div class="table-name">${Utils.escapeHTML(table.name)}</div>
              <div class="table-meta">${cols} cols · ${rows} rows</div>
            </div>
            <div class="table-item-actions">
              <button data-action="duplicate-table" data-id="${Utils.escapeAttr(table.id)}" title="Duplicate">⧉</button>
              <button data-action="delete-table" data-id="${Utils.escapeAttr(table.id)}" title="Delete">✕</button>
            </div>
          </div>`;
      }).join('');
    },

    renderStatusbar() {
      document.getElementById('status-tables').textContent = `Tables: ${State.workspace.tables.length}`;
      document.getElementById('status-rows').textContent = `Rows: ${State.totalRows}`;
      document.getElementById('status-workspace').textContent = `Workspace: ${State.workspace.name || 'Local'}`;
    },

    getVisibleColumns(table) {
      const cols = (table.schema || []).map(c => ({ ...c, isExtra: false }));
      const rows = table.data || [];
      const seen = new Set(cols.map(c => c.name));

      rows.forEach(row => {
        if (row && typeof row === 'object') {
          Object.keys(row).forEach(key => {
            if (!seen.has(key)) {
              seen.add(key);
              cols.push({
                name: key,
                type: 'UNKNOWN',
                nullable: true,
                default: null,
                primaryKey: false,
                unique: false,
                extra: '',
                isExtra: true
              });
            }
          });
        }
      });

      return cols;
    },

    getFilteredRows(table, columns) {
      let rows = table.data || [];
      const q = State.dataView.search.trim().toLowerCase();

      if (q) {
        rows = rows.filter(row => columns.some(col => {
          const v = row?.[col.name];
          return String(v ?? '').toLowerCase().includes(q);
        }));
      }

      const sortKey = State.dataView.sortKey;
      if (sortKey) {
        const dir = State.dataView.sortDir === 'asc' ? 1 : -1;
        rows = [...rows].sort((a, b) => Utils.compareValues(a[sortKey], b[sortKey], dir));
      }

      return rows;
    },

    getPaginatedData(table) {
      const columns = this.getVisibleColumns(table);
      const filtered = this.getFilteredRows(table, columns);
      const totalRows = filtered.length;
      const pageSize = State.dataView.pageSize;
      const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
      const page = Math.min(State.dataView.page, totalPages);
      State.dataView.page = page;
      const start = (page - 1) * pageSize;
      const pageRows = filtered.slice(start, start + pageSize);

      return { columns, filtered, totalRows, totalPages, page, pageRows };
    },

    renderMain() {
      const main = document.getElementById('main-content');
      const table = State.selectedTable;

      if (!table) {
        main.innerHTML = `
          <div class="empty-state">
            <h3>No table selected</h3>
            <p>Add or import a table from the sidebar.</p>
            <button data-action="add-table" class="btn-primary">Add Table</button>
          </div>`;
        return;
      }

      const warnings = table.warnings || [];
      const activeTab = State.tab;

      main.innerHTML = `
        <div class="table-header">
          <div>
            <h2>${Utils.escapeHTML(table.name)}</h2>
            <span class="subtitle">${table.schema.length} columns · ${table.data?.length || 0} rows</span>
          </div>
          <div class="table-actions">
            <button data-action="copy-schema">Copy Schema</button>
            <button data-action="copy-json">Copy JSON</button>
            <button data-action="copy-sql-insert">Copy SQL INSERT</button>
            <button data-action="edit-table">Edit</button>
            <button data-action="duplicate-table">Duplicate</button>
            <button data-action="delete-table" class="btn-danger">Delete</button>
          </div>
        </div>
        ${warnings.length ? this.renderWarnings(warnings) : ''}
        ${this.renderStats(table)}
        <div class="tabs">
          <button class="tab ${activeTab === 'schema' ? 'active' : ''}" data-action="tab-schema">Schema</button>
          <button class="tab ${activeTab === 'data' ? 'active' : ''}" data-action="tab-data">Data</button>
          <button class="tab ${activeTab === 'raw' ? 'active' : ''}" data-action="tab-raw">Raw</button>
        </div>
        <div class="tab-content">
          ${activeTab === 'schema' ? this.renderSchemaTab(table) : activeTab === 'data' ? this.renderDataTab(table) : this.renderRawTab(table)}
        </div>`;
    },

    renderStats(table) {
      const schema = table.schema || [];
      const pk = schema.filter(c => c.primaryKey).length;
      const unique = schema.filter(c => c.unique).length;
      const nullable = schema.filter(c => c.nullable).length;

      return `
        <div class="stats-grid">
          <div class="stat"><span>Rows</span><strong>${table.data?.length || 0}</strong></div>
          <div class="stat"><span>Columns</span><strong>${schema.length}</strong></div>
          <div class="stat"><span>Primary Keys</span><strong>${pk}</strong></div>
          <div class="stat"><span>Unique</span><strong>${unique}</strong></div>
          <div class="stat"><span>Nullable</span><strong>${nullable}</strong></div>
        </div>`;
    },

    renderWarnings(warnings) {
      return `
        <div class="warning-banner">
          <strong>Warnings:</strong>
          <ul>${warnings.map(w => `<li>${Utils.escapeHTML(w)}</li>`).join('')}</ul>
        </div>`;
    },

    renderSchemaTab(table) {
      const cols = table.schema || [];
      if (!cols.length) {
        return '<div class="empty-state small">No schema defined for this table.</div>';
      }

      return `
        <div class="schema-toolbar" style="margin-bottom:12px;">
          <button data-action="copy-schema" class="btn-secondary">Copy Schema SQL</button>
        </div>
        <div class="table-scroll">
          <table class="schema-table">
            <thead>
              <tr>
                <th>Column Name</th>
                <th>Type</th>
                <th>Nullable</th>
                <th>Default</th>
                <th>Primary Key</th>
                <th>Unique</th>
                <th>Extra</th>
              </tr>
            </thead>
            <tbody>
              ${cols.map(col => `
                <tr>
                  <td>${Utils.escapeHTML(col.name)}</td>
                  <td>${Utils.escapeHTML(col.type || 'UNKNOWN')}</td>
                  <td>${col.nullable ? 'YES' : 'NO'}</td>
                  <td>${col.default == null ? 'NULL' : Utils.escapeHTML(String(col.default))}</td>
                  <td>${col.primaryKey ? 'PK' : ''}</td>
                  <td>${col.unique ? 'UNIQUE' : ''}</td>
                  <td>${Utils.escapeHTML(col.extra || '')}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    },

    renderCellValue(value, rowIndex, colIndex) {
      if (value === null || value === undefined) return '<span class="null">NULL</span>';
      if (typeof value === 'boolean') return `<span class="bool">${value}</span>`;
      if (typeof value === 'number') return `<span class="number">${Utils.escapeHTML(String(value))}</span>`;

      if (typeof value === 'object') {
        const json = JSON.stringify(value);
        const preview = json.length > 120 ? `${Utils.escapeHTML(json.slice(0, 120))}…` : Utils.escapeHTML(json);
        return `<span class="json-cell"><span class="json-preview">${preview}</span><button class="json-toggle" data-action="json-toggle" data-row-index="${rowIndex}" data-col-index="${colIndex}">Expand</button></span>`;
      }

      const str = String(value);
      const trimmed = str.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          JSON.parse(str);
          const preview = str.length > 120 ? `${Utils.escapeHTML(str.slice(0, 120))}…` : Utils.escapeHTML(str);
          return `<span class="json-cell"><span class="json-preview">${preview}</span><button class="json-toggle" data-action="json-toggle" data-row-index="${rowIndex}" data-col-index="${colIndex}">Expand</button></span>`;
        } catch {
          // ignore
        }
      }

      if (str.length > 200) {
        return `<span class="text long-text">${Utils.escapeHTML(str.slice(0, 200))}… <button class="json-toggle" data-action="json-toggle" data-row-index="${rowIndex}" data-col-index="${colIndex}">Expand</button></span>`;
      }

      return `<span class="text">${Utils.escapeHTML(str)}</span>`;
    },

    renderDataTab(table) {
      const { columns, totalRows, totalPages, page, pageRows } = this.getPaginatedData(table);
      const showLines = State.settings.showLineNumbers;
      const sortKey = State.dataView.sortKey;
      const sortArrow = State.dataView.sortDir === 'asc' ? '▲' : '▼';

      let html = `
        <div class="data-toolbar">
          <input id="data-search" type="search" placeholder="Search ${totalRows} rows..." value="${Utils.escapeAttr(State.dataView.search)}">
          <select id="page-size-select">
            ${[25, 50, 100, 500].map(size => `<option value="${size}" ${State.dataView.pageSize === size ? 'selected' : ''}>${size} rows</option>`).join('')}
          </select>
        </div>`;

      if (!totalRows) {
        html += '<div class="empty-state small">No data rows found.</div>';
        return html;
      }

      html += '<div class="table-scroll"><table class="data-grid"><thead><tr>';
      if (showLines) html += '<th class="rownum-col">#</th>';

      html += columns.map(col => {
        const isSorted = sortKey === col.name;
        return `<th data-action="sort-column" data-col="${Utils.escapeAttr(col.name)}" class="${col.isExtra ? 'extra-col' : ''}">${Utils.escapeHTML(col.name)}${isSorted ? ` ${sortArrow}` : ''}</th>`;
      }).join('');

      html += '</tr></thead><tbody>';

      pageRows.forEach((row, i) => {
        const globalIndex = (page - 1) * State.dataView.pageSize + i;
        html += '<tr>';
        if (showLines) {
          html += `<td class="rownum-col">${globalIndex + 1}<button class="row-copy" data-action="copy-row" data-row-index="${i}" title="Copy row JSON">⧉</button></td>`;
        }

        columns.forEach((col, colIdx) => {
          const val = row[col.name];
          html += `<td class="${col.isExtra ? 'extra-col' : ''}"><div class="cell-wrap">${this.renderCellValue(val, i, colIdx)}<button class="copy-btn" data-action="copy-cell" data-row-index="${i}" data-col-index="${colIdx}" title="Copy cell">⧉</button></div></td>`;
        });

        html += '</tr>';
      });

      html += '</tbody></table></div>';

      html += `
        <div class="pagination">
          <span>${totalRows} rows</span>
          <button data-action="page-prev" ${page <= 1 ? 'disabled' : ''}>Prev</button>
          <span>Page ${page} / ${totalPages}</span>
          <button data-action="page-next" ${page >= totalPages ? 'disabled' : ''}>Next</button>
        </div>`;

      return html;
    },

    renderRawTab(table) {
      const rawSchema = table.rawSchema || '';
      const rawData = table.rawData || '';

      return `
        <div class="raw-section">
          <h4>Raw Schema</h4>
          ${rawSchema
            ? `<pre><code>${Utils.escapeHTML(rawSchema)}</code></pre>`
            : `<div class="empty-state small">No raw schema pasted.</div>`}
        </div>
        <div class="raw-section">
          <h4>Raw Data</h4>
          ${rawData
            ? `<pre><code>${Utils.escapeHTML(rawData)}</code></pre>`
            : '<div class="empty-state small">No raw data pasted.</div>'}
        </div>`;
    },

    openModal(title, bodyHTML) {
      const overlay = document.getElementById('modal-overlay');
      const content = document.getElementById('modal-content');
      overlay.classList.remove('hidden');
      content.innerHTML = `
        <div class="modal-header">
          <h3>${Utils.escapeHTML(title)}</h3>
          <button class="icon-btn" data-action="close-modal" aria-label="Close">✕</button>
        </div>
        <div class="modal-body">${bodyHTML}</div>`;
    },

    closeModal() {
      document.getElementById('modal-overlay').classList.add('hidden');
      document.getElementById('modal-content').innerHTML = '';
    },

    openConfirm(message, onConfirm) {
      App.confirmCallback = onConfirm;
      this.openModal('Confirm', `
        <div class="confirm-text">${Utils.escapeHTML(message)}</div>
        <div class="modal-actions">
          <button data-action="cancel-modal" class="btn-secondary">Cancel</button>
          <button data-action="confirm-modal" class="btn-danger">Confirm</button>
        </div>`);
    },

    openTableModal(tableId) {
      const existing = tableId ? State.workspace.tables.find(t => t.id === tableId) : null;
      this.modalTableId = tableId || null;
      this.modalMode = existing?.rawData?.trim().startsWith('[') || existing?.rawData?.trim().startsWith('{') ? 'json' : 'sql';

      const bodyHTML = `
        <div class="form-grid">
          <label for="modal-table-name">Table Name</label>
          <input id="modal-table-name" type="text" value="${Utils.escapeAttr(existing?.name || '')}" placeholder="users">

          <label for="modal-schema">Schema (SQL CREATE TABLE, optional)</label>
          <textarea id="modal-schema" rows="6" placeholder="CREATE TABLE ...">${Utils.escapeHTML(existing?.rawSchema || '')}</textarea>

          <label>Data</label>
          <div class="mode-tabs" id="modal-data-mode">
            <button type="button" data-action="mode-json" class="${this.modalMode === 'json' ? 'active' : ''}">Paste JSON</button>
            <button type="button" data-action="mode-sql" class="${this.modalMode === 'sql' ? 'active' : ''}">Paste SQL Output</button>
          </div>
          <textarea id="modal-data" rows="8" placeholder='[{"id":1}]'>${Utils.escapeHTML(existing?.rawData || '')}</textarea>

          <div id="modal-error" class="error-box hidden"></div>
        </div>
        <div class="modal-actions">
          <button data-action="cancel-modal" class="btn-secondary">Cancel</button>
          <button data-action="save-table" class="btn-primary">${existing ? 'Update Table' : 'Add Table'}</button>
        </div>`;

      this.openModal(existing ? 'Edit Table' : 'Add / Import Table', bodyHTML);
    },

    setModalMode(mode) {
      this.modalMode = mode;
      document.querySelectorAll('#modal-data-mode button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.action === `mode-${mode}`);
      });
    },

    openSettingsModal() {
      const bodyHTML = `
        <div class="settings-list">
          <label class="setting-row"><input type="checkbox" id="set-dark" ${State.settings.darkMode ? 'checked' : ''}> Dark Mode</label>
          <label class="setting-row"><input type="checkbox" id="set-compact" ${State.settings.compact ? 'checked' : ''}> Compact Mode</label>
          <label class="setting-row"><input type="checkbox" id="set-lines" ${State.settings.showLineNumbers ? 'checked' : ''}> Show Line Numbers</label>
        </div>
        <div class="settings-actions">
          <button data-action="save-workspace">Save Workspace</button>
          <button data-action="export-workspace">Export Workspace</button>
          <button data-action="import-workspace-file">Import Workspace</button>
          <button data-action="reset-workspace" class="btn-danger">Reset Workspace</button>
          <button data-action="clear-local-data" class="btn-danger">Clear Local Data</button>
        </div>
        <div class="modal-actions">
          <button data-action="cancel-modal" class="btn-secondary">Close</button>
        </div>`;

      this.openModal('Settings', bodyHTML);
    },

    openQueryHelperModal() {
      const table = State.selectedTable;
      if (!table) {
        Utils.toast('Select a table first', 'error');
        return;
      }

      const bodyHTML = `
        <div class="query-helper">
          <div class="query-actions">
            <button data-action="query-gen" data-query="selectAll">SELECT ALL</button>
            <button data-action="query-gen" data-query="selectWhere">SELECT WHERE</button>
            <button data-action="query-gen" data-query="insert">INSERT</button>
            <button data-action="query-gen" data-query="update">UPDATE</button>
            <button data-action="query-gen" data-query="delete">DELETE</button>
            <button data-action="query-gen" data-query="count">COUNT</button>
            <button data-action="query-gen" data-query="drop">DROP</button>
            <button data-action="query-gen" data-query="alter">ALTER TABLE</button>
          </div>
          <div class="query-output">
            <textarea id="query-output" readonly rows="8">${Utils.escapeHTML(SQLGenerator.selectAll(table))}</textarea>
            <button data-action="copy-query" class="btn-primary">Copy</button>
          </div>
        </div>
        <div class="modal-actions">
          <button data-action="cancel-modal" class="btn-secondary">Close</button>
        </div>`;

      this.openModal(`Query Helper: ${table.name}`, bodyHTML);
    }
  };

  // ─────────────── App ───────────────
  const App = {
    confirmCallback: null,

    init() {
      State.init();
      applySettings();
      Renderer.renderAll();
      this.bindEvents();
    },

    bindEvents() {
      document.getElementById('btn-menu').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
      });

      document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modal-overlay')) {
          Renderer.closeModal();
        }
      });

      document.addEventListener('click', (e) => {
        const el = e.target.closest('[data-action]');
        if (!el) return;

        const action = el.dataset.action;
        if (['duplicate-table', 'delete-table', 'copy-cell', 'copy-row', 'sort-column', 'json-toggle', 'query-gen', 'mode-json', 'mode-sql'].includes(action)) {
          e.stopPropagation();
        }

        this.handleAction(action, el);
      });

      document.addEventListener('input', (e) => {
        if (e.target.id === 'data-search') {
          State.dataView.search = e.target.value;
          State.dataView.page = 1;
          Renderer.renderMain();
        }
      });

      document.addEventListener('change', (e) => {
        if (e.target.id === 'page-size-select') {
          State.dataView.pageSize = parseInt(e.target.value, 10);
          State.dataView.page = 1;
          Renderer.renderMain();
        }

        if (e.target.id === 'set-dark') {
          State.updateSettings({ darkMode: e.target.checked });
        }
        if (e.target.id === 'set-compact') {
          State.updateSettings({ compact: e.target.checked });
        }
        if (e.target.id === 'set-lines') {
          State.updateSettings({ showLineNumbers: e.target.checked });
        }
      });
    },

    handleAction(action, el) {
      const table = State.selectedTable;

      switch (action) {
        case 'select-table': {
          const id = el.dataset.id;
          if (id) {
            State.selectedTableId = id;
            State.tab = 'schema';
            State.dataView = { search: '', sortKey: null, sortDir: 'asc', page: 1, pageSize: 50 };
            Renderer.renderAll();
            document.getElementById('sidebar').classList.remove('open');
          }
          break;
        }
        case 'add-table':
          Renderer.openTableModal(null);
          break;
        case 'edit-table': {
          const id = el.dataset.id || State.selectedTableId;
          if (id) Renderer.openTableModal(id);
          break;
        }
        case 'duplicate-table': {
          const id = el.dataset.id || State.selectedTableId;
          if (id) this.duplicateTable(id);
          break;
        }
        case 'delete-table': {
          const id = el.dataset.id || State.selectedTableId;
          if (id) this.deleteTable(id);
          break;
        }
        case 'tab-schema':
          State.tab = 'schema';
          Renderer.renderMain();
          break;
        case 'tab-data':
          State.tab = 'data';
          Renderer.renderMain();
          break;
        case 'tab-raw':
          State.tab = 'raw';
          Renderer.renderMain();
          break;
        case 'copy-schema':
          if (table) Utils.copyText(SQLGenerator.createTable(table));
          break;
        case 'copy-json':
          if (table) Utils.copyText(JSON.stringify(table.data, null, 2));
          break;
        case 'copy-sql-insert':
          if (table) Utils.copyText(SQLGenerator.insertRows(table, table.data));
          break;
        case 'sort-column': {
          const col = el.dataset.col;
          if (State.dataView.sortKey === col) {
            State.dataView.sortDir = State.dataView.sortDir === 'asc' ? 'desc' : 'asc';
          } else {
            State.dataView.sortKey = col;
            State.dataView.sortDir = 'asc';
          }
          State.dataView.page = 1;
          Renderer.renderMain();
          break;
        }
        case 'copy-cell':
          this.copyCell(el.dataset.rowIndex, el.dataset.colIndex);
          break;
        case 'copy-row':
          this.copyRow(el.dataset.rowIndex);
          break;
        case 'page-prev':
          State.dataView.page = Math.max(1, State.dataView.page - 1);
          Renderer.renderMain();
          break;
        case 'page-next': {
          const { totalPages } = Renderer.getPaginatedData(State.selectedTable);
          State.dataView.page = Math.min(totalPages, State.dataView.page + 1);
          Renderer.renderMain();
          break;
        }
        case 'json-toggle':
          this.toggleJSON(el.dataset.rowIndex, el.dataset.colIndex, el);
          break;
        case 'query-helper':
          Renderer.openQueryHelperModal();
          break;
        case 'save-workspace':
          State.save();
          Utils.toast('Workspace saved');
          break;
        case 'export-workspace':
          this.exportWorkspace();
          break;
        case 'import':
          Renderer.openTableModal(null);
          break;
        case 'settings':
          Renderer.openSettingsModal();
          break;
        case 'close-modal':
        case 'cancel-modal':
          Renderer.closeModal();
          break;
        case 'confirm-modal':
          if (this.confirmCallback) {
            this.confirmCallback();
            this.confirmCallback = null;
          }
          Renderer.closeModal();
          break;
        case 'save-table':
          this.saveTableFromModal();
          break;
        case 'mode-json':
          Renderer.setModalMode('json');
          break;
        case 'mode-sql':
          Renderer.setModalMode('sql');
          break;
        case 'query-gen':
          this.generateQuery(el.dataset.query);
          break;
        case 'copy-query': {
          const ta = document.getElementById('query-output');
          if (ta) Utils.copyText(ta.value);
          break;
        }
        case 'reset-workspace':
          Renderer.openConfirm('Reset workspace to sample data? This will replace all current tables.', () => this.resetWorkspace());
          break;
        case 'clear-local-data':
          Renderer.openConfirm('Clear all local data and restore sample workspace?', () => this.clearLocalData());
          break;
        case 'import-workspace-file':
          this.promptWorkspaceFile();
          break;
      }
    },

    copyCell(rowIdx, colIdx) {
      const table = State.selectedTable;
      if (!table) return;
      const { columns, pageRows } = Renderer.getPaginatedData(table);
      const row = pageRows[rowIdx];
      const col = columns[colIdx];
      if (row && col) {
        Utils.copyText(Utils.formatValue(row[col.name]));
      }
    },

    copyRow(rowIdx) {
      const table = State.selectedTable;
      if (!table) return;
      const { pageRows } = Renderer.getPaginatedData(table);
      const row = pageRows[rowIdx];
      if (row) Utils.copyText(JSON.stringify(row, null, 2));
    },

    toggleJSON(rowIdx, colIdx, btn) {
      const table = State.selectedTable;
      if (!table) return;

      const { columns, pageRows } = Renderer.getPaginatedData(table);
      const col = columns[colIdx];
      const row = pageRows[rowIdx];
      if (!col || !row) return;

      const cellWrap = btn.closest('.cell-wrap');
      if (!cellWrap) return;

      const existingPre = cellWrap.querySelector('pre.json-expanded');
      if (existingPre) {
        existingPre.remove();
        btn.textContent = 'Expand';
        return;
      }

      const value = row[col.name];
      const text = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
      const pre = document.createElement('pre');
      pre.className = 'json-expanded';
      pre.textContent = text;
      cellWrap.appendChild(pre);
      btn.textContent = 'Collapse';
    },

    saveTableFromModal() {
      const nameInput = document.getElementById('modal-table-name');
      const schemaInput = document.getElementById('modal-schema');
      const dataInput = document.getElementById('modal-data');
      const errorBox = document.getElementById('modal-error');

      const tableName = nameInput.value.trim();
      const schemaText = schemaInput.value.trim();
      const dataText = dataInput.value;
      const tableId = Renderer.modalTableId;

      const showError = (msg) => {
        errorBox.textContent = msg;
        errorBox.classList.remove('hidden');
      };

      if (!tableName) {
        showError('Table name is required.');
        return;
      }

      let columns = [];
      let rows = [];
      const warnings = [];
      let rawSchema = schemaText;
      let rawData = dataText;

      const existing = tableId ? State.workspace.tables.find(t => t.id === tableId) : null;

      try {
        if (schemaText) {
          const parsedSchema = Parser.parseSchemaInput(schemaText);
          columns = parsedSchema.columns;
          warnings.push(...parsedSchema.warnings);
        } else if (existing?.schema?.length) {
          columns = existing.schema.map(c => ({ ...c }));
          if (!rawSchema) rawSchema = existing.rawSchema || '';
          warnings.push('Schema not provided; keeping existing schema.');
        }

        let dataProvided = false;
        if (dataText.trim()) {
          dataProvided = true;
          const parsedData = Parser.parseDataInput(dataText, Renderer.modalMode);
          rows = parsedData.rows || [];
          warnings.push(...(parsedData.warnings || []));
        } else if (existing) {
          rows = existing.data || [];
          if (!rawData) rawData = existing.rawData || '';
        }

        if (!schemaText && !existing?.schema?.length && dataProvided && rows.length) {
          const inferred = Parser.inferSchemaFromData(rows);
          columns = inferred.columns;
          warnings.push(...inferred.warnings);
        } else if (columns.length && dataProvided) {
          warnings.push(...Parser.validateSchemaData(columns, rows));
        }

        if (!columns.length && !rows.length) {
          showError('Provide either schema or data to create a table.');
          return;
        }

        const tableObj = {
          id: existing ? existing.id : Utils.uid(),
          name: tableName,
          schema: columns,
          data: rows,
          rawSchema: rawSchema || '',
          rawData: rawData || '',
          warnings: [...new Set(warnings)]
        };

        if (existing) {
          const index = State.workspace.tables.findIndex(t => t.id === tableId);
          State.workspace.tables[index] = tableObj;
        } else {
          State.workspace.tables.push(tableObj);
        }

        State.selectedTableId = tableObj.id;
        State.tab = 'schema';
        State.dataView = { search: '', sortKey: null, sortDir: 'asc', page: 1, pageSize: 50 };
        State.save();
        Renderer.renderAll();
        Renderer.closeModal();
        Utils.toast(existing ? 'Table updated' : 'Table added');
      } catch (err) {
        showError(err.message);
      }
    },

    duplicateTable(id) {
      const table = State.workspace.tables.find(t => t.id === id);
      if (!table) return;

      const copy = {
        ...table,
        id: Utils.uid(),
        name: `${table.name}_copy`,
        schema: table.schema.map(c => ({ ...c })),
        data: JSON.parse(JSON.stringify(table.data || [])),
        rawSchema: table.rawSchema || '',
        rawData: table.rawData || '',
        warnings: [...(table.warnings || [])]
      };

      State.workspace.tables.push(copy);
      State.selectedTableId = copy.id;
      State.save();
      Renderer.renderAll();
      Utils.toast('Table duplicated');
    },

    deleteTable(id) {
      const table = State.workspace.tables.find(t => t.id === id);
      if (!table) return;

      Renderer.openConfirm(`Delete table "${table.name}"?`, () => {
        State.workspace.tables = State.workspace.tables.filter(t => t.id !== id);
        if (State.selectedTableId === id) {
          State.selectedTableId = State.workspace.tables[0]?.id || null;
        }
        State.save();
        Renderer.renderAll();
        Utils.toast('Table deleted');
      });
    },

    exportWorkspace() {
      const data = {
        version: 1,
        workspace: State.workspace
      };
      Utils.download('db-inspector-workspace.json', JSON.stringify(data, null, 2));
    },

    importWorkspaceFile(fileText) {
      let parsed;
      try {
        parsed = JSON.parse(fileText);
      } catch (e) {
        throw new Error(`Workspace JSON is invalid: ${e.message}`);
      }

      const workspace = parsed?.workspace;
      if (!workspace || !Array.isArray(workspace.tables)) {
        throw new Error('Workspace file is invalid: missing workspace.tables array');
      }

      workspace.tables.forEach(t => {
        if (!t.name || !Array.isArray(t.schema) || !Array.isArray(t.data)) {
          throw new Error('Workspace contains a table with invalid format');
        }
      });

      State.workspace = workspace;
      State.selectedTableId = workspace.tables[0]?.id || null;
      State.tab = 'schema';
      State.dataView = { search: '', sortKey: null, sortDir: 'asc', page: 1, pageSize: 50 };
      State.save();
      Renderer.renderAll();
      Utils.toast('Workspace imported');
    },

    promptWorkspaceFile() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
          try {
            this.importWorkspaceFile(reader.result);
          } catch (err) {
            Utils.toast(err.message, 'error');
          }
        };
        reader.readAsText(file);
      });
      input.click();
    },

    resetWorkspace() {
      State.workspace = defaultWorkspace();
      State.selectedTableId = State.workspace.tables[0]?.id || null;
      State.tab = 'schema';
      State.dataView = { search: '', sortKey: null, sortDir: 'asc', page: 1, pageSize: 50 };
      State.save();
      Renderer.renderAll();
      Utils.toast('Workspace reset to sample');
    },

    clearLocalData() {
      Storage.clear();
      State.workspace = defaultWorkspace();
      State.selectedTableId = State.workspace.tables[0]?.id || null;
      State.tab = 'schema';
      State.dataView = { search: '', sortKey: null, sortDir: 'asc', page: 1, pageSize: 50 };
      State.save();
      Renderer.renderAll();
      Utils.toast('Local data cleared');
    },

    generateQuery(queryType) {
      const table = State.selectedTable;
      if (!table) return;

      let sql = '';
      switch (queryType) {
        case 'selectAll':
          sql = SQLGenerator.selectAll(table);
          break;
        case 'selectWhere':
          sql = SQLGenerator.selectWhere(table);
          break;
        case 'insert':
          sql = SQLGenerator.insertStatement(table);
          break;
        case 'update':
          sql = SQLGenerator.updateStatement(table);
          break;
        case 'delete':
          sql = SQLGenerator.deleteStatement(table);
          break;
        case 'count':
          sql = SQLGenerator.count(table);
          break;
        case 'drop':
          sql = SQLGenerator.drop(table);
          break;
        case 'alter':
          sql = SQLGenerator.alter(table);
          break;
      }

      const ta = document.getElementById('query-output');
      if (ta) ta.value = sql;
    }
  };

  function applySettings() {
    document.body.classList.toggle('dark', State.settings.darkMode);
    document.body.classList.toggle('light', !State.settings.darkMode);
    document.body.classList.toggle('compact', State.settings.compact);
    document.body.classList.toggle('no-line-numbers', !State.settings.showLineNumbers);
  }

  document.addEventListener('DOMContentLoaded', () => App.init());
})();
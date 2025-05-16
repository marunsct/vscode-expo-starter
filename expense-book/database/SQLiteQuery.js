const SQLiteQuery = [
     `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT UNIQUE,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        gender TEXT,
        phone TEXT,
        country TEXT,
        profile_picture TEXT,
        date_of_birth TEXT,
        token TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS friends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER UNIQUE,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        phone TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS balance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER UNIQUE,
        name TEXT,
        image_url TEXT,
        user_name TEXT,
        currency TEXT,
        balance REAL
      );`,
      `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expenseId INTEGER UNIQUE,
        created_by INTEGER,
        amount REAL,
        currency TEXT,
        created_at TEXT,
        description TEXT,
        updated_at TEXT,
        split_method TEXT,
        FOREIGN KEY (created_by) REFERENCES users (userId)
      );`,
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT, -- 'add', 'update', 'delete'
        entity TEXT, -- e.g., 'expense', 'friend'
        url TEXT, -- URL for the API endpoint
        options TEXT, -- JSON string of the request options with headers and body
        created_at TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        groupId INTEGER UNIQUE,
        created_by INTEGER,
        currency TEXT,
        name TEXT,
        image_url TEXT,
        FOREIGN KEY (created_by) REFERENCES users (userId)
      );`,
      `CREATE TABLE IF NOT EXISTS group_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        groupId INTEGER,    -- foreign key to groups table
        userId INTEGER,
        first_name TEXT,
        last_name TEXT,
        username TEXT,
        created_by INTEGER,
        joined_at TEXT, -- timestamp
        FOREIGN KEY (created_by) REFERENCES users (userId),
        FOREIGN KEY (groupId) REFERENCES groups (id),
        FOREIGN KEY (userId) REFERENCES friends (userId)
      );`,
];

export default SQLiteQuery;
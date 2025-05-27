const SQLiteQuery = [
  `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER UNIQUE,
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
        phone TEXT,
        profile_picture TEXT
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
        description TEXT,
        amount REAL,
        currency TEXT,
        groupId INTEGER, -- foreign key to groups 
        split_method TEXT,
        paid_by INTEGER,  -- foreign key to users table
        image_url TEXT,
        is_settled BOOLEAN DEFAULT 0,
        created_by INTEGER, -- foreign key to users table
        created_at TEXT,
        updated_by INTEGER, -- foreign key to users table
        updated_at TEXT,
        is_deleted BOOLEAN DEFAULT 0,
        deleted_at TEXT,  
        FOREIGN KEY (created_by) REFERENCES users (userId),
        FOREIGN KEY (updated_by) REFERENCES users (userId),
        FOREIGN KEY (paid_by) REFERENCES users (userId),
        FOREIGN KEY (groupId) REFERENCES groups (groupId)
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
        currency TEXT,
        name TEXT,
        image_url TEXT,
        is_deleted BOOLEAN DEFAULT 0,
        deleted_at TEXT,
        created_at TEXT,
        created_by INTEGER, -- foreign key to users table
        updated_at TEXT,
        updated_by INTEGER,
        FOREIGN KEY (updated_by) REFERENCES users (userId), -- foreign key to users table
        FOREIGN KEY (created_by) REFERENCES users (userId)
      );`,
  `CREATE TABLE IF NOT EXISTS group_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id INTEGER UNIQUE,
        groupId INTEGER,    -- foreign key to groups table
        userId INTEGER, -- foreign key to users table
        first_name TEXT,
        last_name TEXT,
        username TEXT,
        email TEXT,
        phone TEXT,
        created_by INTEGER,
        joined_at TEXT, -- timestamp
        is_deleted BOOLEAN DEFAULT 0,
        deleted_at TEXT,
        FOREIGN KEY (created_by) REFERENCES users (userId),
        FOREIGN KEY (groupId) REFERENCES groups (id),
        FOREIGN KEY (userId) REFERENCES friends (userId)
      );`,

  `CREATE TABLE IF NOT EXISTS expense_splits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        split_id INTEGER UNIQUE,
        expenseId INTEGER, -- foreign key to expenses table
        userId INTEGER,-- foreign key to users table
        paid_to_user INTEGER,-- foreign key to users table
        amount REAL,
        counter REAL,
        is_settled BOOLEAN DEFAULT 0,
        created_at TEXT,
        created_by INTEGER, -- foreign key to users table
        updated_at TEXT,
        updated_by INTEGER, -- foreign key to users table
        is_deleted BOOLEAN DEFAULT 0,
        deleted_at TEXT,
        FOREIGN KEY (expenseId) REFERENCES expenses (expenseId),
        FOREIGN KEY (created_by) REFERENCES users (userId),
        FOREIGN KEY (userId) REFERENCES users (userId),
        FOREIGN KEY (paid_to_user) REFERENCES users (userId), -- foreign key to users table
        FOREIGN KEY (updated_by) REFERENCES users (userId)
      );`,
];

export default SQLiteQuery;

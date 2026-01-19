import { getDb } from 'coze-coding-dev-sdk';
import bcrypt from 'bcryptjs';

async function initDb() {
  try {
    console.log('Starting database initialization...');

    const db = await getDb();

    // 检查是否已存在admin用户
    const existingAdmin = await db.execute(
      "SELECT * FROM users WHERE email = 'admin@mentobai.com'"
    );

    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists');
      console.log('User:', {
        id: existingAdmin.rows[0].id,
        username: existingAdmin.rows[0].username,
        email: existingAdmin.rows[0].email,
      });
      return;
    }

    // 哈希密码
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    console.log('Password hashed successfully');

    // 插入admin用户
    console.log('Creating admin user...');
    const result = await db.execute(
      `INSERT INTO users (id, username, email, password, is_active, created_at)
       VALUES (gen_random_uuid(), 'admin', 'admin@mentobai.com', '${hashedPassword}', true, NOW())
       RETURNING id, username, email`
    );

    console.log('Admin user created successfully!');
    console.log('Credentials:');
    console.log('  Email: admin@mentobai.com');
    console.log('  Password: Admin123!');
    console.log('User ID:', result.rows[0].id);

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// 运行初始化
initDb()
  .then(() => {
    console.log('Database initialization completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });

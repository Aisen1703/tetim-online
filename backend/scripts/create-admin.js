const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const pool = require('../src/db');

dotenv.config();

async function main() {
  const email = 'admin@tetim.ru';
  const password = 'admin123';
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

  if (existing.rows.length) {
    console.log('Админ уже существует');
    process.exit(0);
  }

  const result = await pool.query(
    `INSERT INTO users (name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role`,
    ['Администратор', email, '+79990000000', passwordHash, 'admin']
  );

  console.log('Админ создан:', result.rows[0]);
  console.log('Логин: admin@tetim.ru');
  console.log('Пароль: admin123');
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
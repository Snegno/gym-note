import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

// Инициализация SQLite (файл создастся автоматически)
const db = new Database('database.sqlite');

// Создаём таблицу (если её нет)
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS day_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    exercise_description TEXT NOT NULL,
    weight INTEGER,
    count INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
    FOREIGN KEY (exercise_id) REFERENCES exercises(id),
    UNIQUE (day_id, exercise_id)
 )
`).run();

const app = express();
app.use(cors()); // Разрешаем CORS для фронтенда
app.use(express.json()); // Для парсинга JSON-тела запросов

// удаление базы
if (process.env.RESET_DB === 'true') {
  fs.unlinkSync(process.env.DB_PATH);
  console.log('База данных удалена');
  // Удалите переменную после использования
}

// todo эндпоинты

// РЕГИСТРАЦИЯ
app.post('/api/register', (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ error: 'Имя и пароль обязательны' });
  }

  try {
    const exists = db.prepare('SELECT 1 FROM users WHERE name = ?').get(name);
    if (exists) {
      return res.status(409).json({ error: 'Имя уже занято' });
    }

    const result = db.prepare(`
      INSERT INTO users (name, password) 
      VALUES (?, ?)
    `).run(name, password);

    res.status(201).json({
      id: result.lastInsertRowid,
      name
    });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// FETCH USERS
app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  res.json(users);
});

// LOGIN
app.post('/api/login', (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ error: 'Укажите имя и пароль' });
  }

  try {
    // Ищем пользователя в БД
    const user = db.prepare(`
      SELECT id, name FROM users 
      WHERE name = ? AND password = ?
    `).get(name, password);

    if (!user) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    res.json(user);
  } catch (err) {
    console.error('Ошибка при входе:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


// todo Exercises endpoint

// todo Добавление и Обновление упражнения
app.post('/api/exercises', (req, res) => {
  const { id, user_id, description } = req.body;

  // Валидация
  if (!user_id || !description) {
    return res.status(400).json({ error: 'user_id и description обязательны' });
  }

  try {
    if (id) {
      // Обновление существующей записи
      const result = db.prepare(`
        UPDATE exercises 
        SET description = ? 
        WHERE id = ? AND user_id = ?
      `).run(description, id, user_id);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Упражнение не найдено' });
      }

      return res.json({
        id,
        description,
        message: 'Упражнение обновлено'
      });
    } else {
      // Создание новой записи
      const result = db.prepare(`
        INSERT INTO exercises (user_id, description)
        VALUES (?, ?)
      `).run(user_id, description);

      return res.json({
        id: result.lastInsertRowid,
        description,
        message: 'Упражнение создано'
      });
    }
  } catch (err) {
    console.error('Ошибка базы данных:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// todo Получение упражнений пользователя
app.get('/api/exercises/:user_id', (req, res) => {
  const { user_id } = req.params;

  try {
    const exercises = db.prepare(`
      SELECT id, description 
      FROM exercises
      WHERE user_id = ?
    `).all(user_id);

    res.json(exercises);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// todo Удаление упражнения
app.delete('/api/exercises/:id', (req, res) => {
  const { id } = req.params;
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'Необходим user_id' });
  }

  try {
    // 1. Проверяем, используется ли упражнение в day_exercises
    const usedInDays = db.prepare(`
      SELECT 1 FROM day_exercises 
      WHERE exercise_id = ? AND user_id = ?
      LIMIT 1
    `).get(id, user_id);

    if (usedInDays) {
      return res.status(409).json({
        error: 'Нельзя удалить: упражнение используется в программе тренировок',
        solution: 'Сначала удалите все упоминания из day_exercises'
      });
    }

    // 2. Если не используется - удаляем
    const result = db.prepare(`
      DELETE FROM exercises 
      WHERE id = ? AND user_id = ?
    `).run(id, user_id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Упражнение не найдено' });
    }

    res.json({
      success: true,
      message: 'Упражнение удалено'
    });

  } catch (err) {
    console.error('Ошибка удаления:', err);
    res.status(500).json({
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
});

// todo: Day Exercises

app.post('/api/day_exercises', (req, res) => {
  const {
    day_id,
    user_id,
    exercise_id,
    exercise_description,
    weight,
    count,
    is_update = false // Флаг, указывающий, что это обновление
  } = req.body;

  // Валидация
  if (!day_id === undefined || !day_id === null || !user_id || (!exercise_id && !exercise_description)) {
    console.log({day_id, exercise_id, exercise_description});
    return res.status(400).json({
      error: 'Обязательные поля: day_id, user_id и (exercise_id ИЛИ exercise_description)'
    });
  }

  // Если exercise_id передан, проверяем дубликаты (кроме случая, когда это обновление)
  if (exercise_id && !is_update) {
    const existing = db.prepare(`
        SELECT 1 FROM day_exercises
        WHERE day_id = ? AND exercise_id = ? AND user_id = ?
    `).get(day_id, exercise_id, user_id);

    if (existing) {
      return res.status(409).json({
        error: 'Это упражнение уже добавлено в данный день'
      });
    }
  }

  try {
    // Если is_update = true, пробуем обновить существующую запись
    if (is_update) {
      if (!exercise_id) {
        return res.status(400).json({ error: 'Для обновления exercise_id обязателен' });
      }

      const result = db.prepare(`
          UPDATE day_exercises
          SET
              exercise_description = ?,
              weight = ?,
              count = ?
          WHERE day_id = ? AND exercise_id = ? AND user_id = ?
      `).run(
        exercise_description || 'Без названия',
        weight ?? null,
        count ?? null,
        day_id,
        exercise_id,
        user_id
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Запись не найдена' });
      }

      return res.json({
        day_id,
        exercise_id,
        exercise_description,
        weight,
        count
      });
    }
    // Иначе создаем новую запись
    else {
      const result = db.prepare(`
        INSERT INTO day_exercises (
          day_id,
          user_id,
          exercise_id,
          exercise_description,
          weight,
          count
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        day_id,
        user_id,
        exercise_id || null,
        exercise_description || 'Без названия',
        weight ?? null,
        count ?? null
      );

      return res.json({
        id: result.lastInsertRowid,
        day_id,
        exercise_id,
        exercise_description,
        weight,
        count
      });
    }
  } catch (err) {
    console.error('Ошибка базы данных:', err);
    res.status(500).json({
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
});

// получения упражнений по дню
app.get('/api/day_exercises/:day_id', (req, res) => {
  const day_id = parseInt(req.params.day_id);
  const user_id = parseInt(req.query.user_id);

  if (!user_id) {
    return res.status(400).json({ error: 'user_id обязателен' });
  }

  try {
    const exercises = db.prepare(`
      SELECT 
        de.id,
        de.day_id,
        de.exercise_id,
        de.exercise_description,
        de.weight,
        de.count,
        e.description as base_exercise_description
      FROM day_exercises de
      LEFT JOIN exercises e ON de.exercise_id = e.id
      WHERE de.day_id = ? AND de.user_id = ?
      ORDER BY de.id
    `).all(day_id, user_id);

    res.json(exercises);
  } catch (err) {
    console.error('Ошибка базы данных:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


//todo эндпоинт удаления упражнения из дня
app.delete('/api/day_exercises/:exercise_id', (req, res) => {
  const exercise_id = parseInt(req.params.exercise_id);
  const user_id = parseInt(req.query.user_id);
  const day_id = parseInt(req.query.day_id);

  console.log({ exercise_id, user_id, day_id });
  // Валидация
  if (!exercise_id || !user_id) {
    return res.status(400).json({
      error: 'Обязательные параметры: exercise_id, user_id и day_id'
    });
  }

  console.log(`Deleting exercise with exercise_id: ${exercise_id}, user_id: ${user_id}, day_id: ${day_id}`);


  try {
    // Удаляем только если совпадает и day_id и user_id
    const result = db.prepare(`
      DELETE FROM day_exercises
      WHERE exercise_id = ? AND user_id = ? AND day_id = ?
    `).run(exercise_id, user_id, day_id);

    if (result.changes === 0) {
      return res.status(404).json({
        error: 'Упражнение не найдено или нет прав доступа'
      });
    }

    res.json({
      success: true,
      message: `Упражнение удалено из дня ${day_id}`
    });
  } catch (err) {
    console.error('Ошибка удаления:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// todo конец эндпоинтов

app.listen(3001, () => {
  console.log('Server running on port 3001')
})

// Экспортируем app для vite-plugin-express
export default app;

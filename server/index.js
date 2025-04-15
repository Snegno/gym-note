import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Инициализация Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

const app = express();

app.use(cors({
  origin: true, // Автоматически разрешает текущий origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Если используете аутентификацию
}));

app.use(express.json()); // Для парсинга JSON-тела запросов

// Явно обрабатываем OPTIONS-запросы для всех роутов
//app.options('*', cors());


// todo эндпоинты

// wake-up for render
app.get('/api/ping', (req, res) => {
  res.json({ status: 'awake', timestamp: new Date().toISOString() });
});

//

// РЕГИСТРАЦИЯ
app.post('/api/register', async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ error: 'Имя и пароль обязательны' });
  }

  try {
    // Проверка существующего пользователя
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('name', name)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Имя уже занято' });
    }

    // Создание пользователя
    const { data: user, error } = await supabase
      .from('users')
      .insert([{ name, password }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(user);
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


// FETCH USERS
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ error: 'Укажите имя и пароль' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name')
      .eq('name', name)
      .eq('password', password)
      .single();

    if (error || !user) {
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

app.post('/api/exercises', async (req, res) => {
  const { id, user_id, description } = req.body;

  if (!user_id || !description) {
    return res.status(400).json({ error: 'user_id и description обязательны' });
  }

  try {
    if (id) {
      // Обновление
      const { data, error } = await supabase
        .from('exercises')
        .update({ description })
        .eq('id', id)
        .eq('user_id', user_id)
        .select()
        .single();

      if (error) throw error;
      res.json({ ...data, message: 'Упражнение обновлено' });
    } else {
      // Создание
      const { data, error } = await supabase
        .from('exercises')
        .insert([{ user_id, description }])
        .select()
        .single();

      if (error) throw error;
      res.json({ ...data, message: 'Упражнение создано' });
    }
  } catch (err) {
    console.error('Ошибка:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// todo Получение упражнений пользователя
app.get('/api/exercises/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('id, description')
      .eq('user_id', user_id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Ошибка:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// todo Удаление упражнения
app.delete('/api/exercises/:id', async (req, res) => {
  const { id } = req.params;
  const user_id = parseInt(req.query.user_id);

  if (!user_id) {
    return res.status(400).json({ error: 'Необходим user_id' });
  }

  try {
    // 1. Проверка использования в day_exercises
    const { data: usedInDays } = await supabase
      .from('day_exercises')
      .select('id')
      .eq('exercise_id', id)
      .eq('user_id', user_id)
      .limit(1);

    if (usedInDays && usedInDays.length > 0) {
      return res.status(409).json({
        error: 'Нельзя удалить: упражнение используется в программе тренировок',
        solution: 'Сначала удалите все упоминания из day_exercises'
      });
    }

    // 2. Удаление упражнения
    const { error, count } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Упражнение удалено'
    });
  } catch (err) {
    console.error('Ошибка:', err);
    res.status(500).json({
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
});

// todo: Day Exercises

// создание-обновление упражнения по дню
app.post('/api/day_exercises', async (req, res) => {
  const {
    day_id,
    user_id,
    exercise_id,
    exercise_description,
    weight,
    count,
    is_update = false
  } = req.body;

  // Валидация
  if (day_id === undefined || day_id === null || !user_id || (!exercise_id && !exercise_description)) {
    return res.status(400).json({
      error: 'Обязательные поля: day_id, user_id и (exercise_id ИЛИ exercise_description)'
    });
  }

  try {
    if (is_update) {
      // Обновление существующей записи
      if (!exercise_id) {
        return res.status(400).json({ error: 'Для обновления exercise_id обязателен' });
      }

      const { data, error } = await supabase
        .from('day_exercises')
        .update({
          exercise_description: exercise_description || 'Без названия',
          weight: weight ?? null,
          count: count ?? null
        })
        .eq('day_id', day_id)
        .eq('exercise_id', exercise_id)
        .eq('user_id', user_id)
        .select();

      if (error) throw error;
      res.json(data[0]);
    } else {
      // Создание новой записи
      // Проверка дубликатов
      if (exercise_id) {
        const { data: existing } = await supabase
          .from('day_exercises')
          .select('id')
          .eq('day_id', day_id)
          .eq('exercise_id', exercise_id)
          .eq('user_id', user_id)
          .limit(1);

        if (existing && existing.length > 0) {
          return res.status(409).json({
            error: 'Это упражнение уже добавлено в данный день'
          });
        }
      }

      const { data, error } = await supabase
        .from('day_exercises')
        .insert([{
          day_id,
          user_id,
          exercise_id: exercise_id || null,
          exercise_description: exercise_description || 'Без названия',
          weight: weight ?? null,
          count: count ?? null
        }])
        .select();

      if (error) throw error;
      res.json(data[0]);
    }
  } catch (err) {
    console.error('Ошибка:', err);
    res.status(500).json({
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
});

// получения упражнений по дню
app.get('/api/day_exercises/:day_id', async (req, res) => {
  const day_id = parseInt(req.params.day_id);
  const user_id = parseInt(req.query.user_id);

  if (!user_id) {
    return res.status(400).json({ error: 'user_id обязателен' });
  }

  try {
    const { data, error } = await supabase
      .from('day_exercises')
      .select(`
        id,
        day_id,
        exercise_id,
        exercise_description,
        weight,
        count,
        exercises!inner(description)
      `)
      .eq('day_id', day_id)
      .eq('user_id', user_id)
      .order('id', { ascending: true });

    if (error) throw error;

    const formattedData = data.map(item => ({
      ...item,
      base_exercise_description: item.exercises.description
    }));

    res.json(formattedData);
  } catch (err) {
    console.error('Ошибка:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


//todo эндпоинт удаления упражнения из дня
app.delete('/api/day_exercises/:exercise_id', async (req, res) => {
  const exercise_id = parseInt(req.params.exercise_id);
  const user_id = parseInt(req.query.user_id);
  const day_id = parseInt(req.query.day_id);

  if (!exercise_id || !user_id) {
    return res.status(400).json({
      error: 'Обязательные параметры: exercise_id, user_id и day_id'
    });
  }

  try {
    const { error, count } = await supabase
      .from('day_exercises')
      .delete()
      .eq('exercise_id', exercise_id)
      .eq('user_id', user_id)
      .eq('day_id', day_id);

    if (error) throw error;

    res.json({
      success: true,
      message: `Упражнение удалено из дня ${day_id}`
    });
  } catch (err) {
    console.error('Ошибка:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// todo конец эндпоинтов

app.listen(3001, () => {
  console.log('Server running on port 3001')
})

// Экспортируем app для vite-plugin-express
export default app;

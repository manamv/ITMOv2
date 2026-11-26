# Согласованный контракт (API & Data Contract)

* **Статус:** `APPROVED`
* **Фреймворк:** Spec-Kit (SDD)
* **Проект:** LinguaType (Практика 8)
* **Версия контракта:** 1.0.0

---

## 1. Negotiation Log (Согласование Команды UI и Команды Логики)

В процессе проектирования взаимодействия клиентской части (React 19) и серверной части (C# ASP.NET Core Minimal API) согласованы следующие архитектурные решения:

1. **Соглашение об именовании полей (`camelCase`):**
   * *Логика:* В C# традиционно используется `PascalCase` для свойств C#-классов (`TopicId`, `Wpm`, `Accuracy`).
   * *UI:* В JavaScript / TypeScript и JSON стандартом является `camelCase` (`topicId`, `wpm`, `accuracy`).
   * *Решение:* На уровне сериализации ASP.NET Core включен camelCase naming policy, обеспечивая типобезопасный DTO-контракт на клиенте.

2. **Защита от повторной отправки (Double-Submit & Idempotency):**
   * *Проблема:* Случайный double-click по кнопке «Следующий урок» или повторное нажатие `Enter` во время сохранения сессии может создать дубликаты записей в статистике.
   * *Решение:*
     - Клиент блокирует UI (`disabled={isSubmitting}`) и включает внутренний флаг `submitLockRef`.
     - Сервер при повторном запросе гарантирует идемпотентность и возвращает `201 Created` / `200 OK` с уникальным `recordId`.
     - На клиенте реализован обязательный тест (`doubleSubmit.test.tsx`), проверяющий отсутствие второго HTTP-вызова.

3. **Формат ошибок сервера (RFC 7807 compatible):**
   * Все ошибки возвращают JSON вида `{ "error": "Описание проблемы для пользователя" }` со статусами 400 (Bad Request), 404 (Not Found) или 500 (Internal Server Error).

---

## 2. Спецификация REST API (OpenAPI 3.1)

### 2.1. Получение тем грамматики
* **Метод:** `GET /api/topics`
* **Query параметры:**
  * `level` (optional, string): Фильтр по CEFR уровню (`A1`, `A2`, `B1`, `B2`, `C1`).
* **Ответ `200 OK`:**
```json
[
  {
    "id": "pres-perf",
    "title": "present perfect vs past simple",
    "level": "B1",
    "description": "разница между результатом в настоящем и завершенным действием в прошлом",
    "sentenceCount": 5
  }
]
```

### 2.2. Получение предложений урока
* **Метод:** `GET /api/lessons/{topicId}`
* **Ответ `200 OK`:**
```json
{
  "id": "pres-perf",
  "title": "Present Perfect vs Past Simple",
  "level": "B1",
  "description": "Отработка временных маркеров already, yet, yesterday, last week.",
  "sentences": [
    {
      "id": "s1",
      "english": "She has already completed this difficult report on time.",
      "russian": "Она уже завершила этот сложный отчёт вовремя.",
      "grammarTip": "already указывает на результат действия к настоящему моменту"
    }
  ]
}
```
* **Ответ `404 Not Found`:**
```json
{ "error": "Topic 'unknown' not found." }
```

### 2.3. Адаптивная генерация урока по слабым клавишам
* **Метод:** `GET /api/adaptive/weak-keys`
* **Query параметры:**
  * `keys` (required, string): Список проблемных букв через запятую, например `keys=r,t,p`.
* **Ответ `200 OK`:**
```json
{
  "id": "adaptive-weak-keys",
  "title": "Адаптивная тренировка слабых букв: [R, T, P]",
  "level": "Adaptive",
  "description": "Фразы с максимальной плотностью проблемных букв.",
  "sentences": [ ... ]
}
```

### 2.4. Сохранение статистики сессии
* **Метод:** `POST /api/stats`
* **Тело запроса:**
```json
{
  "topicId": "pres-perf",
  "wpm": 72.0,
  "accuracy": 98.2,
  "errors": 1,
  "durationSeconds": 102,
  "weakKeys": ["p", "r"]
}
```
* **Ответ `201 Created`:**
```json
{
  "success": true,
  "recordId": "rec-a81f3b",
  "message": "Статистика успешно сохранена в профиле."
}
```

### 2.5. Личный словарь трудных слов
* **`GET /api/vocabulary`** $\rightarrow$ список сохраненных слов с транскрипцией и аудио.
* **`POST /api/vocabulary`** $\rightarrow$ добавление слова (валидация: слово и перевод обязательны).
* **`DELETE /api/vocabulary/{id}`** $\rightarrow$ удаление слова из словаря (`204 No Content`).

### 2.6. Лидерборд скоропечатания
* **`GET /api/leaderboard?level={level}`** $\rightarrow$ получение топа результатов, отсортированных по WPM и точности.
* **`POST /api/leaderboard`** $\rightarrow$ публикация рекорда:
  * Тело: `{ "userName": "string", "wpm": number, "accuracy": number, "topicTitle": "string", "level": "string" }`
  * Валидация: `userName` $\ge 2$ символов, $WPM > 0, 0 \le Accuracy \le 100$.
  * Ответ `201 Created` с объектом `LeaderboardEntry`.

### 2.7. Музыкальные видео-уроки и печать по тексту песен
* **`GET /api/music-lessons`** $\rightarrow$ список доступных песен и клипов с грамматическим фокусом (Queen, Coldplay, The Beatles).
* **`GET /api/music-lessons/{id}`** $\rightarrow$ детальная модель урока:
  * `videoUrl` и `thumbnailUrl` для видеоплеера;
  * `subtitles`: массив строк субтитров с временными метками `startSeconds` и `endSeconds`;
  * `grammarBreakdown`: разбор языковых конструкций песни с цитатами и правилами;
  * `typingSentences`: массив строк текста песни без заглавных букв и знаков препинания для тренажера слепой печати.

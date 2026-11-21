# Документация макета и вклад AI (Практика 8)

* **Ссылка на макет в Figma / FigJam:** [Открыть макет LinguaType в Figma](https://www.figma.com/board/2rQa19fNwGGx5Grvy2Cfxc/Untitled?node-id=1002-2&t=090G2HefWTLwkSsr-1)

## 1. Описание основного пользовательского сценария

* **Пользователь**: изучающий английский язык, желающий одновременно освоить слепую печать (десятипальцевый метод) и закрепить грамматические структуры языка.
* **Задача**:
  1. Выбрать уровень языка (A1–C2) и интересующую тему грамматики (например, *Past Simple vs Present Perfect* или тренировка слабых букв *Weak Keys*).
  2. Пройти интерактивный сеанс набора текста: виртуальная клавиатура подсвечивает нужные клавиши и зоны пальцев, робот-диктор озвучивает правильное произношение предложений, а по клику на незнакомое слово открывается перевод и транскрипция.
  3. Отправить результаты сеанса на сервер (или проверить перевод фразы через AI-анализатор грамматики) без риска повторного запроса (double-submit protection).
  4. Получить экран итоговой статистики: скорость (WPM), точность (%), список допущенных опечаток, обновление тепловой карты клавиатуры (Heatmap) и автоматическое сохранение трудных слов в личный словарь.
* **Результат**: пользователь видит измеримый прогресс скорости и точности, видит свои слабые клавиши и закрепляет правильную грамматику.

---

## 2. Использованные AI-инструменты и промпты

### Промпт 1: Концепт и дизайн-система (v0 / AI UI Generator)
```text
Role: Senior UI/UX Designer & Frontend Architect.
Goal: Design an ultra-sleek, modern dark-mode web application called "LinguaType" for blind touch-typing practice combined with English grammar mastery (levels A1-C2).
Aesthetics: Cyber-minimalism inspired by Monkeytype and Linear. Deep charcoal/slate background (#0d1117, #161b22), clean typography (JetBrains Mono for typing/code, Inter for UI), subtle glows.
Key UI Elements required:
1. Header: Logo, level selector (A1-C2 badges), streak counter, navigation tabs (Practice, Vocabulary, Statistics).
2. Active Typing Area: Large readable sentence with letter-by-letter status (typed, current with animated caret, remaining, errors highlighted in ruby-red).
3. Audio TTS button with wave animation.
4. Word translation popover showing phonetic IPA, Russian definition, and "Add to vocabulary" star.
5. Interactive QWERTY Virtual Keyboard:
   - Color-coded into 8 distinct finger zones (Left Pinky, Ring, Middle, Index; Right Index, Middle, Ring, Pinky; Thumbs for Space).
   - Real-time key highlight with glowing finger indicator.
6. Real-time metric pills: WPM, Accuracy %, Time left.
```

### Промпт 2: Генерация обязательных состояний интерфейса
```text
Generate complete UI layouts for all 5 mandatory states of the core scenario:
1. Default / Empty State: Level picker, grammar topic cards, weak-keys recommendation banner, empty stats placeholder when no history exists.
2. Active Input State: Typing in progress, live caret, keyboard finger highlight active, instant word translation tooltip open.
3. Loading State: Skeleton cards for lessons, pulsing progress bar, "AI analyzing grammar..." spinner.
4. Success / Result State: Large WPM display, Accuracy circle, mistake review list, keyboard heatmap preview, "Next Exercise" button.
5. Error State: Network disconnection banner, descriptive error message, "Try again" retry button with focus outline.
```

---

## 3. Что предложил AI vs Что было доработано вручную

| Компонент / Экран | Предложение AI | Ручная доработка и улучшение |
|---|---|---|
| **Виртуальная клавиатура** | Стандартная плоская клавиатура с подсветкой только нажатой кнопки. | Добавлена **система 8 цветовых зон пальцев** с подсказкой названия пальца над клавиатурой (например: *«Левый указательный палец»*), что критично для методики слепой печати. |
| **Озвучка (TTS)** | Предложено использовать сторонний платный API (ElevenLabs). | Интегрирован **нативный Web Speech API** с fallback на аудиозаписи носителей языка из Dictionary API, что обеспечивает нулевую задержку, бесплатность и работу оффлайн. |
| **Словарь и адаптивность** | Простой список слов в модалке. | Реализован **автоматический трекинг слабых клавиш (Weak Keys)**: система запоминает опечатки, строит тепловую карту (Heatmap) и генерирует тренировки с упором на проблемные буквы. |
| **Доступность (a11y)** | Красивые кастомные `div`-кнопки без ARIA и фокусов. | Переведено на семантические теги (`<button>`, `<label>`), добавлены четкие кольца фокуса `focus-visible:ring-2`, поддержка управления целиком с клавиатуры (Tab, Enter, Space, Escape для паузы). |
| **Защита от повторной отправки** | Обычная кнопка "Отправить" с обработчиком `onClick`. | Реализован строгий флаг `isSubmitting`, атрибут `disabled` и блокировка повторного нажатия Enter во время ожидания ответа сервера. |
| **Режим набора и эргономика** | Блокировка ввода на месте опечатки, смешанный регистр и знаки препинания, тексты разной длины. | 1) Добавлен **высокоточный секундомер предложений** (`MM:SS.s`).<br>2) Тексты стандартизированы **строго по 3 строки в высоту** (~150 символов), исключены заглавные буквы и пунктуация для фокусировки на непрерывном слепом наборе.<br>3) **Мягкое продвижение на опечатках:** неверная буква загорается ярко-красным, печать идёт дальше, а пользователь самостоятельно стирает ошибки клавишей `Backspace ⌫` для завершения предложения.<br>4) Исправлен вертикальный клиппинг нижней строки с запасом под нижние выносные элементы букв (p, y, g, q, j). |
| **Визуализация пальцев (Blind Typing)** | Отсутствовало изображение рук. | Добавлен **интерактивный визуализатор рук (`HandsVisualizer`)**: две руки (10 пальцев) в исходной позиции ASDF / JKL;, при наборе активный палец анимированно приподнимается, подсвечивается неоновым цветом зоны и показывает целевой символ на подушечке (аналог blindtyping.com). |
| **Лидерборд (Соревновательность)** | Отсутствовал рейтинг пользователей. | Разработан **полноценный Лидерборд** (`LeaderboardView`): подиум топ-3 чемпионов (золото, серебро, бронза), фильтрация по уровням, таблица всех участников, форма сохранения рекорда с защитой от повторного нажатия и REST API (`/api/leaderboard`). |

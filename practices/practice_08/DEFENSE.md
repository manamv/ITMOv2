# Подготовка к защите 8 — интерфейс LinguaType (12 баллов)

Оценка начисляется **по каждому разделу отдельно**: макет — 3, библиотека компонентов — 1, интерфейс — 3, тестирование — 5 (проходят **все** 36 тестов).
Исходный код, Docker и тесты лежат в отдельном репозитории [`manamv/linguatype`](https://github.com/manamv/linguatype) (`D:\linguatype`), а здесь собраны макет, скриншоты, спецификации и [`Makefile`](./Makefile).

## 0. Что открыть до начала показа (3 минуты)

1. Запустить приложение в Docker (`make up` из этой папки или `docker compose up -d --build` в `D:\linguatype`) и проверить `make smoke`.
2. Открыть 4 вкладки браузера:
   - `http://localhost:8080` — живое приложение (с C# .NET 10 API);
   - [Редактируемый макет в Figma Design](https://www.figma.com/design/dYHPWWFFS32L5aauUlI8Rw) + [Доску сценария в FigJam](https://www.figma.com/board/2rQa19fNwGGx5Grvy2Cfxc/Untitled?node-id=1009-56);
   - Локальный прототип [`design/mockup.html`](./design/mockup.html);
   - Репозиторий [`github.com/manamv/linguatype`](https://github.com/manamv/linguatype) и вкладку Actions (зелёный CI/CD).
3. В терминале подготовить `make test` (36 / 36 клиентских тестов Vitest + React Testing Library).

## 1. Сценарий показа по 4 блокам критериев

| Блок | Что показываю на экране | Что говорю ревьюверу |
|---|---|---|
| **Макет и вклад AI (3 б.)** | Figma Design (`dYHPWWFFS32L5aauUlI8Rw`), FigJam и `design/mockup.html` | Показываю 6 редактируемых экранов тёмной темы и [`design/PROMPTS_AND_AI_CONTRIBUTION.md`](./design/PROMPTS_AND_AI_CONTRIBUTION.md): что предложил AI (базовая сетка, темы, тесты) и что исправлено после ревью (убран бейдж `AI PRO`, Bento-меню, порядок `Печать → Статистика → Тест`, точная синхронизация караоке, двойной разбор ошибок). |
| **Библиотека компонентов (1 б.)** | Компоненты в `D:\linguatype\frontend\src\components\ui\` + `index.css` | Библиотека **shadcn/ui** + Tailwind CSS v4 + Lucide React (`Button`, `Card`, `Badge`, `Modal`). Единые токены цветов (`#0b0f17`, Emerald, Cyan) и шрифтов (`Inter`, `JetBrains Mono`) заданы в `src/index.css`. |
| **Интерфейс и сценарий (3 б.)** | Живое приложение на `http://localhost:8080` + скриншоты [`design/screenshots/`](./design/screenshots/) | 1) Выбираю тему в Bento-меню → печатаю 3 строки с 8 зонами пальцев и озвучкой → вижу статистику с хлопушками/салютом → прохожу квиз с двойным разбором → результат уходит в C# API (`/api/stats`).<br>2) Вкладка **Словарь**: ввод русских букв в форму → сообщение об ошибке валидации; отправка с блокировкой кнопки (`disabled={isSubmitting}`).<br>3) Доступность: проход по кнопкам через `Tab` (видимый `focus-visible:ring-2`).<br>4) Состояния **Empty** (поиск несуществующей темы), **Loading** и **Error + Retry** (живьём + скриншоты). |
| **Тестирование с AI (5 б.)** | Запуск `make test` + файлы в `D:\linguatype\frontend\src\tests\` | Все **36 / 36** тестов проходят (`5` файлов):<br>• `doubleSubmit.test.tsx` (2) — повторный клик/Enter не создаёт 2-й запрос;<br>• `componentsAndInteractions.test.tsx` (25) — клики, 8 зон, поповеры, двойной разбор квиза;<br>• `formValidation.test.tsx` (4) — обязательные поля, запрет неанглийских букв;<br>• `uiStates.test.tsx` (4) — моки `fetch` для Loading, Empty, Success и 500 Error;<br>• `endToEndScenario.test.tsx` (1) — сквозной сценарий от выбора темы до табло и квиза. |

## 2. Готовые команды (`Makefile`)

```bash
make up          # поднять Docker Compose (frontend :8080 + backend :5000)
make smoke       # проверить HTTP 200 на главной и API (/api/topics, /api/stats, /api/music-lessons)
make test        # прогнать все 36 клиентских тестов Vitest
make build       # проверить TypeScript + Vite production build
make demo-hint   # краткая шпаргалка перед показом
```

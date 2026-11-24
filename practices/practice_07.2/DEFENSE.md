# Подготовка к защите 7.2 — классификация Issues и еженедельный отчёт (16 баллов)

Каждый критерий проверяется **реальным запуском**, баллы идут по порядку (следующий засчитывается, только если засчитан предыдущий).
Все команды — готовые цели из [`Makefile`](./Makefile).

## 0. Перед защитой (чек-лист, 10 минут)

| # | Что сделать | Проверка |
|---|---|---|
| 1 | Импортировать в n8n по порядку: 1) [`subworkflow_classifier.json`](./subworkflow_classifier.json), 2) [`workflow_1_issues_triage.json`](./workflow_1_issues_triage.json), 3) [`workflow_2_weekly_stats.json`](./workflow_2_weekly_stats.json) (или [`workflow_2_weekly_stats.gmail.json`](./workflow_2_weekly_stats.gmail.json) с настоящей Gmail node) | Во всех трёх нет красных нод |
| 2 | В ноде `Classify Issue (Sub-workflow)` (Workflow 1) выбрать импортированный `Sub-workflow: Issue Classifier (HW 7.2)` | Ссылка `workflowId` указывает на ваш sub-workflow |
| 3 | В нодах `Classify with GPT-5` и `AI Weekly Commentary (GPT-5)` подставить свой ключ вместо `Bearer <YOUR_LITELLM_API_KEY>` | Тест запроса проходит без 401 |
| 4 | Привязать credential `GitHub API` ко всем HTTP-нодам GitHub; в `Fetch Issues from GitHub` (Workflow 2) проверить `owner/repo` (`manamv/ITMOv2` или ваш тестовый) | Запросы к API отдают 200 |
| 5 | Создать две Data Table: `processed_issues` (колонка `issue_id` number) и `weekly_stats` (`total`, `bugs`, `tasks`, `features`, `needsTriage` — все number). Перед защитой в `weekly_stats` положить **1 тестовую строку прошлой недели** (чтобы в письме сразу был ненулевой Δ!), а `processed_issues` очистить | Таблицы привязаны в нодах |
| 6 | В Workflow 2 настроить почту (`Send an Email` / `Send a message (Gmail)`); убедиться, что `Schedule Trigger (Mon 9:00)` стоит с cron `0 9 * * MON`. **Activate** Workflow 1 и привязать GitHub Webhook на событие **Issues** | Recent Deliveries в GitHub → 200 OK |
| 7 | `export GITHUB_TOKEN=…` (+ `REPO=owner/repo`, если тестовый репозиторий другой) | `make check` |

## 1. Сценарий показа (по порядку критериев)

```bash
make issue-bug        # Критерий 1: создаёт Issue с багом -> лейбл bug + комментарий
make issue-feature    # Критерий 1: создаёт Issue с фичей -> лейбл feature-request + комментарий
make issue-task       # Критерий 1: создаёт Issue с задачей -> лейбл task + комментарий
make issue-vague      # Критерий 2: расплывчатый Issue -> confidence < 0.8 -> лейбл needs-triage, БЕЗ комментария
make issues-list      # Проверка всех 4 Issues и их лейблов в репозитории
make weekly-hint      # Подсказка для ручного запуска Workflow 2 (Критерии 4–9★)
```

| # | Критерий (баллы) | Что запускаю | Ожидаемый результат | Где показываю |
|---|---|---|---|---|
| 1 | Issue классифицируется как `bug`/`task`/`feature`, лейбл проставлен (**2**) | `make issue-bug`, `make issue-feature`, `make issue-task` | На каждом Issue стоит нужный лейбл и шаблонный комментарий | GitHub → Issues + `make issues-list` |
| 2 | `confidence < 0.8` или `unknown` → `needs-triage` без комментария (**1**) | `make issue-vague` | Стоит **только** лейбл `needs-triage`, комментариев **0** | GitHub → Issue + Executions (`Switch` → ветка 0) |
| 3 | Классификатор вынесен в Sub-workflow и вызывается через Execute Workflow (**2**) | уже видно в шагах 1–2 | В Execution Workflow 1 видно ноду `Classify Issue (Sub-workflow)`, и можно провалиться в Execution Sub-workflow | n8n → Executions (Workflow 1 + Sub-workflow) |
| 4 | Cron настроен (`0 9 * * MON`), GitHub API возвращает данные за неделю (**2**) | Ручной **Execute workflow** у Workflow 2 | В ноде `Fetch Issues from GitHub` видны Issues за последние 7 дней; `Schedule Trigger` настроен на `0 9 * * MON` | n8n → Workflow 2 → Executions |
| 5 | Code node группирует статистику по типу и по автору (**2**) | результат ноды `Group Stats by Type & Author` | Видны `total`, `bugs`, `tasks`, `features`, `needsTriage`, `closed`, `authorSummary` | n8n → Executions → `Group Stats` |
| 6 | HTML-письмо с таблицей статистики пришло (**2**) | шаг отправки письма (последняя нода) | В почте письмо с таблицей по типам и авторам | Почтовый клиент (или Gmail node в `.gmail.json`) |
| 7 ★ | Статистика недели сохраняется в Data Table (**1**) | `Save Stats to Data Table` | В таблице `weekly_stats` появилась новая строка за текущую неделю (теперь минимум 2 строки) | n8n → Data Tables → `weekly_stats` |
| 8 ★ | В письме показан Δ к прошлой неделе по Data Table (**2**) | `Calculate Deltas` + письмо | В письме рядом с цифрами есть Δ (`+3`, `-1` или `0 (без изм.)`) по прошлой строке из `weekly_stats` | Письмо + нода `Calculate Deltas` |
| 9 ★ | В письме есть блок «AI-комментарий недели» (**2**) | `AI Weekly Commentary (GPT-5)` + письмо | Внизу письма блок «🤖 AI-комментарий недели» с резюме от LLM по статистике и Δ | Письмо |

## 2. Что говорить ревьюверу

- **Классификатор и Switch.** Sub-workflow `Issue Classifier` принимает `title` и `body`, просит у GPT-5 строгий JSON `{"type": "...", "confidence": 0.0..1.0}`, `Parse Structured Output` чистит markdown-обёртки и валидирует диапазон. В `Workflow 1` нода `Switch by Type & Escalation` проверяет **первым правилом** `confidence < 0.8` ИЛИ тип не из `['bug', 'task', 'feature']` → сразу уводит в `Label: needs-triage (No Comment)`.
- **Почему в `needs-triage` нет комментария.** В этой ветке после HTTP-запроса на `POST /labels` больше нет ноды комментария, в отличие от веток `bug` / `task` / `feature-request`, чтобы не спамить пользователя на неразобранном обращении.
- **Передача в Sub-workflow.** `Deduplication (processed_issues)` проверяет `processed_issues` по `issue_id` и передаёт в `Execute Workflow` поля `issue_id`, `title`, `body`, `repo`. Sub-workflow возвращает `type` и `confidence`.
- **Сбор и группировка еженедельной статистики.** `Fetch Issues from GitHub` запрашивает `/issues?state=all&per_page=100&since=<7 дней назад>`, далее `Group Stats` отбрасывает PR (`if (issue.pull_request) continue`), фильтрует по `created_at >= oneWeekAgo` и считает счётчики по лейблам и по авторам (`authorCounts`).
- **★ Откуда Δ и AI-комментарий.** `Get Previous Stats from Data Table` читает `weekly_stats`, `Calculate Deltas` сортирует строки по `createdAt`, берёт последнюю прошлую неделю и считает `delta_*`, а `AI Weekly Commentary (GPT-5)` по этим цифрам и Δ генерирует текстовый блок «AI-комментарий недели» до записи текущей недели в таблицу.

## 3. Если что-то пошло не так

| Симптом | Причина → что делать |
|---|---|
| `Classify Issue` падает с ошибкой workflow not found | В ноде зашит старый ID `9Jb4gkWfWZGmKJSQ` — перевыбрать ваш Sub-workflow в выпадающем списке |
| Расплывчатый Issue получил `task` с высокой уверенностью | Использовать `make issue-vague` (там пустая бессмыслица `"???"` — LLM стабильно ставит `unknown` / `< 0.8`) |
| В `Calculate Deltas` везде `prev = 0` | В `weekly_stats` не было ни одной прошлой строки до запуска — добавить 1 строку руками и запустить заново |
| Преподаватель просит именно Gmail node вместо SMTP | Импортировать [`workflow_2_weekly_stats.gmail.json`](./workflow_2_weekly_stats.gmail.json) и привязать Gmail OAuth2 |

## 4. Артефакты для сдачи

- Экспорты JSON: [`subworkflow_classifier.json`](./subworkflow_classifier.json), [`workflow_1_issues_triage.json`](./workflow_1_issues_triage.json), [`workflow_2_weekly_stats.json`](./workflow_2_weekly_stats.json) (плюс Gmail-вариант [`workflow_2_weekly_stats.gmail.json`](./workflow_2_weekly_stats.gmail.json)).
- Скриншоты Executions, письма и Data Table — в этой папке (`Снимок экрана *.png`).

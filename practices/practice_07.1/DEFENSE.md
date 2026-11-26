# Подготовка к защите 7.1 — ассистент код-ревью в n8n (12 баллов)

Каждый критерий проверяется **реальным запуском**, баллы идут по порядку (следующий засчитывается, только если засчитан предыдущий).
Все команды ниже — готовые цели из [`Makefile`](./Makefile).

## 0. Перед защитой (чек-лист, 10 минут)

| # | Что сделать | Проверка |
|---|---|---|
| 1 | Импортировать в n8n [`workflow_7_1.json`](./workflow_7_1.json) (Workflow → Import from file) | В канвасе 14 нод, есть `Already Reviewed?` и `Skip: PR already reviewed` |
| 2 | В нодах `Model 1`/`Model 2` вставить свой ключ вместо `Bearer <YOUR_LITELLM_API_KEY>` (в репозитории ключа нет — так и должно быть) | Тест-запрос к `https://litellm.data-light.ru/v1/chat/completions` не даёт 401 |
| 3 | Привязать credential `GitHub API` ко всем HTTP-нодам GitHub | Нет красных значков у нод |
| 4 | Data Table `reviewed_prs` с колонками `pr_id` (number) и `model` (string); привязать её в нодах `Check Data Table` / `Save to Data Table` | Таблица открывается, **перед демо она пуста** |
| 5 | **Activate** сценарий; в тестовом репозитории Webhook → Payload URL = *Production URL* ноды `GitHub Webhook` (`…/webhook/github-pr-review`), Content type `application/json`, событие **Issue comments** | Recent Deliveries в GitHub → зелёная галочка 200 |
| 6 | `export GITHUB_TOKEN=…` (+ `REPO=owner/repo`, если репозиторий не `manamv/ITMOv2`) | `make check` |

> Тестовый PR обязательно **новый** — его номера не должно быть в Data Table, иначе первое ревью пропустится.

## 1. Сценарий показа (5 шагов — по критериям)

```bash
make pr-open                 # создаёт ветку, 3 файла (3 блока кода) и PR → запомнить номер N
make review-main PR=N        # основная модель (GPT-5) + сохранение (N, gpt-5) в Data Table
make review-other PR=N       # критерий 1 и 4: /make_other_ai_review — сравнение второй модели на том же PR!
make table-hint              # подсказка, что показать в Data Table (критерий 2)
make review-main PR=N        # критерий 3: повторный /make_ai_review — ревью НЕ запускается (Skip)
make show-comments PR=N      # сколько точечных комментариев оставлено (критерий 4)
```

| # | Критерий (баллы) | Что запускаю | Ожидаемый результат | Где показываю |
|---|---|---|---|---|
| 1 | `/make_other_ai_review` → ревью второй моделью, результат в PR (**2**) | `make review-other PR=N` | В PR появились комментарии с заголовком «🤖 **Модель 2 (Security Audit)** ревью блока» | Вкладка PR + n8n → Executions (зелёный запуск, ветка `Model 2`) |
| 2 | Data Table, id PR сохранён после ревью (**2**) | открыть таблицу после шага 1 | В `reviewed_prs` строки: `(pr_id = N, model = gpt-5)` и `(pr_id = N, model = gpt-5-security)` | n8n → Data Tables → `reviewed_prs` |
| 3 | Повторный `/make_ai_review` не запускает ревью (**3**) | `make review-main PR=N` (повторно) | Новый Execution: дошёл до `Already Reviewed?` → ветка **true** → `Skip: PR already reviewed`; нод `Get PR Diff` / `Model` / `Post Inline Review Comment` **нет** (серые); новых комментариев в PR нет | n8n → Executions (последний запуск) |
| 4 ★ | Точечные комментарии к каждому блоку (**5**) | уже сделано шагами 1–2 | Под каждым файлом/хунком diff свой inline-комментарий на конкретной строке (на вкладке *Files changed*) | PR → Files changed; `make show-comments PR=N` |

## 2. Что говорить ревьюверу

- **Выбор модели.** Нода `Choose Model (1 or 2)` проверяет, содержит ли текст комментария `/make_other_ai_review`: да → ветка `Model 2: Security Auditor` (другой системный промпт — аудит безопасности), нет → `Model 1: openai/gpt-5` (общее ревью). Результаты отличаются фокусом: основная модель описывает суть и риски, вторая — уязвимости/валидацию/надёжность.
- **Где хранится состояние.** Data Table `reviewed_prs` (`pr_id`, `model`). Ноды `Check Data Table` → `Deduplication Check` читают таблицу, `Save to Data Table` пишет строку один раз за запуск (`Execute Once`), а не по разу на каждый блок.
- **Решение «запускать или нет».** `Deduplication Check` проверяет пару **`(pr_id, model)`**: каждая модель может проревьюить PR не более одного раза. Это позволяет сравнить результаты двух моделей на одном PR, при этом повторный `/make_ai_review` (и повторный `/make_other_ai_review`) получает `skip = true` и уходит в `Skip: PR already reviewed`.
- **Что при повторном `/make_ai_review`.** Webhook срабатывает, запуск в Executions есть, но кончается на `Skip` — ревью и комментарии не создаются.
- **★ Точечные комментарии.** `Split Diff Into Blocks` режет diff по `diff --git` (файл) и `@@ -a,b +c,d @@` (хунк), считает номер новой строки `c + число добавленных/контекстных строк` и берёт последнюю добавленную строку хунка. Каждый блок уходит в модель отдельно и публикуется через `POST /pulls/{n}/comments` с `commit_id`, `path`, `line`, `side=RIGHT` — то есть привязан к строке кода.

## 3. Если что-то пошло не так

| Симптом | Причина → что делать |
|---|---|
| В GitHub Recent Deliveries красный/404 | Сценарий не Active или стоит *Test URL* → включить Active, взять *Production URL* |
| Ревью не началось на новом PR | Номер PR уже есть в Data Table → удалить строку или взять новый PR |
| 401 в `Model` нодах | Не подставлен ключ вместо `<YOUR_LITELLM_API_KEY>` |
| 422 от `Post Inline Review Comment` | Строка вне diff (редкий хунк) → показать другой PR или fallback-комментарий (`is_fallback`) |
| После `make review-main` нет ветки `Skip` | В таблице нет строки для этого PR (шаг 1 не дошёл до `Save to Data Table`) |

## 4. Артефакты для сдачи

- Экспорт: [`workflow_7_1.json`](./workflow_7_1.json) (то же в `workflow.json` и `PR AI Reviewer (HW 7.1 - with Star).json`).
- Скриншоты Executions и Data Table — лежат в этой папке (`Снимок экрана 2026-11-19 *.png`); **после перепрошивки сценария (см. ниже) переснимите шаги 1–3**.
- Ссылка на тестовый PR — вывод `make pr-open`.

> **Что изменено перед защитой.** Дедупликация идёт по паре `(pr_id, model)`: каждая модель ревьюит PR не более одного раза (удобно сравнить ответы двух моделей на одном PR, при этом повторный `/make_ai_review` или `/make_other_ai_review` уходит в ветку `Skip: PR already reviewed`), а `Save to Data Table` пишет одну строку за запуск (`Execute Once`).

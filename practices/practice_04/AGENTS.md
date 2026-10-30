# AGENTS.md — Инструкции и правила для AI-агентов

Добро пожаловать в проект **VkusMart (Smart Thematic Grocery & Meal Prep Assistant)**.

## 1. Контракты и документация
- **Главные требования и спецификация API:** [docs/requirements.md](file:///D:/3sem/vibecoding/ITMOv2/practices/practice_04/docs/requirements.md)
- **Стандарты кода и соглашения:** [docs/style-guide.md](file:///D:/3sem/vibecoding/ITMOv2/practices/practice_04/docs/style-guide.md)
- **Передача контекста между сессиями (Handoff):** [docs/HANDOFF.md](file:///D:/3sem/vibecoding/ITMOv2/practices/practice_04/docs/HANDOFF.md)
- **Пример тестов:** [tests/test_catalog.py](file:///D:/3sem/vibecoding/ITMOv2/practices/practice_04/tests/test_catalog.py)

## 2. Команды автоматической проверки (Runner)
- Основная команда проверки проекта:
  ```bash
  sh scripts/check.sh
  ```
  Или на Windows / без bash:
  ```bash
  python scripts/check.py
  ```
- Runner запускает синтаксический анализ, валидацию типов и все тесты (включая тесты MCP сервера).
- После любого изменения файлов обязательно запускайте проверку. Код возврата `0` — обязателен.

## 3. Среда, Skills и MCP
- **Подключенный MCP:** В `opencode.json` подключен официальный сервер ВкусВилл `https://mcp.vkusvill.ru/mcp` (инструменты `vkusvill_products_search`, `vkusvill_products_discount`, `vkusvill_recipes`, `vkusvill_cart_link_create`), а также локальный сервер `mcp_server.server` (`get_theme_bundles`, `search_products`, `calculate_cart_nutrition`). Клиент: `mcp_server/vkusvill_client.py`.
- **Активный Skill:** `.opencode/skills/thematic-grocery-curator/` — куратор тематических наборов продуктов с автоматической проверкой пищевой ценности и бюджета.
- **Hook автопроверки:** `.opencode/plugins/check-after-edit.js` автоматически триггерит runner после правок исходного кода.

## 4. Ограничения и запреты
- **НЕЛЬЗЯ** ослаблять проверки в runner или удалять тесты ради «зелёного» статуса.
- **НЕЛЬЗЯ** менять публичный контракт API и MCP без явного согласования.
- **НЕЛЬЗЯ** добавлять тяжёлые сторонние фреймворки, если задачу можно решить стандартной библиотекой.
- Все новые фичи должны сопровождаться модульными тестами по методологии TDD (сначала красный тест, затем реализация, затем зелёный).

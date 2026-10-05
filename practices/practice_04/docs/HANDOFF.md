# HANDOFF: Передача контекста и состояние проекта VkusMart

## 1. Текущее состояние
- **Реализована среда агента:**
  - `AGENTS.md` с контрактами, правилами и командами проверок.
  - `docs/requirements.md` и `docs/style-guide.md`.
  - Автоматический Runner: `scripts/check.sh` / `scripts/check.py`.
  - Hook автопроверки: `.opencode/plugins/check-after-edit.js`.
  - Профиль QA-субагента: `.opencode/agents/tester.md`.
  - Навык со связанными ресурсами: `.opencode/skills/thematic-grocery-curator/` (`SKILL.md`, `rules/nutrition-guidelines.md`, `scripts/validate_bundle.py`).
  - Собственный/выбранный MCP сервер: `mcp_server/server.py` (`get_theme_bundles`, `search_products`, `calculate_cart_nutrition`) с поддержкой JSON-RPC 2.0 stdio, успешными сценариями и строгой валидацией ошибок.
  - Конфигурация OpenCode 2.0.20: `opencode.json`.
  - Веб-приложение и интерактивная консоль MCP: `app/server.py`, `app/static/`.

- **Реализована и проверена Фича A:**
  - Входная валидация запросов (пустые строки, длина, проверка категорий).
  - Исключение аллергенов (`lactose`, `gluten`, `nuts`, `seafood`).
  - Контроль бюджета и валидация положительных величин.
  - Набор тестов: `tests/test_feature_a.py`, `tests/test_mcp.py`, `tests/test_catalog.py` (19 тестов PASS, exit code 0).

## 2. Что предстоит сделать (Фича B в отдельном worktree)
- Создать изолированный `git worktree` ветки `practice-04-b`.
- Реализовать Фичу B:
  1. **Динамические скидки и расчет корзины:**
     - Корзина >= 1500 ₽ -> скидка 7%.
     - Корзина >= 2500 ₽ -> скидка 12%.
  2. **Graceful Fallback & Smart Recommendations:**
     - При нулевых результатах поиска по жестким фильтрам возвращать статус `fallback_applied=True` и альтернативные предложения (ослабление фильтра цены/аллергенов).
  3. **Проверка баланса макронутриентов:** расчет соотношения калорий из белков, жиров и углеводов.
- Покрыть Фичу B модульными тестами в `tests/test_feature_b.py`.
- Провести валидацию через QA-субагента `@tester`.
- Объединить ветку через `git merge --ff-only practice-04-b` обратно в `practice_4`.
- Выполнить сквозную проверку объединенного состояния через `scripts/check.sh`.

## 3. Команда проверки
```bash
python scripts/check.py
# или
sh scripts/check.sh
```

## 4. Ограничения
- Не ослаблять проверки runner и не удалять тесты фичи A.
- Не нарушать обратную совместимость схемы MCP `tools/list` и `tools/call`.

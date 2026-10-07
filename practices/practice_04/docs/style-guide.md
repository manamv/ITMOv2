# Style Guide и стандарты разработки проекта VkusMart

## 1. Ключевые правила проекта

1. **Проверяй поведение через публичный интерфейс:**
   Тестируй бизнес-логику и сервисы через публичные функции и методы API (`search_products`, `calculate_cart_nutrition`), а не через приватные внутренности моделей. Это гарантирует сохранение контракта при рефакторинге.
2. **Строгая валидация на границах (Fail-Fast with Clean Messages):**
   Все входящие аргументы (в HTTP API, функциях сервиса и MCP инструментах) проверяются до выполнения бизнес-логики. Ошибки должны возвращать структурированный ответ с кодом (`INVALID_BUDGET`, `EMPTY_QUERY`, `UNKNOWN_CATEGORY`) и понятным для пользователя объяснением.
3. **Не добавляй тяжелые зависимости ради маленькой правки:**
   Используй стандартную библиотеку Python (`dataclasses`, `typing`, `json`, `http.server`, `unittest`) и минимально необходимые инструменты (`pytest`). Никаких раздутых фреймворков без явной необходимости.
4. **Не ослабляй runner ради зелёного результата:**
   Запрещено удалять assertions, пропускать (`skip`) тесты или игнорировать ошибки типов, чтобы получить код 0. Если тест падает — исправляй реализацию или контракт.
5. **Неизменяемость и предсказуемость данных:**
   Каталог товаров и возвращаемые подборки не должны мутироваться побочными эффектами. Расчет корзины возвращает новый объект с расчетом, не изменяя исходные товары.

## 2. Эталонный пример реализации

```python
from dataclasses import dataclass
from typing import List, Optional

@dataclass(frozen=True)
class ValidationResult:
    is_valid: bool
    error_code: Optional[str] = None
    message: Optional[str] = None

def validate_budget_limit(budget: float, min_allowed: float = 50.0) -> ValidationResult:
    """Валидация бюджета на границе публичного интерфейса."""
    if budget <= 0:
        return ValidationResult(
            is_valid=False,
            error_code="INVALID_BUDGET",
            message=f"Бюджет должен быть строго больше 0, получено: {budget}"
        )
    if budget < min_allowed:
        return ValidationResult(
            is_valid=False,
            error_code="BUDGET_TOO_LOW",
            message=f"Минимальный бюджет для подборки составляет {min_allowed} ₽, получено: {budget}"
        )
    return ValidationResult(is_valid=True)
```

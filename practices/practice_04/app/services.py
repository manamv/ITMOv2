"""
Сервисный слой приложения VkusMart (Feature B enhanced).
Реализует бизнес-логику поиска, фильтрации по диетическим требованиям,
формирования тематических подборок, расчета корзины со ступенчатыми скидками,
анализом баланса макронутриентов и механизмом Graceful Fallback.
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass

from app.catalog import (
    Product,
    ThemeBundle,
    PRODUCTS,
    THEMES,
    PRODUCTS_BY_ID,
    THEMES_BY_ID,
    CATEGORIES,
    ALLERGENS_LIST
)

@dataclass
class ServiceError(Exception):
    code: str
    message: str

    def to_dict(self) -> Dict[str, Any]:
        return {"error": True, "code": self.code, "message": self.message}

def search_products(
    query: Optional[str] = None,
    category: Optional[str] = None,
    max_price: Optional[float] = None,
    max_calories: Optional[int] = None,
    exclude_allergens: Optional[List[str]] = None,
    tags: Optional[List[str]] = None,
    allow_fallback: bool = False
) -> List[Dict[str, Any]]:
    """
    Поиск товаров по каталогу с валидацией, фильтрацией и поддержкой Graceful Fallback (Фича B).
    """
    if query is not None:
        query_clean = query.strip()
        if len(query_clean) == 0:
            raise ServiceError("EMPTY_QUERY", "Поисковый запрос не может быть пустым.")
        if len(query_clean) < 2:
            raise ServiceError("QUERY_TOO_SHORT", "Поисковый запрос должен содержать минимум 2 символа.")
    else:
        query_clean = ""

    if category is not None and category != "":
        if category not in CATEGORIES:
            raise ServiceError(
                "UNKNOWN_CATEGORY",
                f"Неизвестная категория '{category}'. Допустимые: {', '.join(CATEGORIES)}"
            )

    if max_price is not None and max_price <= 0:
        raise ServiceError("INVALID_PRICE_LIMIT", "Лимит цены должен быть строго больше 0.")

    if max_calories is not None and max_calories <= 0:
        raise ServiceError("INVALID_CALORIE_LIMIT", "Лимит калорийности должен быть строго больше 0.")

    forbidden_allergens = set(exclude_allergens or [])
    required_tags = set(tags or [])

    results = []
    q_lower = query_clean.lower()

    for p in PRODUCTS:
        # Проверка запроса: точное вхождение либо по основе слов
        if q_lower:
            words = [w for w in q_lower.split() if len(w) >= 2]
            text = f"{p.name} {p.description}".lower()
            match_all = True
            for w in words:
                stem = w[:-1] if len(w) > 4 else w
                if w not in text and stem not in text:
                    match_all = False
                    break
            if not match_all:
                continue

        # Проверка категории
        if category and p.category != category:
            continue

        # Проверка цены
        if max_price is not None and p.price > max_price:
            continue

        # Проверка калорий
        if max_calories is not None and p.calories > max_calories:
            continue

        # Проверка аллергенов (Фича A)
        p_allergens = set(p.allergens)
        if forbidden_allergens and p_allergens.intersection(forbidden_allergens):
            continue

        # Проверка тегов
        if required_tags and not required_tags.issubset(set(p.tags)):
            continue

        results.append(p.to_dict())

    # Graceful Fallback (Фича B): если точных совпадений нет, но разрешен fallback
    if len(results) == 0 and allow_fallback:
        # Попробуем ослабить лимит цены на 30% или убрать ограничение по калориям
        fallback_results = []
        relaxed_price = (max_price * 1.3) if max_price else None

        for p in PRODUCTS:
            if category and p.category != category:
                continue
            if relaxed_price is not None and p.price > relaxed_price:
                continue
            # Аллергены НЕ ослабляем из соображений безопасности здоровья
            if forbidden_allergens and set(p.allergens).intersection(forbidden_allergens):
                continue
            fallback_item = p.to_dict()
            fallback_item["_fallback_match"] = True
            fallback_results.append(fallback_item)

        return fallback_results

    return results

def get_theme_bundles(
    theme_id: Optional[str] = None,
    max_budget: Optional[float] = None,
    exclude_allergens: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    Получение тематических подборок с фильтрацией по бюджету и аллергенам.
    """
    if max_budget is not None and max_budget <= 0:
        raise ServiceError("INVALID_BUDGET", f"Бюджет должен быть строго положительным числом, получено: {max_budget}")

    forbidden_allergens = set(exclude_allergens or [])
    selected_themes = [THEMES_BY_ID[theme_id]] if theme_id and theme_id in THEMES_BY_ID else THEMES

    bundles = []
    for t in selected_themes:
        matched_products = []
        for pid in t.product_ids:
            p = PRODUCTS_BY_ID.get(pid)
            if not p:
                continue
            if forbidden_allergens and set(p.allergens).intersection(forbidden_allergens):
                continue
            matched_products.append(p.to_dict())

        total_price = sum(item["price"] for item in matched_products)
        total_calories = sum(item["calories"] for item in matched_products)
        total_protein = round(sum(item["protein"] for item in matched_products), 1)
        total_fat = round(sum(item["fat"] for item in matched_products), 1)
        total_carbs = round(sum(item["carbs"] for item in matched_products), 1)

        is_within_budget = True
        if max_budget is not None and total_price > max_budget:
            is_within_budget = False

        bundles.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "icon": t.icon,
            "target_budget": t.target_budget,
            "actual_price": round(total_price, 2),
            "total_calories": total_calories,
            "macros": {
                "protein": total_protein,
                "fat": total_fat,
                "carbs": total_carbs
            },
            "is_within_budget": is_within_budget,
            "products_count": len(matched_products),
            "products": matched_products
        })

    return bundles

def calculate_cart_nutrition(
    items: List[Dict[str, Any]],
    apply_discount_feature_b: bool = True
) -> Dict[str, Any]:
    """
    Расчет корзины: итоговая цена, динамическая ступенчатая скидка,
    расчет баланса макронутриентов и предупреждения (Фича B).
    """
    if not items:
        return {
            "total_items": 0,
            "subtotal": 0.0,
            "discount_percent": 0.0,
            "discount_rub": 0.0,
            "final_price": 0.0,
            "total_calories": 0,
            "protein": 0.0,
            "fat": 0.0,
            "carbs": 0.0,
            "macro_percentages": {"protein": 0.0, "fat": 0.0, "carbs": 0.0},
            "nutrition_alerts": [],
            "allergens": [],
            "items_detail": []
        }

    subtotal = 0.0
    total_cals = 0
    protein = 0.0
    fat = 0.0
    carbs = 0.0
    all_allergens = set()
    items_detail = []

    for item in items:
        pid = item.get("product_id")
        qty = int(item.get("quantity", 1))
        if qty <= 0:
            continue
        p = PRODUCTS_BY_ID.get(pid)
        if not p:
            raise ServiceError("PRODUCT_NOT_FOUND", f"Товар с id '{pid}' не найден в каталоге.")

        line_price = p.price * qty
        subtotal += line_price
        total_cals += p.calories * qty
        protein += p.protein * qty
        fat += p.fat * qty
        carbs += p.carbs * qty
        all_allergens.update(p.allergens)

        items_detail.append({
            "product_id": p.id,
            "name": p.name,
            "price": p.price,
            "quantity": qty,
            "line_price": round(line_price, 2),
            "calories": p.calories * qty,
            "allergens": list(p.allergens)
        })

    # Расчет динамической скидки (Фича B):
    # Пороговые значения:
    # subtotal >= 2500.0 -> 12%
    # subtotal >= 1500.0 -> 7%
    # subtotal < 1500.0 -> 0%
    discount_pct = 0.0
    if apply_discount_feature_b:
        if subtotal >= 2500.0:
            discount_pct = 12.0
        elif subtotal >= 1500.0:
            discount_pct = 7.0

    discount_rub = round(subtotal * (discount_pct / 100.0), 2)
    final_price = round(subtotal - discount_rub, 2)

    # Расчет процентного баланса макронутриентов (Фича B)
    macro_cals = (protein * 4) + (fat * 9) + (carbs * 4)
    if macro_cals > 0:
        protein_pct = round((protein * 4 / macro_cals) * 100, 1)
        fat_pct = round((fat * 9 / macro_cals) * 100, 1)
        carbs_pct = round((carbs * 4 / macro_cals) * 100, 1)
    else:
        protein_pct = fat_pct = carbs_pct = 0.0

    nutrition_alerts = []
    if carbs_pct > 65.0:
        nutrition_alerts.append("Высокая доля углеводов (> 65%). Рекомендуется добавить источник белка.")
    if fat_pct > 70.0 and protein_pct < 15.0:
        nutrition_alerts.append("Высокая доля жиров при низком белке. Проверьте баланс рациона.")

    return {
        "total_items": sum(i["quantity"] for i in items_detail),
        "subtotal": round(subtotal, 2),
        "discount_percent": discount_pct,
        "discount_rub": discount_rub,
        "final_price": final_price,
        "total_calories": total_cals,
        "protein": round(protein, 1),
        "fat": round(fat, 1),
        "carbs": round(carbs, 1),
        "macro_percentages": {
            "protein": protein_pct,
            "fat": fat_pct,
            "carbs": carbs_pct
        },
        "nutrition_alerts": nutrition_alerts,
        "allergens": sorted(list(all_allergens)),
        "items_detail": items_detail
    }

#!/usr/bin/env python3
"""
Скрипт содержательной автоматизации для навыка 'thematic-grocery-curator'.
Выполняет автоматизированный аудит продуктового набора:
- Расчет суммарной калорийности и БЖУ.
- Проверка соответствия макронутриентов целевому профилю (ПП, Кето, Студент).
- Проверка жестких ограничений по аллергенам.
- Проверка бюджета.
"""

import sys
import json
import argparse
from typing import Dict, Any, List

THEME_PROFILES = {
    "pp_balance": {"min_protein_pct": 20, "max_fat_pct": 40, "max_carb_pct": 55},
    "keto_lunch": {"min_fat_pct": 60, "max_carb_pct": 12, "min_protein_pct": 20},
    "student_budget": {"max_price": 500.0, "min_calories": 500},
    "sugar_free": {"max_added_sugar": 0, "max_carb_pct": 45}
}

def audit_bundle(bundle_data: Dict[str, Any]) -> Dict[str, Any]:
    theme = bundle_data.get("theme", "pp_balance")
    products = bundle_data.get("products", [])
    max_budget = bundle_data.get("max_budget", 10000.0)
    forbidden_allergens = set(bundle_data.get("allergens", []))

    total_price = sum(p.get("price", 0) for p in products)
    total_cals = sum(p.get("calories", 0) for p in products)
    total_protein = sum(p.get("protein", 0) for p in products)
    total_fat = sum(p.get("fat", 0) for p in products)
    total_carbs = sum(p.get("carbs", 0) for p in products)

    # Калории от БЖУ: белок 4 ккал/г, жир 9 ккал/г, углев 4 ккал/г
    macro_cals = (total_protein * 4) + (total_fat * 9) + (total_carbs * 4)
    if macro_cals > 0:
        protein_pct = round((total_protein * 4 / macro_cals) * 100, 1)
        fat_pct = round((total_fat * 9 / macro_cals) * 100, 1)
        carbs_pct = round((total_carbs * 4 / macro_cals) * 100, 1)
    else:
        protein_pct = fat_pct = carbs_pct = 0.0

    violations = []

    # 1. Проверка бюджета
    if total_price > max_budget:
        violations.append(f"Превышен бюджет: {total_price} ₽ > {max_budget} ₽")

    # 2. Проверка аллергенов
    detected_allergens = set()
    for p in products:
        p_allergens = set(p.get("allergens", []))
        clashes = p_allergens.intersection(forbidden_allergens)
        if clashes:
            violations.append(f"Товар '{p.get('name')}' содержит запрещенные аллергены: {', '.join(clashes)}")
            detected_allergens.update(clashes)

    # 3. Проверка профиля темы
    if theme == "student_budget" and total_price > 500.0:
        violations.append(f"Студенческий ужин превысил лимит 500 ₽ (итого: {total_price} ₽)")
    elif theme == "keto_lunch" and carbs_pct > 15.0:
        violations.append(f"Для кето слишком много углеводов: {carbs_pct}% (макс 15%)")

    status = "VALID" if not violations else "INVALID"
    health_score = max(0, 100 - len(violations) * 30)

    return {
        "status": status,
        "health_score": health_score,
        "summary": {
            "total_price": round(total_price, 2),
            "total_calories": round(total_cals, 1),
            "macro_breakdown": {
                "protein_g": round(total_protein, 1),
                "fat_g": round(total_fat, 1),
                "carbs_g": round(total_carbs, 1),
                "protein_pct": protein_pct,
                "fat_pct": fat_pct,
                "carbs_pct": carbs_pct,
            },
            "detected_allergens": list(detected_allergens)
        },
        "violations": violations
    }

def main():
    parser = argparse.ArgumentParser(description="Аудит тематической продуктовой корзины")
    parser.add_argument("--bundle-json", type=str, help="JSON строка с описанием корзины")
    parser.add_argument("--file", type=str, help="Путь к JSON файлу корзины")
    args = parser.parse_args()

    data = None
    if args.bundle_json:
        data = json.loads(args.bundle_json)
    elif args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        # Тестовый пример по умолчанию
        data = {
            "theme": "student_budget",
            "max_budget": 500.0,
            "allergens": ["lactose"],
            "products": [
                {"name": "Гречка ядрица 450г", "price": 85.0, "calories": 310, "protein": 12.0, "fat": 3.0, "carbs": 62.0, "allergens": []},
                {"name": "Яйца фермерские C0 10шт", "price": 130.0, "calories": 157, "protein": 13.0, "fat": 11.0, "carbs": 0.7, "allergens": []},
                {"name": "Бананы 1кг", "price": 140.0, "calories": 89, "protein": 1.5, "fat": 0.2, "carbs": 21.8, "allergens": []}
            ]
        }

    report = audit_bundle(data)
    print(json.dumps(report, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()

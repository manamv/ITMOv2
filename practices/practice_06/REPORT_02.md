# Отчёт 2. Исправления и повторные проверки (Post-Remediation Report)

**Дата проведения повторного аудита:** 27 октября 2026 г.  
**Объект аудита:** Исправленный сервис Mini Shop (`practices/practice_06/lab/service.py`)  
**Тестовый набор:** 28 тестов (`test_http.py`, `test_service.py`, `test_security.py`)  
**Статус безопасности:** ВСЕ 9 УЯЗВИМОСТЕЙ УСТРАНЕНЫ (Defense-in-Depth реализована)

---

## 1. Сводная таблица исправлений (До / После)

| # | Уязвимость | Статус ДО | Применённая мера защиты | Статус ПОСЛЕ |
|---|---|---|---|---|
| **1** | **SQL Injection** (`/profile`, `/search`) | Интерполяция через f-строки: `WHERE id = {query.get('id')}` | Параметризованные запросы SQLite: `WHERE id = ?` и `WHERE name LIKE ?` | **Устранена** (тесты `test_sqli_*` подтверждают трактовку кавычек как литералов) |
| **2** | **BOLA / IDOR** (`/orders`, `/profile`) | Возврат всех заказов и любого профиля без проверки прав | Фильтрация по владельцу активной сессии: `WHERE owner = session['id']` | **Устранена** (клиент Alice видит только свои заказы; запрос чужого профиля возвращает `403 Forbidden`) |
| **3** | **Подмена роли через `X-Role`** (`/admin/export`) | Слепое доверие заголовку `headers.get("X-Role") == "staff"` | Проверка роли исключительно по серверной сессии: `session['role'] == 'staff'` | **Устранена** (клиент с заголовком `X-Role: staff` без сессии администратора получает `403 Forbidden`) |
| **4** | **Манипуляция ценой** (`POST /orders`) | Доверие переданной клиентом цене: `body.get("price", ...)` | Игнорирование пользовательской цены; принудительная установка цены из каталога | **Устранена** (передача `price: 0.01` игнорируется, товар записывается по цене каталога 5000 ₽) |
| **5** | **Path Traversal и IDOR в файлах** (`GET /files`) | Конкатенация пути `files/{user}/{path}` без фильтрации | Валидация сессии, изоляция в папке `files/{username}/`, блокировка `..` | **Устранена** (попытка доступа к `bob` или `../private` возвращает `403/400`) |
| **6** | **Stored XSS** (`/reviews/view`) | Прямая вставка текста отзыва в HTML: `<p>{r['text']}</p>` | Санитизация и экранирование спецсимволов через `html.escape()` | **Устранена** (теги `<script>` преобразуются в безопасные HTML-сущности `&lt;script&gt;`) |
| **7** | **Утечка секретов в логах** (`/debug/logs`) | Открытый доступ к сырым заголовкам (`X-Token`) и телам (`password`) | Ограничение доступа ролью `staff`, маскирование чувствительных полей `[REDACTED]` | **Устранена** (неавторизованный запрос получает 403; персонал видит обезличенные токены) |
| **8** | **Indirect Prompt Injection** (`/assistant/context`) | Прямая склейка недоверенных отзывов с системным промптом | Разделение инструкций и данных тегами `<untrusted_reviews>`, экранирование | **Устранена** (отзывы изолированы в защищённые теги; сервер предупреждает модель о недоверенных данных) |
| **9** | **Excessive Agency** (`/assistant/execute`) | Слепое исполнение `read_file`, `delete_tree`, `export_profiles` | Серверный Tool RBAC: проверка роли и путей перед вызовом любого инструмента | **Устранена** (клиенту запрещены `delete_tree` и `export_profiles`; `read_file` ограничен личной папкой) |

---

## 2. Детальный разбор архитектурных изменений в `service.py`

### 2.1. Изоляция контекста и разграничение доступа (BOLA / RBAC)
В сервис добавлен централизованный метод валидации сессий `get_session(headers)`:
* Из заголовка `X-Token` извлекается токен сессии.
* Если токен отсутствует или не найден в реестре `self.sessions`, возвращается `401 Unauthorized`.
* Все бизнес-операции привязаны к `session["id"]` и `session["role"]`.

### 2.2. Параметризация SQL
Все прямые конкатенации строк в вызовах `self.db.execute()` заменены на позиционные параметры `?`:
```python
# Было:
self.rows(f"SELECT * FROM profiles WHERE id = {query.get('id', '1')}")

# Стало:
self.rows("SELECT * FROM profiles WHERE id = ?", (target_id,))
```

### 2.3. Защита от подделки параметров (Price Integrity)
В обработчике `POST /orders` значение `price` теперь формируется строго на основе доверенного реестра цен `self.products`:
```python
product = body.get("product")
if product not in self.products:
    return 400, {"error": "unknown product"}
price = self.products[product]  # Игнорируем body.get("price")
```

### 2.4. Серверный Tool RBAC для AI-ассистента (Defense-in-Depth)
Даже если злоумышленник сумеет обойти защиту промпта и заставит языковую модель сгенерировать опасное решение (например, вызов `delete_tree` или чтение `private/operator-note.txt`), исполнитель `/assistant/execute` **проверяет права вызывающего клиента**:
```python
if tool == "read_file":
    # Ограничение пути личной директорией пользователя
    expected_prefix = f"files/{session.get('username')}/"
    if session["role"] != "staff" and not clean_path.startswith(expected_prefix):
        return 403, {"error": "forbidden: cannot read other users or private files"}

if tool in ("export_profiles", "delete_tree"):
    # Деструктивные и административные функции строго заблокированы для обычных клиентов
    if session.get("role") != "staff":
        return 403, {"error": "forbidden: permission denied for customer"}
```

---

## 3. Результаты запуска регрессионного тестирования

Для подтверждения эффективности защиты был разработан расширенный тестовый набор [`practice_06/lab/test_security.py`](file:///D:/3sem/vibecoding/ITMOv2/practices/practice_06/lab/test_security.py).

Запуск полного набора тестов (`16` базовых тестов + `12` тестов безопасности):

```
test_health_and_not_found (test_http.HttpTest.test_health_and_not_found) ... ok
test_login_and_purchase_over_http (test_http.HttpTest.test_login_and_purchase_over_http) ... ok
test_transport_only_binds_loopback (test_http.HttpTest.test_transport_only_binds_loopback) ... ok
test_assistant_cannot_delete_tree_for_regular_user (test_security.SecurityRegressionTest.test_assistant_cannot_delete_tree_for_regular_user)
Уязвимость 9: Деструктивный инструмент delete_tree запрещен для обычных клиентов ... ok
test_assistant_cannot_export_profiles_for_regular_user (test_security.SecurityRegressionTest.test_assistant_cannot_export_profiles_for_regular_user)
Уязвимость 9: Инструмент export_profiles запрещен для обычных клиентов ... ok
test_assistant_cannot_read_operator_secret (test_security.SecurityRegressionTest.test_assistant_cannot_read_operator_secret)
Уязвимость 8 и 9: Исполнение read_file ограничено каталогом текущего пользователя ... ok
test_debug_logs_restricted_to_staff (test_security.SecurityRegressionTest.test_debug_logs_restricted_to_staff)
Уязвимость 7: Доступ к /debug/logs закрыт для клиентов и неавторизованных лиц ... ok
test_header_spoofing_x_role_rejected (test_security.SecurityRegressionTest.test_header_spoofing_x_role_rejected)
Уязвимость 3: Подмена роли через заголовок X-Role без сессии staff блокируется ... ok
test_idor_orders_blocked_for_other_users (test_security.SecurityRegressionTest.test_idor_orders_blocked_for_other_users)
Уязвимость 2: BOLA / IDOR в /orders заблокирован (Alice видит только свой заказ) ... ok
test_idor_profile_cannot_view_other_users (test_security.SecurityRegressionTest.test_idor_profile_cannot_view_other_users)
Уязвимость 2: Запрет просмотра чужого профиля клиентом ... ok
test_path_traversal_and_cross_user_file_blocked (test_security.SecurityRegressionTest.test_path_traversal_and_cross_user_file_blocked)
Уязвимость 5: Чтение чужого чека и приватной заметки блокируется ... ok
test_price_tampering_ignored (test_security.SecurityRegressionTest.test_price_tampering_ignored)
Уязвимость 4: Манипуляция ценой игнорируется, применяется цена каталога ... ok
test_sqli_profile_blocked_and_treated_as_literal (test_security.SecurityRegressionTest.test_sqli_profile_blocked_and_treated_as_literal)
Уязвимость 1: SQL-инъекция в /profile нейтрализована параметризацией ... ok
test_sqli_search_parameterized_and_restricted (test_security.SecurityRegressionTest.test_sqli_search_parameterized_and_restricted)
Уязвимость 1: Поиск параметризован и изолирован по пользователю ... ok
test_stored_xss_in_reviews_escaped (test_security.SecurityRegressionTest.test_stored_xss_in_reviews_escaped)
Уязвимость 6: Stored XSS в отзывах нейтрализован экранированием HTML ... ok
test_delete_of_fixture_root_stays_inside_exercise (test_service.SandboxTest.test_delete_of_fixture_root_stays_inside_exercise) ... ok
test_external_directory_cannot_be_deleted (test_service.SandboxTest.test_external_directory_cannot_be_deleted) ... ok
test_parent_paths_cannot_escape_exercise (test_service.SandboxTest.test_parent_paths_cannot_escape_exercise) ... ok
test_symlink_cannot_escape_exercise (test_service.SandboxTest.test_symlink_cannot_escape_exercise) ... skipped
test_assistant_can_return_own_receipt (test_service.ShopTest.test_assistant_can_return_own_receipt) ... ok
test_customer_can_buy_at_catalog_price (test_service.ShopTest.test_customer_can_buy_at_catalog_price) ... ok
test_health_and_catalog (test_service.ShopTest.test_health_and_catalog) ... ok
test_own_profile_and_receipt (test_service.ShopTest.test_own_profile_and_receipt) ... ok
test_review_can_be_submitted_and_viewed (test_service.ShopTest.test_review_can_be_submitted_and_viewed) ... ok
test_staff_can_export_with_staff_session (test_service.ShopTest.test_staff_can_export_with_staff_session) ... ok
test_tokens_identify_distinct_users (test_service.ShopTest.test_tokens_identify_distinct_users) ... ok
test_unknown_product_rejected (test_service.ShopTest.test_unknown_product_rejected) ... ok
test_wrong_password_rejected (test_service.ShopTest.test_wrong_password_rejected) ... ok

----------------------------------------------------------------------
Ran 28 tests in 0.729s

OK (skipped=1)
```

---

## 4. Выводы по результатам защиты сервиса

1. **Принцип Defense-in-Depth:**
   Ключевой урок интеграции AI-агентов заключается в том, что языковая модель не может являться границей доверия. Защита от prompt injection должна обязательно подкрепляться строгой авторизацией на уровне серверного кода (Tool RBAC) и изоляцией файловых путей.
2. **Безопасность бизнес-логики:**
   Все критические атрибуты транзакций (цены товаров, роли пользователей, идентификаторы сессий) должны генерироваться и проверяться исключительно на сервере.
3. **Соответствие 152-ФЗ:**
   Благодаря закрытию SQL-инъекций, внедрению аутентификации на экспорт и изоляции профилей пользователей исключена угроза утечки персональных данных покупателей.

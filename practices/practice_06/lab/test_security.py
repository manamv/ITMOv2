"""Security regression test suite proving mitigations for all reported vulnerabilities."""

import unittest
from service import Shop


class SecurityRegressionTest(unittest.TestCase):
    def setUp(self):
        self.shop = Shop()
        self.addCleanup(self.shop.close)

    def request(self, method, path, body=None, headers=None):
        with self.shop.lock:
            return self.shop.dispatch(method, path, body or {}, headers or {})

    def login(self, username="alice", password="learn-alice"):
        status, result = self.request("POST", "/login", {"username": username, "password": password})
        self.assertEqual(status, 200)
        return {"X-Token": result["token"]}

    def test_sqli_profile_blocked_and_treated_as_literal(self):
        """Уязвимость 1: SQL-инъекция в /profile нейтрализована параметризацией"""
        auth = self.login("alice", "learn-alice")
        status, rows = self.request("GET", "/profile?id=1%20OR%201=1", headers=auth)
        self.assertEqual(status, 200)
        # Пользователь видит только свою запись, инъекция не развернулась
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["name"], "TEST_ALICE")

    def test_sqli_search_parameterized_and_restricted(self):
        """Уязвимость 1: Поиск параметризован и изолирован по пользователю"""
        auth = self.login("alice", "learn-alice")
        # Попытка инъекции '% OR 1=1 --
        status, rows = self.request("GET", "/search?q=%27%20OR%201=1%20--", headers=auth)
        self.assertEqual(status, 200)
        self.assertEqual(len(rows), 0)

    def test_idor_orders_blocked_for_other_users(self):
        """Уязвимость 2: BOLA / IDOR в /orders заблокирован (Alice видит только свой заказ)"""
        alice_auth = self.login("alice", "learn-alice")
        status, orders = self.request("GET", "/orders", headers=alice_auth)
        self.assertEqual(status, 200)
        self.assertEqual(len(orders), 1)
        self.assertEqual(orders[0]["owner"], 1)
        self.assertEqual(orders[0]["product"], "chair")

    def test_idor_profile_cannot_view_other_users(self):
        """Уязвимость 2: Запрет просмотра чужого профиля клиентом"""
        alice_auth = self.login("alice", "learn-alice")
        status, res = self.request("GET", "/profile?id=2", headers=alice_auth)
        self.assertEqual(status, 403)
        self.assertIn("forbidden", res["error"])

    def test_header_spoofing_x_role_rejected(self):
        """Уязвимость 3: Подмена роли через заголовок X-Role без сессии staff блокируется"""
        # 1. Попытка неавторизованного запроса с X-Role: staff
        status, res = self.request("GET", "/admin/export", headers={"X-Role": "staff"})
        self.assertEqual(status, 403)

        # 2. Попытка клиента Alice с заголовком X-Role: staff
        alice_auth = {**self.login("alice", "learn-alice"), "X-Role": "staff"}
        status, res = self.request("GET", "/admin/export", headers=alice_auth)
        self.assertEqual(status, 403)

    def test_price_tampering_ignored(self):
        """Уязвимость 4: Манипуляция ценой игнорируется, применяется цена каталога"""
        auth = self.login("alice", "learn-alice")
        # Пытаемся купить стул (5000 руб) за 0.01 руб
        status, order = self.request("POST", "/orders", {"product": "chair", "price": 0.01}, headers=auth)
        self.assertEqual(status, 201)
        self.assertEqual(order["price"], 5000)

    def test_path_traversal_and_cross_user_file_blocked(self):
        """Уязвимость 5: Чтение чужого чека и приватной заметки блокируется"""
        auth = self.login("alice", "learn-alice")
        
        # 1. Попытка прочитать чек Bob
        status, _ = self.request("GET", "/files?user=bob&path=receipt.txt", headers=auth)
        self.assertEqual(status, 403)

        # 2. Попытка path traversal к секрету оператора
        status, _ = self.request("GET", "/files?user=../private&path=operator-note.txt", headers=auth)
        self.assertIn(status, (400, 403))

    def test_stored_xss_in_reviews_escaped(self):
        """Уязвимость 6: Stored XSS в отзывах нейтрализован экранированием HTML"""
        auth = self.login("alice", "learn-alice")
        payload = "<script>alert('xss')</script>"
        status, _ = self.request("POST", "/reviews", {"product": "chair", "text": payload}, headers=auth)
        self.assertEqual(status, 201)

        status, html_content = self.request("GET", "/reviews/view", headers=auth)
        self.assertEqual(status, 200)
        self.assertNotIn("<script>", html_content)
        self.assertIn("&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;", html_content)

    def test_debug_logs_restricted_to_staff(self):
        """Уязвимость 7: Доступ к /debug/logs закрыт для клиентов и неавторизованных лиц"""
        # Без логина
        self.assertEqual(self.request("GET", "/debug/logs")[0], 403)
        # Обычный клиент
        alice_auth = self.login("alice", "learn-alice")
        self.assertEqual(self.request("GET", "/debug/logs", headers=alice_auth)[0], 403)
        # Сотрудник
        staff_auth = self.login("staff", "learn-staff")
        status, logs = self.request("GET", "/debug/logs", headers=staff_auth)
        self.assertEqual(status, 200)
        # Проверяем, что токены в логах скрыты
        for log in logs:
            if "X-Token" in log.get("headers", {}):
                self.assertEqual(log["headers"]["X-Token"], "[REDACTED]")

    def test_assistant_cannot_read_operator_secret(self):
        """Уязвимость 8 и 9: Исполнение read_file ограничено каталогом текущего пользователя"""
        auth = self.login("alice", "learn-alice")
        status, res = self.request("POST", "/assistant/execute", {
            "decision": {"tool": "read_file", "arguments": {"path": "private/operator-note.txt"}}
        }, headers=auth)
        self.assertEqual(status, 403)
        self.assertIn("forbidden", res["error"])

    def test_assistant_cannot_delete_tree_for_regular_user(self):
        """Уязвимость 9: Деструктивный инструмент delete_tree запрещен для обычных клиентов"""
        auth = self.login("alice", "learn-alice")
        status, res = self.request("POST", "/assistant/execute", {
            "decision": {"tool": "delete_tree", "arguments": {"path": "."}}
        }, headers=auth)
        self.assertEqual(status, 403)
        self.assertIn("forbidden", res["error"])

    def test_assistant_cannot_export_profiles_for_regular_user(self):
        """Уязвимость 9: Инструмент export_profiles запрещен для обычных клиентов"""
        auth = self.login("alice", "learn-alice")
        status, res = self.request("POST", "/assistant/execute", {
            "decision": {"tool": "export_profiles", "arguments": {}}
        }, headers=auth)
        self.assertEqual(status, 403)
        self.assertIn("forbidden", res["error"])


if __name__ == "__main__":
    unittest.main()

"""
Тестирование MCP-сервера VkusMart.
Проверяет:
- JSON-RPC протокол (initialize, tools/list, tools/call)
- Успешные сценарии вызовов инструментов
- Обработку ошибочного входа с валидацией и кодами ошибок
"""

import unittest
import json
from mcp_server.server import process_jsonrpc_request, handle_call_tool

class MCPServerTestCase(unittest.TestCase):
    def test_jsonrpc_initialize(self):
        req = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}})
        resp_raw = process_jsonrpc_request(req)
        self.assertIsNotNone(resp_raw)
        resp = json.loads(resp_raw)
        self.assertEqual(resp["id"], 1)
        self.assertIn("capabilities", resp["result"])
        self.assertEqual(resp["result"]["serverInfo"]["name"], "vkusmart-smart-grocery-mcp")

    def test_jsonrpc_tools_list(self):
        req = json.dumps({"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}})
        resp_raw = process_jsonrpc_request(req)
        resp = json.loads(resp_raw)
        tools = resp["result"]["tools"]
        tool_names = [t["name"] for t in tools]
        self.assertIn("get_theme_bundles", tool_names)
        self.assertIn("search_products", tool_names)
        self.assertIn("calculate_cart_nutrition", tool_names)

    def test_tool_get_theme_bundles_success(self):
        result = handle_call_tool("get_theme_bundles", {"theme_id": "theme-student", "max_budget": 500.0})
        self.assertFalse(result["isError"])
        payload = json.loads(result["content"][0]["text"])
        self.assertIn("bundles", payload)
        self.assertEqual(len(payload["bundles"]), 1)
        bundle = payload["bundles"][0]
        self.assertEqual(bundle["id"], "theme-student")
        self.assertTrue(bundle["is_within_budget"])
        self.assertGreater(bundle["products_count"], 0)

    def test_tool_search_products_success(self):
        result = handle_call_tool("search_products", {"query": "индейка", "exclude_allergens": ["lactose"]})
        self.assertFalse(result["isError"])
        payload = json.loads(result["content"][0]["text"])
        self.assertGreaterEqual(payload["count"], 1)
        item = payload["products"][0]
        self.assertIn("индейк", item["name"].lower())
        self.assertNotIn("lactose", item["allergens"])

    def test_tool_calculate_cart_nutrition_success(self):
        result = handle_call_tool("calculate_cart_nutrition", {
            "items": [
                {"product_id": "prod-1", "quantity": 2},
                {"product_id": "prod-2", "quantity": 1}
            ]
        })
        self.assertFalse(result["isError"])
        payload = json.loads(result["content"][0]["text"])
        cart = payload["cart"]
        self.assertEqual(cart["total_items"], 3)
        self.assertGreater(cart["final_price"], 0)
        self.assertGreater(cart["total_calories"], 0)
        self.assertGreater(cart["protein"], 0)

    # ==========================================================
    # Тесты обработки ошибочного входа (Error Handling)
    # ==========================================================

    def test_error_empty_search_query(self):
        """Проверка ошибочного входа: пустая строка поиска"""
        result = handle_call_tool("search_products", {"query": "   "})
        self.assertTrue(result["isError"])
        payload = json.loads(result["content"][0]["text"])
        self.assertTrue(payload["error"])
        self.assertEqual(payload["code"], "EMPTY_QUERY")

    def test_error_short_search_query(self):
        """Проверка ошибочного входа: строка из 1 символа"""
        result = handle_call_tool("search_products", {"query": "а"})
        self.assertTrue(result["isError"])
        payload = json.loads(result["content"][0]["text"])
        self.assertTrue(payload["error"])
        self.assertEqual(payload["code"], "QUERY_TOO_SHORT")

    def test_error_invalid_negative_budget(self):
        """Проверка ошибочного входа: отрицательный бюджет"""
        result = handle_call_tool("get_theme_bundles", {"max_budget": -200.0})
        self.assertTrue(result["isError"])
        payload = json.loads(result["content"][0]["text"])
        self.assertTrue(payload["error"])
        self.assertEqual(payload["code"], "INVALID_BUDGET")

    def test_error_unknown_category(self):
        """Проверка ошибочного входа: несуществующая категория"""
        result = handle_call_tool("search_products", {"category": "cosmetics_and_shampoo"})
        self.assertTrue(result["isError"])
        payload = json.loads(result["content"][0]["text"])
        self.assertTrue(payload["error"])
        self.assertEqual(payload["code"], "UNKNOWN_CATEGORY")

    def test_error_product_not_found_in_cart(self):
        """Проверка ошибочного входа: несуществующий product_id"""
        result = handle_call_tool("calculate_cart_nutrition", {
            "items": [{"product_id": "non_existing_product_999", "quantity": 1}]
        })
        self.assertTrue(result["isError"])
        payload = json.loads(result["content"][0]["text"])
        self.assertTrue(payload["error"])
        self.assertEqual(payload["code"], "PRODUCT_NOT_FOUND")

if __name__ == "__main__":
    unittest.main()

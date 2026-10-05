#!/usr/bin/env python3
"""
HTTP API и веб-сервер для VkusMart.
Работает на базе встроенного http.server (без тяжелых внешних зависимостей).
Обслуживает фронтенд и REST/MCP прокси эндпоинты.
"""

import sys
import os
import json
import mimetypes
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from pathlib import Path

from app.catalog import PRODUCTS, THEMES, PRODUCTS_BY_ID, THEMES_BY_ID, CATEGORIES, ALLERGENS_LIST
from app.services import search_products, get_theme_bundles, calculate_cart_nutrition, ServiceError
from mcp_server.server import handle_call_tool, TOOLS_METADATA

STATIC_DIR = Path(__file__).resolve().parent / "static"

class VkusMartHTTPHandler(BaseHTTPRequestHandler):
    def send_json(self, data: Any, status: int = 200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/" or path == "/index.html":
            self.serve_file(STATIC_DIR / "index.html", "text/html; charset=utf-8")
        elif path.startswith("/static/"):
            rel_path = path[len("/static/"):]
            file_path = STATIC_DIR / rel_path
            mime, _ = mimetypes.guess_type(str(file_path))
            self.serve_file(file_path, mime or "application/octet-stream")
        elif path == "/api/catalog":
            self.send_json({
                "products": [p.to_dict() for p in PRODUCTS],
                "themes": [t.to_dict() for t in THEMES],
                "categories": CATEGORIES,
                "allergens": ALLERGENS_LIST
            })
        elif path == "/api/themes":
            query_params = parse_qs(parsed.query)
            max_budget = float(query_params["max_budget"][0]) if "max_budget" in query_params else None
            allergens = query_params.get("exclude_allergens", [])
            bundles = get_theme_bundles(max_budget=max_budget, exclude_allergens=allergens)
            self.send_json({"bundles": bundles})
        elif path == "/api/mcp/tools":
            self.send_json({"tools": TOOLS_METADATA})
        else:
            self.send_error(404, "Not Found")

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b"{}"

        try:
            payload = json.loads(post_data.decode("utf-8")) if post_data else {}
        except Exception:
            payload = {}

        if parsed.path == "/api/search":
            try:
                results = search_products(
                    query=payload.get("query"),
                    category=payload.get("category"),
                    max_price=payload.get("max_price"),
                    max_calories=payload.get("max_calories"),
                    exclude_allergens=payload.get("exclude_allergens")
                )
                self.send_json({"products": results, "count": len(results)})
            except ServiceError as se:
                self.send_json(se.to_dict(), status=400)

        elif parsed.path == "/api/cart/calculate":
            try:
                items = payload.get("items", [])
                cart = calculate_cart_nutrition(items)
                self.send_json({"cart": cart})
            except ServiceError as se:
                self.send_json(se.to_dict(), status=400)

        elif parsed.path == "/api/mcp/call":
            tool_name = payload.get("name")
            arguments = payload.get("arguments", {})
            
            # Если инструмент из официального ВкусВилл MCP
            if tool_name and tool_name.startswith("vkusvill_"):
                from mcp_server.vkusvill_client import call_vkusvill_remote_tool
                remote_res = call_vkusvill_remote_tool(tool_name, arguments)
                self.send_json(remote_res.get("raw_jsonrpc", remote_res))
            else:
                mcp_res = handle_call_tool(tool_name, arguments)
                self.send_json(mcp_res)

        elif parsed.path == "/api/vkusvill/search":
            query_params = parse_qs(parsed.query)
            q = query_params.get("q", [""])[0]
            from mcp_server.vkusvill_client import search_vkusvill_products
            res = search_vkusvill_products(q)
            self.send_json(res)

        else:
            self.send_error(404, "Unknown POST endpoint")

    def serve_file(self, file_path: Path, content_type: str):
        if not file_path.is_file():
            self.send_error(404, "File Not Found")
            return
        with open(file_path, "rb") as f:
            content = f.read()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

def run_server(port: int = 8000):
    server_address = ("127.0.0.1", port)
    httpd = HTTPServer(server_address, VkusMartHTTPHandler)
    print(f"VkusMart Web & API server running at http://127.0.0.1:{port}/")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)

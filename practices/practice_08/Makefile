# Практика 8 — готовые команды для защиты (см. DEFENSE.md)
APP_DIR ?= D:/linguatype

.PHONY: help up down smoke test build demo-hint

help:
	@echo "make up         - поднять Docker Compose (http://localhost:8080)"
	@echo "make down       - остановить контейнеры"
	@echo "make smoke      - проверить / и API (/api/topics, /api/stats, /api/music-lessons)"
	@echo "make test       - запустить 36 клиентских тестов Vitest"
	@echo "make build      - проверить TypeScript и production build"
	@echo "make demo-hint  - шпаргалка по порядку показа (12 баллов)"

up:
	cd $(APP_DIR) && docker compose up -d --build

down:
	cd $(APP_DIR) && docker compose down

smoke:
	@echo "Frontend :8080 ->" && curl -sS -o /dev/null -w "  HTTP %{http_code}\n" http://localhost:8080/
	@echo "Topics count   ->" && curl -sS http://localhost:8080/api/topics | grep -o '"id"' | wc -l
	@echo "Stats API      ->" && curl -sS -o /dev/null -w "  HTTP %{http_code}\n" http://localhost:8080/api/stats
	@echo "Music API      ->" && curl -sS -o /dev/null -w "  HTTP %{http_code}\n" http://localhost:8080/api/music-lessons

test:
	cd $(APP_DIR)/frontend && npm test -- --run

build:
	cd $(APP_DIR)/frontend && npm run build

demo-hint:
	@echo "1. Figma Design + design/mockup.html + PROMPTS_AND_AI_CONTRIBUTION.md (3 б.)"
	@echo "2. shadcn/ui + Tailwind v4 + index.css (1 б.)"
	@echo "3. http://localhost:8080: тема -> печать -> статистика -> квиз + Словарь (валидация, Tab, Empty/Error) (3 б.)"
	@echo "4. make test: 36/36 (doubleSubmit, formValidation, uiStates с моками, components, E2E) (5 б.)"

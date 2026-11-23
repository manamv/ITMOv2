# Практика 7.1 — готовые команды для защиты (см. DEFENSE.md)
# Нужны: make, curl, base64 (Git Bash / WSL / Linux / macOS). Windows: `winget install ezwinports.make`, запускать из Git Bash.
#
#   export GITHUB_TOKEN=ghp_xxx          # токен с правами repo
#   export REPO=owner/repo               # тестовый репозиторий (по умолчанию manamv/ITMOv2)

REPO  ?= manamv/ITMOv2
BASE  ?= main
PR    ?=
API    = https://api.github.com/repos/$(REPO)
CURL   = curl -sS -H "Authorization: Bearer $(GITHUB_TOKEN)" -H "Accept: application/vnd.github+json" -H "User-Agent: n8n-defense"

.PHONY: help check pr-open review-other review-main review-repeat show-comments table-hint models n8n-ping

help:
	@echo "make pr-open                 - создать тестовый PR (3 файла = 3 блока кода)"
	@echo "make review-other PR=<N>     - /make_other_ai_review (критерий 1 и 4)"
	@echo "make table-hint              - что показать в Data Table (критерий 2)"
	@echo "make review-main PR=<N>      - /make_ai_review; на уже проверенном PR ревью не запускается (критерий 3)"
	@echo "make show-comments PR=<N>    - число точечных комментариев в PR (критерий 4)"
	@echo "make models LITELLM_API_KEY=<key> - список моделей шлюза litellm.data-light.ru"
	@echo "make n8n-ping N8N_URL=<url>  - доступность n8n"

check:
	@test -n "$(GITHUB_TOKEN)" || (echo "Задайте GITHUB_TOKEN: export GITHUB_TOKEN=..." && exit 1)
	@echo "OK: REPO=$(REPO) BASE=$(BASE)"

# Три файла в одном PR -> три блока diff -> три точечных комментария.
pr-open: check
	@set -e; \
	SHA=$$($(CURL) $(API)/git/ref/heads/$(BASE) | grep -o '"sha": *"[^"]*"' | head -1 | cut -d'"' -f4); \
	test -n "$$SHA" || (echo "Не удалось получить sha ветки $(BASE)" && exit 1); \
	BR=defense-7-1-$$(date +%s); \
	$(CURL) -X POST $(API)/git/refs -d "{\"ref\":\"refs/heads/$$BR\",\"sha\":\"$$SHA\"}" > /dev/null; \
	put() { \
	  C=$$(printf '%b\n' "$$2" | base64 | tr -d '\n'); \
	  $(CURL) -X PUT $(API)/contents/defense_demo/$$BR/$$1 -d "{\"message\":\"test: $$1 for AI review\",\"content\":\"$$C\",\"branch\":\"$$BR\"}" > /dev/null; \
	}; \
	put auth.py 'import hashlib\nPASSWORD = "admin123"\ndef login(user, pwd):\n    return hashlib.md5(pwd.encode()).hexdigest() == PASSWORD'; \
	put db.py 'def find_user(cur, name):\n    cur.execute("SELECT * FROM users WHERE name = %s" % name)\n    return cur.fetchall()'; \
	put utils.py 'def parse(n):\n    return int(n) / 0 if n else None'; \
	$(CURL) -X POST $(API)/pulls -d "{\"title\":\"Defense demo $$BR\",\"head\":\"$$BR\",\"base\":\"$(BASE)\",\"body\":\"Тестовый PR для AI-ревью в n8n\"}" \
	  | grep -E '"(number|html_url)": ' | head -2; \
	echo "^ запомните number как PR=<N>"

review-other: check
	@test -n "$(PR)" || (echo "Укажите PR=<номер>" && exit 1)
	@$(CURL) -X POST $(API)/issues/$(PR)/comments -d '{"body":"/make_other_ai_review"}' | grep -E '"html_url"' | head -1

review-main: check
	@test -n "$(PR)" || (echo "Укажите PR=<номер>" && exit 1)
	@$(CURL) -X POST $(API)/issues/$(PR)/comments -d '{"body":"/make_ai_review"}' | grep -E '"html_url"' | head -1

# Повторный запуск того же PR — тот же эффект, что review-main (удобный синоним для показа).
review-repeat: review-main

show-comments: check
	@test -n "$(PR)" || (echo "Укажите PR=<номер>" && exit 1)
	@echo "Точечных (inline) комментариев в PR #$(PR):"; \
	$(CURL) $(API)/pulls/$(PR)/comments | grep -c '"path":'; \
	$(CURL) $(API)/pulls/$(PR)/comments | grep -E '"(path|line)":' | paste - - | head -10

table-hint:
	@echo "n8n -> Data Tables -> reviewed_prs: ожидается строка pr_id=<N>, model=gpt-5-security (одна строка за запуск)"

models:
	@test -n "$(LITELLM_API_KEY)" || (echo "Задайте LITELLM_API_KEY" && exit 1)
	@curl -sS https://litellm.data-light.ru/v1/models -H "Authorization: Bearer $(LITELLM_API_KEY)" | grep -o '"id": *"[^"]*"'

n8n-ping:
	@test -n "$(N8N_URL)" || (echo "Задайте N8N_URL=https://..." && exit 1)
	@curl -sS -o /dev/null -w "n8n healthz: %{http_code}\n" $(N8N_URL)/healthz

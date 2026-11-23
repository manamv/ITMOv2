# Практика 7.2 — готовые команды для защиты (см. DEFENSE.md)
# Нужны: make, curl (Git Bash / WSL / Linux / macOS).
#
#   export GITHUB_TOKEN=ghp_xxx          # токен с правами repo
#   export REPO=owner/repo               # тестовый репозиторий (по умолчанию manamv/ITMOv2)

REPO ?= manamv/ITMOv2
API   = https://api.github.com/repos/$(REPO)
CURL  = curl -sS -H "Authorization: Bearer $(GITHUB_TOKEN)" -H "Accept: application/vnd.github+json" -H "User-Agent: n8n-defense"

.PHONY: help check issue-bug issue-feature issue-task issue-vague issues-list weekly-hint

help:
	@echo "make issue-bug      - создать Issue про баг (критерий 1)"
	@echo "make issue-feature  - создать Issue про фичу (критерий 1)"
	@echo "make issue-task     - создать Issue про задачу (критерий 1)"
	@echo "make issue-vague    - создать неясный Issue для needs-triage без комментария (критерий 2)"
	@echo "make issues-list    - показать последние 6 Issues и их лейблы"
	@echo "make weekly-hint    - чек-лист ручного запуска Workflow 2 (критерии 4-9)"

check:
	@test -n "$(GITHUB_TOKEN)" || (echo "Задайте GITHUB_TOKEN: export GITHUB_TOKEN=..." && exit 1)
	@echo "OK: REPO=$(REPO)"

issue-bug: check
	@$(CURL) -X POST $(API)/issues -d '{"title":"[Test Bug] App crashes with 500 error on login","body":"Steps to reproduce: open /login, submit valid credentials, server throws NullReferenceException and returns HTTP 500. Expected: HTTP 200 redirect."}' \
	  | grep -E '"(number|html_url)":' | head -2

issue-feature: check
	@$(CURL) -X POST $(API)/issues -d '{"title":"[Feature Request] Add dark/light theme switcher in settings","body":"Please add a toggle button in the top navigation bar so users can switch between dark cyber-glass theme and light mode and persist preference in localStorage."}' \
	  | grep -E '"(number|html_url)":' | head -2

issue-task: check
	@$(CURL) -X POST $(API)/issues -d '{"title":"[Docs Task] Update README with Docker Compose ports","body":"Could you update the README documentation to clarify that frontend runs on port 8080 and backend API listens on port 5000?"}' \
	  | grep -E '"(number|html_url)":' | head -2

issue-vague: check
	@$(CURL) -X POST $(API)/issues -d '{"title":"???","body":"idk something weird happened maybe yesterday or not, pls check"}' \
	  | grep -E '"(number|html_url)":' | head -2

issues-list: check
	@$(CURL) "$(API)/issues?state=all&per_page=6" | grep -E '"(number|title|name|comments)":' | head -30

weekly-hint:
	@echo "1. n8n -> Data Tables -> weekly_stats: убедитесь, что есть минимум 1 прошлая запись (для delta)."
	@echo "2. Откройте Workflow 2 (Weekly Issues Analytics) и нажмите Execute workflow."
	@echo "3. Проверьте Execution: Fetch Issues -> Group Stats -> Calculate Deltas -> AI Commentary -> Save Stats -> Email."
	@echo "4. Покажите письмо в почте и новую строку в Data Table weekly_stats."

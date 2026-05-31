# ──────────────────────────────────────────────
# AI-Powered Financial Document Similarity Finder
# Makefile — Local development commands
# ──────────────────────────────────────────────

.PHONY: help up down build logs restart clean test

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Docker Compose ───

up: ## Start all services
	docker compose up -d

up-build: ## Build and start all services
	docker compose up -d --build

down: ## Stop all services
	docker compose down

restart: ## Restart all services
	docker compose restart

logs: ## Tail logs from all services
	docker compose logs -f

logs-backend: ## Tail backend logs
	docker compose logs -f backend

logs-embedding: ## Tail embedding service logs
	docker compose logs -f embedding-service

logs-frontend: ## Tail frontend logs
	docker compose logs -f frontend

clean: ## Stop services and remove volumes (WARNING: deletes all data)
	docker compose down -v --remove-orphans

status: ## Show service status
	docker compose ps

# ─── Development ───

dev-backend: ## Run backend locally (requires Java 21)
	cd backend && ./mvnw spring-boot:run

dev-frontend: ## Run frontend locally (requires Node 18+)
	cd frontend && npm run dev

dev-embedding: ## Run embedding service locally (requires Python 3.10+)
	cd embedding-service && uvicorn main:app --reload --port 5000

# ─── Testing ───

test: ## Run all tests
	cd backend && ./mvnw test
	cd embedding-service && python -m pytest tests/ -v
	cd frontend && npm test

test-backend: ## Run backend tests
	cd backend && ./mvnw test

test-embedding: ## Run embedding service tests
	cd embedding-service && python -m pytest tests/ -v

test-frontend: ## Run frontend tests
	cd frontend && npm test

# ─── Database ───

db-shell: ## Open PostgreSQL shell
	docker compose exec postgres psql -U fdsf_user -d fdsf_db

db-migrate: ## Run Flyway migrations
	cd backend && ./mvnw flyway:migrate

# ─── Setup ───

setup: ## Initial project setup
	cp -n .env.example .env || true
	@echo "✅ .env file created. Edit it with your settings."
	@echo "Run 'make up-build' to start all services."

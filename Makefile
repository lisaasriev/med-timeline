.PHONY: up down migrate seed runserver 

# Start docker container
up:
	docker-compose up -d

# Stop docker container
down:
	docker-compose down

# Run Django migrations
migrate:
	cd backend && source venv/bin/activate && python manage.py migrate

# Seed mock data
seed:
	cd backend && source venv/bin/activate && python manage.py seed_data

# Run Django dev server
runserver:
	cd backend && source venv/bin/activate && python manage.py runserver

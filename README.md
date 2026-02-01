# 💊 Medication Timeline

A mini web app for visualizing patient prescriptions over time. 

## Tech Stack

- **Frontend:** React + TypeScript  
- **Backend:** Django REST API  
- **Database:** PostgreSQL  


## Current Features

- Ordered view of prescriptions
- Detection of different facilities, dose changes, and source priorities
- Filtering by patient, status, and date range


## Setup / Installation

### Prerequisites
- [Docker](https://www.docker.com/get-started) and Docker Compose installed
- Node.js >= 18
- Python 3.10+ (for backend virtual environment)

### 1. Clone the repository
```bash
git clone https://github.com/lisaasriev/med-timeline.git
cd med-timeline
```

### 2. Start docker container for Postgres database
```bash
make up
```

### 2i. To stop docker container:
```bash
make down
```

### 3. Set up backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
```

### 3i. Run migrations to setup database
```bash
make migrate
```

### 3ii. Seed mock data (optional)
```bash
make seed
```

### 3iii. Run Django web server
Locally, the backend is hosted on port 8000 (http://localhost:8000)
```bash
make runserver
```

### 4. Set up frontend
```bash
cd frontend
npm install
```

### 4i. Run React web server
Locally, the frontend is hosted on port 3000 (http://localhost:3000)
```
npm start
```

## Reflection Questions

### What decisions did I make regarding:
#### I) Data modeling?

#### II) Tradeoffs?

#### III) Features to include/exclude?

### What challenges did I face?

### How did I use AI during the development process?

### What improvements would I consider in the future?



# 💊 Medication Timeline

A mini web app for visualizing patient prescriptions over a period of time. 

![Main](/images/main-ss.png)
Img 1. Main page

## Tech Stack

- **Frontend:** React + TypeScript  
- **Backend:** Django REST Framework
- **Database:** PostgreSQL  


## Current Features

- Ordered view of prescriptions, grouped by medication 
- Detection of different facilities, dose changes, and source priorities
- Filtering by patient, prescription status, and date range

![Example](/images/example-ss.png)
Img 2. Example of some of the current features 

## ❗️❗️ Note ❗️❗️

Currently, both the project frontend and backend are deployed on free versions of Vercel and Render respectively, and initial request processing may be very slow (something I hope to resolve in the future). 

When viewing the deployed project for the first time, requests sent to the backend may take **~50s** to process, after which the timeline will be populated with prescription cards and any immediate subsequent interactions will proceed at a much faster rate.


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

### 2. Set up .env files in both the frontend and backend directories
Refer to the .env.example files on how the environment variables and their values should be set up. 

### 3. Start up Docker container for Postgres database
```bash
make up
```

### 3i. To stop Docker container:
```bash
make down
```

### 4. Set up backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
```

### 4i. Run migrations to setup database
```bash
make migrate
```
Note: make commands should be run from the project root, and not the backend and/or frontend directories since the Makefile is in the root.


### 4ii. Seed mock data (optional)
```bash
make seed
```
Note: Aside from adding more entries to the seed script, feel free to use [DBeaver](https://dbeaver.io/) to add/edit portions of the local mock data.

### 4iii. Run Django web server
Locally, the backend is hosted on port 8000 (http://localhost:8000)
```bash
make runserver
```

### 5. Set up frontend
```bash
cd frontend
npm install
```

### 5i. Run React web server
Locally, the frontend is hosted on port 3000 (http://localhost:3000)
```
npm start
```

## Reflection Questions

### What decisions did I make regarding:
#### I) Data modeling?

My goal was to make a simple, reliable data model which would be easy to adapt and build upon in the future. Three of the five currently existing tables were decided on almost immediately, since it was easy to picture entity models with states and traits for them (`facilities`, `patients`, and `medications`). Currently, these tables are minimal, but if I wanted to add additional info to any of them, it would be easy to do so without potentially breaking anything else. 

`sources` is made for handling a number of the given edge cases (it can be used to handle 3+ of them as an option), by creating a hierarchy of priorities for prescriptions based on their source `type` and `confidence`. As a result, if there are conflicting/differing records, `sources` can be used to resolve some of those conflicts through prioritization. Plus, it can be further modified for handling future edge cases and conflicts.

`prescriptions` consolidates all of the aforementioned info into one table. This makes it easy to keep track of all entries, including those with changed doses and statuses (for example, having 2 separate entries for dose changes allows us to track them without overwritting and losing any data). Additionally, foreign keys to the other four tables offer efficient and comprehensive data fetching, improving efficiency and ease of use in the code. 

The current data model is quite basic, but easy to build upon. Something that I thought about (but haven't yet reached a definitive conclusion on) is how to handle missing/incomplete date info. `end_date` can accept empty values, but it's unclear whether they should be interpreted as current/ongoing or unknown. A possible solution for that could be relying on status field info (active, stopped, unknown), but that is something I'm still thinking about.

![Schema](/images/schema.png)
Img. 3 Super rough schema for the project data (TO DO: update final version)

#### II) Tradeoffs?

Simplicity vs comprehensiveness was the main tradeoff I had to consider throughout the development process, for both the frontend and backend aspects of the project. Given the nature and time frame of the task, I chose to prioritize creating a simple yet reliable foundation sufficient for my current goals, rather than adding any extra features or info that would otherwise be nice to have. 

For that reason, my data model objects are super simple at the moment (I considered adding info like age and sex to `patients`, or populating facility `address` fields, which remained empty for this task), but they serve as a good starting point for future work. Furthermore, I chose to only add support for reading data (hence why i chose to extend `ReadOnlyModelViewSet` for my views rather than `ModelViewSet`), in order to establish a working readonly version before adding data writing support. 

#### III) Features to include/exclude?

As mentioned above, I chose to keep my current version of the project simple and foundational, without the option of adding/editing data from the client side. I also chose to implement a list view rather than a timeline (I experimented with [react-chrono](https://react-chrono.prabhumurthy.com/) for a bit, but I found myself spending a bit too much time on UI at that point, so ultimately I chose to stick with a list view for v.1). My goal was to make data viewing ordered and clear, with hints, deliberate styling, and filters.

### What challenges did I face?

The main challenge was that I started this project completely unfamiliar with Django and React 😅. I've worked with Python and vanilla JS previously, as well as web development frameworks such as [Symfony](https://symfony.com/), but given that this was my first project with Django and React, there was certainly a good amount of time spent reading the framework docs and learning how to code with them. As a result, there may be certain implementations that I could've handled more neatly, but hopefully as I continue to work with Django and React, my code quality will improve.

This was also my first time deploying my own work entirely by myself, which was also an unfamiliar yet interesting experience for me.


### How did I use AI during the development process?

I used ChatGPT mainly for asking questions that arose from reading the Django and React docs. This allowed me to more deeply understand not just the how but also the why behind the code that I was writing. I also asked a lot of questions to help myself brainstorm better, something along the lines of "I have an idea X for solving/accomplishing task Y. What are some possible benefits/drawbacks to this idea, and is there anything that I am missing in my thought process?".

I also used ChatGPT for simple debugging and explaining specific error messages. 

### What improvements would I consider in the future?

Firstly, I would like to resolve the long data fetching time on the deployed project 😅.

#### I) Immediate improvements

- Refine prioritization calculation logic
- Improved edge case visualization on cards (make it more differentiable and scalable, especially if the number of edge cases increases)
- Make medication groups on the UI more obvious and disctinct


#### II) Future features
- Add/edit medication cards + make the cards expandable
- Render an actual timeline view rather than a list
- Add separate views for patients and doctors/administrators
- Add more info and special cases to prescriptions
- Add viewing support for different screen dimensions



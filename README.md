# Interview solution for Appointment Scheduling

## About the solution

This solution is a simple Django application that allows users to book and cancel appointments. The Frontend is a React App that allows a user to view the calendar and book/cancel appointments. The backend is a Django application that allows a user to create, read, update and delete appointments.

## Run the backend

The backend is a standard Django application, and may be run with the standard Django `manage.py` script as follows:

```
cd python-django/interview_calendar/
./manage.py runserver
```

The backend runs on port `8000`.

The backend serves some stub data at the endpoints:

- `GET` `/api/users/`
- `GET` `/api/users/1/calendar/free`
- `POST` `/api/users/1/calendar/free`

The soution uses `SQLite` as the database as opposed to `PostgreSQL` since `SQLite` is a file-based database and does not require a server to run (hence its much simpler). You may need to run:

```
./manage.py migrate
```

### Creating mock data

```
# from interview-lead-backend-anand/python-django/interview_calendar directory
python manage.py populate_db
```

This will create data that looks relistic and testable.

### Running the tests

```
# from interview-lead-backend-anand/python-django/interview_calendar directory
python manage.py test
```

> I could not get Docker to run on my machine, so I used venv instead

## Run the frontend

Run it as follows:

```
cd python-django/interview-calendar-frontend/
npm run dev
```

The frontend runs on port `5173`.

### Running the tests

I have not added any automated tests for the UI for this exercise. We can use `jest` if required.

## Assumpotions and Simplifications

1. All slots are in 30 mins increments, starting 9 AM and ending 5 PM. Data cleaning is out of scope
2. We are only showing data for one week (a week up / down arrow can be added to parametrise the UI and APIs)
3. Slots can have three states - [AVAILABLE, UNAVAILABLE, BOOKED] ... for this exercise, marking a slot UNAVAILABLE upon a successful booking is sufficient (for a student to see their booking, we need to identify the students through a login flow etc)
4. We will only get data in 30 mins chunks, ie, for a 1 hr slot, it will come as two consecutive slots. In this case, `end`-time of the slot become irrelevent and is ignored
5. I deivaited fro the given UI since I wanted to make the UI ready for both booking and cancelling (UI in the specs cannot be used for cancelling)
6. The UI is responsive and works on mobile, tablet and desktop. A proper UI on mobile would require a different UI for the calendar view (modelled around the design of Google / Apple Calendar)

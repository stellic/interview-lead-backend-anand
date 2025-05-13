# Interview Solution for Appointment Scheduling

## About the Solution

This solution is a simple Django application that allows users to book and cancel appointments. The Frontend is a React App that enables users to view the calendar and book/cancel appointments. The backend is a Django application that allows users to create, read, update, and delete appointments.

## Run the Backend

The backend is a standard Django application and may be run with the standard Django `manage.py` script as follows:

```
cd python-django/interview_calendar/
./manage.py runserver
```

The backend runs on port `8000`.

The backend serves data at the following endpoints:

- `GET` `/api/users/`
- `GET` `/api/users/1/calendar/free/`
- `POST` `/api/users/1/calendar/free/`

The solution uses `SQLite` as the database instead of `PostgreSQL` since `SQLite` is a file-based database and does not require a server to run (making it much simpler). You may need to run:

```
./manage.py migrate
```

### Creating Mock Data

```
# from python-django/interview_calendar directory
python manage.py populate_db
```

This will create data that looks realistic and is testable.

### Running the Tests

```
# from python-django/interview_calendar directory
python manage.py test
```

> I could not get Docker to run on my machine, so I used venv instead.

## Run the Frontend

Run it as follows:

```
cd python-django/interview-calendar-frontend/
npm run dev
```

The frontend runs on port `5173`.

### Running the Tests

I have not added any automated tests for the UI for this exercise. We can use `jest` if required.

## Assumptions and Simplifications

1. All slots are in 30-minute increments, starting at 9 AM and ending at 5 PM. Data cleaning is out of scope.
2. We are only showing data for one week (a week up/down arrow can be added to parameterize the UI and APIs).
3. Slots can have three states - [AVAILABLE, UNAVAILABLE, BOOKED]. For this exercise, marking a slot UNAVAILABLE upon a successful booking is sufficient (for a student to see their booking, we would need to identify students through a login flow, etc.).
4. We will only get data in 30-minute chunks; i.e., for a 1-hour slot, it will come as two consecutive slots. In this case, the `end` time of the slot becomes irrelevant and is ignored.
5. I deviated from the given UI since I wanted to make the UI ready for both booking and cancelling (the UI in the specs cannot be used for cancelling).
6. The UI is responsive and works on mobile, tablet, and desktop. The mobile view presents days in a vertical list, and users can tap on a day to see and interact with that day's time slots.

# Interview for Appointment Scheduling

## Run using Codespace

Feel free to run the project inside of Github Codespace which sets up all the dependencies in a VSCode dev container:

1. `Code` -> `Codespaces` -> `New with options...`
2. Select the branch you want to use
3. Choose `Python 3, Django, Node.js LTS, React Router, and PostgreSQ` for `Dev container configuration`
4. `Create codespace`
5. Wait for the space to spin up. use it in the web version of VSCode or in your local VSCode.

## Run the backend

The backend is a standard Django application, and may be run with the
standard Django `manage.py` script as follows:

```
cd python-django/interview_calendar/
./manage.py runserver
```

The backend runs on port `8000`.

The backend serves some stub data at the endpoints:

- `/api/users/`
- `/api/users/1/calendar/free`

When run in a dev container, the backend will be wired up to a PostgreSQL
database. You may need to run:

```
./manage.py migrate
```

in order to run the migrations needed to create database tables
needed by Django.

## Run the frontend

Run it as follows:

```
cd python-django/interview-calendar-frontend/
npm run dev
```

The frontend runs on port `5173`.

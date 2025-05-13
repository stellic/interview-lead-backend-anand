import datetime

from dateutil.relativedelta import *
import pytz

from .models import FreeTimeSlot

days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

# Keep this for initial data if the database is empty
user_relative_free_times: dict[int, list[dict[str, relativedelta]]] = {
    1: [
        # Monday
        { "start": relativedelta(hours=9), "end": relativedelta(hours=11) },  # 09:00 - 11:00
        { "start": relativedelta(hours=13), "end": relativedelta(hours=13, minutes=30) },  # 13:00 - 13:30
        { "start": relativedelta(hours=15), "end": relativedelta(hours=17) },  # 15:00 - 17:00
        # Tuesday
        { "start": relativedelta(days=1, hours=10), "end": relativedelta(days=1, hours=11) },  # 10:00 - 11:00
        { "start": relativedelta(days=1, hours=11, minutes=30), "end": relativedelta(days=1, hours=13) },  # 11:30 - 13:00
        { "start": relativedelta(days=1, hours=13, minutes=30), "end": relativedelta(days=1, hours=15) },  # 13:30 - 15:00
        { "start": relativedelta(days=1, hours=16, minutes=15), "end": relativedelta(days=1, hours=17) },  # 16:15 - 17:00
        # Wednesday
        { "start": relativedelta(days=2, hours=9), "end": relativedelta(days=2, hours=11) },  # 09:00 - 11:00
        { "start": relativedelta(days=2, hours=13), "end": relativedelta(days=2, hours=13, minutes=30) },  # 13:00 - 13:30
        { "start": relativedelta(days=2, hours=15), "end": relativedelta(days=2, hours=17) },  # 15:00 - 17:00
        # Thursday
        { "start": relativedelta(days=3, hours=10), "end": relativedelta(days=3, hours=11) },  # 10:00 - 11:00
        { "start": relativedelta(days=3, hours=11, minutes=30), "end": relativedelta(days=3, hours=13) },  # 11:30 - 13:00
        { "start": relativedelta(days=3, hours=13, minutes=30), "end": relativedelta(days=3, hours=15) },  # 13:30 - 15:00
        { "start": relativedelta(days=3, hours=16, minutes=15), "end": relativedelta(days=3, hours=17) },  # 16:15 - 17:00
        # Friday
        { "start": relativedelta(days=4, hours=12), "end": relativedelta(days=4, hours=17) },  # 12:00 - 17:00
    ],
}


def calendar_free(user_id: int) -> list[dict[str, str]]:
    """Get the available time slots for a user.

    Args:
        user_id (int): The id of the user.

    Returns:
        list: A list of available time slots.
    """
    # Check if we have slots in the database
    db_slots = FreeTimeSlot.objects.filter(user_id=user_id)
    
    # If we have slots in the database, use those
    if db_slots.exists():
        return [
            {
                "start": slot.start_time.isoformat(),
                "end": slot.end_time.isoformat(),
                "day_of_week": slot.day_of_week,
            }
            for slot in db_slots
        ]
    
    # Otherwise, use the hardcoded data
    pacific_timezone = pytz.timezone("US/Pacific")
    now_pacific_time = datetime.datetime.now(pacific_timezone)
    midnight_today_pacific_time = now_pacific_time.replace(hour=0, minute=0, second=0, microsecond=0)
    # Upcoming Monday, may be today if this is Monday
    upcoming_monday = midnight_today_pacific_time + relativedelta(weekday=MO(+1))

    relative_free_times = user_relative_free_times.get(user_id, [])

    return [
        {
            "start": to_utc_isoformat(upcoming_monday + relative_free_time["start"]),
            "end": to_utc_isoformat(upcoming_monday + relative_free_time["end"]),
            "day_of_week": days_of_week[
                to_utc(
                    upcoming_monday + relative_free_time["start"]
                ).weekday()
            ],
        }
        for relative_free_time in relative_free_times
    ]


def add_free_time_slot(user_id: int, start: str, end: str, day_of_week: str) -> dict:
    """Add a free time slot for a user.

    Args:
        user_id (int): The id of the user.
        start (str): The start time in ISO format.
        end (str): The end time in ISO format.
        day_of_week (str): The day of the week.

    Returns:
        dict: The created time slot.
    """
    # Parse the ISO format strings to datetime objects
    start_time = datetime.datetime.fromisoformat(start)
    end_time = datetime.datetime.fromisoformat(end)
    
    # Create a new free time slot
    slot = FreeTimeSlot.objects.create(
        user_id=user_id,
        start_time=start_time,
        end_time=end_time,
        day_of_week=day_of_week
    )
    
    return {
        "start": slot.start_time.isoformat(),
        "end": slot.end_time.isoformat(),
        "day_of_week": slot.day_of_week,
    }


def to_utc(dt: datetime.datetime) -> datetime.datetime:
    """Convert a datetime to a UTC datetime.

    Args:
        dt (datetime.datetime): The datetime to convert.

    Returns:
        datetime.datetime: The UTC datetime.
    """
    return dt.astimezone(pytz.utc)


def to_utc_isoformat(dt: datetime.datetime) -> str:
    """Convert a datetime to a UTC ISO format string.

    Args:
        dt (datetime.datetime): The datetime to convert.

    Returns:
        str: The UTC ISO format string.
    """
    return to_utc(dt).isoformat()


def book_time_slot(user_id: int, start: str, end: str, day_of_week: str) -> dict:
    """Book a time slot (remove it from available slots) for a user.

    Args:
        user_id (int): The id of the user.
        start (str): The start time in ISO format.
        end (str): The end time in ISO format.
        day_of_week (str): The day of the week.

    Returns:
        dict: The booked time slot information.
    """
    # Parse the ISO format strings to datetime objects
    start_time = datetime.datetime.fromisoformat(start)
    
    # Find and delete the matching slot
    try:
        # Find slots that match the criteria
        slot = FreeTimeSlot.objects.get(
            user_id=user_id,
            day_of_week=day_of_week,
            start_time__hour=start_time.hour,
            start_time__minute=start_time.minute
        )
        
        # Store the data before deleting
        slot_data = {
            "start": slot.start_time.isoformat(),
            "end": slot.end_time.isoformat(),
            "day_of_week": slot.day_of_week,
        }
        
        # Delete the slot (booking it)
        slot.delete()
        
        return slot_data
    except FreeTimeSlot.DoesNotExist:
        raise ValueError(f"No available slot found for {day_of_week} at {start_time.strftime('%H:%M')}")

def create_free_time_slot(user_id: int, start: str, end: str, day_of_week: str) -> dict:
    """Create a new free time slot for a user.

    Args:
        user_id (int): The id of the user.
        start (str): The start time in ISO format.
        end (str): The end time in ISO format.
        day_of_week (str): The day of the week.

    Returns:
        dict: The created time slot information.
    """
    # Parse the ISO format strings to datetime objects
    start_time = datetime.datetime.fromisoformat(start)
    end_time = datetime.datetime.fromisoformat(end)
    
    # Check if a slot already exists at this time
    existing_slot = FreeTimeSlot.objects.filter(
        user_id=user_id,
        day_of_week=day_of_week,
        start_time__hour=start_time.hour,
        start_time__minute=start_time.minute
    ).first()
    
    if existing_slot:
        raise ValueError(f"A slot already exists for {day_of_week} at {start_time.strftime('%H:%M')}")
    
    # Create a new free time slot
    slot = FreeTimeSlot.objects.create(
        user_id=user_id,
        start_time=start_time,
        end_time=end_time,
        day_of_week=day_of_week
    )
    
    return {
        "start": slot.start_time.isoformat(),
        "end": slot.end_time.isoformat(),
        "day_of_week": slot.day_of_week,
    }
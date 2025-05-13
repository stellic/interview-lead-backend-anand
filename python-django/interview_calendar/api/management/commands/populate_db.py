# Create a management command to populate the database
# Save this as interview_calendar/api/management/commands/populate_db.py

from django.core.management.base import BaseCommand
import datetime
from dateutil.relativedelta import *
import pytz

from api.models import FreeTimeSlot
from api.schedule import days_of_week

class Command(BaseCommand):
    help = 'Populates the database with initial free time slots'

    def handle(self, *args, **options):
        # Clear existing data
        FreeTimeSlot.objects.all().delete()
        
        # Get timezone info
        pacific_timezone = pytz.timezone("US/Pacific")
        now_pacific_time = datetime.datetime.now(pacific_timezone)
        midnight_today_pacific_time = now_pacific_time.replace(hour=0, minute=0, second=0, microsecond=0)
        # Upcoming Monday, may be today if this is Monday
        upcoming_monday = midnight_today_pacific_time + relativedelta(weekday=MO(+1))
        
        # Define time slots (30-minute intervals from 9:00 to 17:00)
        time_slots = []
        current_time = datetime.time(9, 0)  # Start at 9:00 AM
        end_time = datetime.time(17, 0)     # End at 5:00 PM
        
        while current_time < end_time:
            time_slots.append(current_time)
            # Add 30 minutes
            hour = current_time.hour
            minute = current_time.minute + 30
            if minute >= 60:
                hour += 1
                minute -= 60
            current_time = datetime.time(hour, minute)
        
        # Create slots for each day of the week
        count = 0
        user_id = 1  # Using user_id 1
        
        # For each day of the week (0=Monday, 6=Sunday)
        for day_offset in range(5):  # Monday to Friday
            day = upcoming_monday + datetime.timedelta(days=day_offset)
            day_of_week = days_of_week[day.weekday()]
            
            # For each time slot
            for time_slot in time_slots:
                # Skip some slots randomly to make it look realistic
                # Only skip about 20% of slots
                import random
                if random.random() < 0.2:
                    continue
                
                # Create the start and end times
                start_time = day.replace(
                    hour=time_slot.hour,
                    minute=time_slot.minute,
                    second=0,
                    microsecond=0
                )
                
                # End time is 30 minutes later
                end_time = start_time + datetime.timedelta(minutes=30)
                
                # Create the slot
                FreeTimeSlot.objects.create(
                    user_id=user_id,
                    start_time=start_time,
                    end_time=end_time,
                    day_of_week=day_of_week
                )
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {count} free time slots'))
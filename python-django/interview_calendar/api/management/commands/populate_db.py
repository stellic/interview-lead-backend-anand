# Create a management command to populate the database
# Save this as interview_calendar/api/management/commands/populate_db.py

from django.core.management.base import BaseCommand
import datetime
from dateutil.relativedelta import *
import pytz

from api.models import FreeTimeSlot
from api.schedule import user_relative_free_times, days_of_week

class Command(BaseCommand):
    help = 'Populates the database with initial free time slots'

    def handle(self, *args, **options):
        # Clear existing data
        FreeTimeSlot.objects.all().delete()
        
        # Get the hardcoded data
        pacific_timezone = pytz.timezone("US/Pacific")
        now_pacific_time = datetime.datetime.now(pacific_timezone)
        midnight_today_pacific_time = now_pacific_time.replace(hour=0, minute=0, second=0, microsecond=0)
        # Upcoming Monday, may be today if this is Monday
        upcoming_monday = midnight_today_pacific_time + relativedelta(weekday=MO(+1))
        
        count = 0
        for user_id, relative_free_times in user_relative_free_times.items():
            for relative_free_time in relative_free_times:
                start_time = upcoming_monday + relative_free_time["start"]
                end_time = upcoming_monday + relative_free_time["end"]
                day_of_week = days_of_week[start_time.weekday()]
                
                FreeTimeSlot.objects.create(
                    user_id=user_id,
                    start_time=start_time,
                    end_time=end_time,
                    day_of_week=day_of_week
                )
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {count} free time slots'))
from django.db import models

# Create your models here.

class FreeTimeSlot(models.Model):
    user_id = models.IntegerField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    day_of_week = models.CharField(max_length=10)
    
    def __str__(self):
        return f"{self.user_id} - {self.day_of_week} {self.start_time.strftime('%H:%M')} to {self.end_time.strftime('%H:%M')}"

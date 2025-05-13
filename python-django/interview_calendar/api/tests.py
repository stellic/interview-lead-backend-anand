from django.test import TestCase, Client
from django.urls import reverse
import json
from .models import FreeTimeSlot

class CalendarAPITestCase(TestCase):
    def setUp(self):
        # Create a test client
        self.client = Client()
        
        # Create some test data
        FreeTimeSlot.objects.create(
            user_id=1,
            start_time="2025-05-12T09:00:00+00:00",
            end_time="2025-05-12T10:00:00+00:00",
            day_of_week="Monday"
        )
    
    def test_get_calendar_free(self):
        """Test GET request to retrieve free time slots"""
        url = reverse('user_calendar_free', args=[1])
        response = self.client.get(url)
        
        # Check that the response is 200 OK
        self.assertEqual(response.status_code, 200)
        
        # Parse the JSON response
        data = json.loads(response.content)
        
        # Check that we got a list
        self.assertIsInstance(data, list)
        
        # Check that our test data is in the response
        self.assertTrue(any(
            slot['day_of_week'] == 'Monday' and 
            '09:00' in slot['start'] 
            for slot in data
        ))
    
    def test_post_book_slot(self):
        """Test POST request to book a time slot"""
        url = reverse('user_calendar_free', args=[1])
        
        # Data for the slot to book
        slot_to_book = {
            "start": "2025-05-12T09:00:00+00:00",
            "end": "2025-05-12T10:00:00+00:00",
            "day_of_week": "Monday",
            "operation": "book"
        }
        
        # Make the POST request
        response = self.client.post(
            url, 
            data=json.dumps(slot_to_book),
            content_type='application/json'
        )
        
        # Check that the response is 200 OK
        self.assertEqual(response.status_code, 200)
        
        # Parse the JSON response
        data = json.loads(response.content)
        
        # Check that the response contains the data we sent
        self.assertEqual(data['day_of_week'], 'Monday')
        self.assertTrue('09:00' in data['start'])
        
        # Check that the slot was actually removed from the database
        self.assertFalse(
            FreeTimeSlot.objects.filter(
                user_id=1,
                day_of_week='Monday',
                start_time__hour=9,
                start_time__minute=0
            ).exists()
        )
    
    def test_post_create_slot(self):
        """Test POST request to create a new available time slot"""
        url = reverse('user_calendar_free', args=[1])
        
        # Data for the new slot to create
        new_slot = {
            "start": "2025-05-12T11:00:00+00:00",
            "end": "2025-05-12T12:00:00+00:00",
            "day_of_week": "Monday",
            "operation": "create"
        }
        
        # Make the POST request
        response = self.client.post(
            url, 
            data=json.dumps(new_slot),
            content_type='application/json'
        )
        
        # Check that the response is 201 Created
        self.assertEqual(response.status_code, 201)
        
        # Parse the JSON response
        data = json.loads(response.content)
        
        # Check that the response contains the data we sent
        self.assertEqual(data['day_of_week'], 'Monday')
        self.assertTrue('11:00' in data['start'])
        
        # Check that the slot was actually created in the database
        self.assertTrue(
            FreeTimeSlot.objects.filter(
                user_id=1,
                day_of_week='Monday',
                start_time__hour=11,
                start_time__minute=0
            ).exists()
        )
    
    def test_post_create_duplicate_slot(self):
        """Test POST request to create a slot that already exists"""
        url = reverse('user_calendar_free', args=[1])
        
        # Data for a slot that already exists
        duplicate_slot = {
            "start": "2025-05-12T09:00:00+00:00",
            "end": "2025-05-12T10:00:00+00:00",
            "day_of_week": "Monday",
            "operation": "create"
        }
        
        # Make the POST request
        response = self.client.post(
            url, 
            data=json.dumps(duplicate_slot),
            content_type='application/json'
        )
        
        # Check that the response is 404 Not Found (or could be 400 Bad Request)
        self.assertEqual(response.status_code, 404)
    
    def test_post_book_nonexistent_slot(self):
        """Test POST request to book a slot that doesn't exist"""
        url = reverse('user_calendar_free', args=[1])
        
        # Data for a slot that doesn't exist
        nonexistent_slot = {
            "start": "2025-05-12T14:00:00+00:00",
            "end": "2025-05-12T15:00:00+00:00",
            "day_of_week": "Monday",
            "operation": "book"
        }
        
        # Make the POST request
        response = self.client.post(
            url, 
            data=json.dumps(nonexistent_slot),
            content_type='application/json'
        )
        
        # Check that the response is 404 Not Found
        self.assertEqual(response.status_code, 404)
    
    def test_post_invalid_operation(self):
        """Test POST request with an invalid operation"""
        url = reverse('user_calendar_free', args=[1])
        
        # Data with invalid operation
        invalid_operation = {
            "start": "2025-05-12T09:00:00+00:00",
            "end": "2025-05-12T10:00:00+00:00",
            "day_of_week": "Monday",
            "operation": "invalid_operation"
        }
        
        # Make the POST request
        response = self.client.post(
            url, 
            data=json.dumps(invalid_operation),
            content_type='application/json'
        )
        
        # Check that the response is 400 Bad Request
        self.assertEqual(response.status_code, 400)
    
    def test_post_invalid_data(self):
        """Test POST request with invalid data"""
        url = reverse('user_calendar_free', args=[1])
        
        # Invalid data missing required fields
        invalid_data = {
            "start": "2025-05-13T14:00:00+00:00"
            # Missing end and day_of_week
        }
        
        # Make the POST request
        response = self.client.post(
            url, 
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        # Check that the response is 400 Bad Request
        self.assertEqual(response.status_code, 400)
    
    def test_post_book_already_booked_slot(self):
        """Test POST request to book a slot that's already booked"""
        url = reverse('user_calendar_free', args=[1])
        
        # First, book an available slot
        slot_to_book = {
            "start": "2025-05-12T09:00:00+00:00",
            "end": "2025-05-12T10:00:00+00:00",
            "day_of_week": "Monday",
            "operation": "book"
        }
        
        # Make the first POST request to book the slot
        response = self.client.post(
            url, 
            data=json.dumps(slot_to_book),
            content_type='application/json'
        )
        
        # Check that the first booking was successful
        self.assertEqual(response.status_code, 200)
        
        # Now try to book the same slot again
        response = self.client.post(
            url, 
            data=json.dumps(slot_to_book),
            content_type='application/json'
        )
        
        # Check that the response is 404 Not Found
        self.assertEqual(response.status_code, 404)
        
        # Check that the error message indicates the slot is already booked
        data = json.loads(response.content)
        self.assertIn("already be booked", data.get("error", ""))

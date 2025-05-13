from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from .schedule import calendar_free, book_time_slot, create_free_time_slot


def get_users(request):
    return JsonResponse(
        [
            {"id": 1, "name": "User One"},
        ],
        safe=False
    )


@csrf_exempt
def user_calendar_free(request, user_id):
    if request.method == 'GET':
        return JsonResponse(calendar_free(user_id), safe=False)
    
    elif request.method == 'POST':
        try:
            # Parse the JSON data from the request body
            data = json.loads(request.body)
            
            # Validate the data
            if not all(key in data for key in ['start', 'end', 'day_of_week']):
                return JsonResponse(
                    {"error": "Missing required fields: start, end, day_of_week"},
                    status=400
                )
            
            # Check if we're booking or creating a slot
            operation = data.get('operation', 'book')
            
            if operation == 'book':
                # Book the time slot (remove it from available slots)
                result = book_time_slot(
                    user_id=user_id,
                    start=data['start'],
                    end=data['end'],
                    day_of_week=data['day_of_week']
                )
                return JsonResponse(result, status=200)
            
            elif operation == 'create':
                # Create a new available slot
                result = create_free_time_slot(
                    user_id=user_id,
                    start=data['start'],
                    end=data['end'],
                    day_of_week=data['day_of_week']
                )
                return JsonResponse(result, status=201)
            
            else:
                return JsonResponse(
                    {"error": "Invalid operation. Must be 'book' or 'create'"},
                    status=400
                )
                
        except json.JSONDecodeError:
            return JsonResponse(
                {"error": "Invalid JSON data"},
                status=400
            )
        except ValueError as e:
            return JsonResponse(
                {"error": str(e)},
                status=404
            )
        except Exception as e:
            return JsonResponse(
                {"error": str(e)},
                status=500
            )

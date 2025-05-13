1. All slots are in 30 mins increments, starting 9 AM and ending 5 PM. Data cleaning is out od scope
2. We are only showing data for one week (a week up / down arrow can be added to parametrise)
3. Slots can have three states - [AVAILABLE, UNAVAILABLE, BOOKED] ... for this exercise, marking a slot UNAVAILABLE upon a successful booking is sufficient (for a student to see their booking, we need to identify them through a login flow etc)
4. We will only get data in 30 mins chunks, ie, for a 1 hr slot, it will come as two consecutive slots. In this case, end of the slot become irrelevent
5. I had difficult running Docker on my machine, so I swicthed to venv
6. I am using sqlite3 instead of postgres for simplicity

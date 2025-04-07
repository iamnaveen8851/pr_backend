## Step 2: Testing Time Tracking APIs
### Start Time Tracking
1. Create a new POST request
2. URL: http://localhost:8080/time-tracking/tasks/:taskId/start
   - Replace :taskId with an actual task ID from your database
3. Headers:
   - Key: Authorization
   - Value: Bearer {{token}}
4. Send the request
5. Expected response: Status 201 with a JSON object containing the new time entry
### Stop Time Tracking
1. Create a new PATCH request
2. URL: http://localhost:8080/time-tracking/entries/:entryId/stop
   - Replace :entryId with the ID received from the start time tracking response
3. Headers:
   - Key: Authorization
   - Value: Bearer {{token}}
4. Send the request
5. Expected response: Status 200 with a JSON object containing the updated time entry
### Get User Time Entries
1. Create a new GET request
2. URL: http://localhost:8080/time-tracking/entries
3. Headers:
   - Key: Authorization
   - Value: Bearer {{token}}
4. Optional Query Parameters:
   - startDate : YYYY-MM-DD
   - endDate : YYYY-MM-DD
   - taskId : ID of a specific task
   - projectId : ID of a specific project
5. Send the request
6. Expected response: Status 200 with a JSON array of time entries
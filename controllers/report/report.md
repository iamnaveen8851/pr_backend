## Testing Report APIs
### Generate Time Spent Report
1. Create a new GET request
2. URL: http://localhost:8080/reports/time-spent
3. Headers:
   - Key: Authorization
   - Value: Bearer {{token}}
4. Optional Query Parameters:
   - startDate : YYYY-MM-DD
   - endDate : YYYY-MM-DD
   - userId : ID of a specific user
   - projectId : ID of a specific project
5. Send the request
6. Expected response: Status 200 with a JSON object containing time spent data
### Generate Pending Tasks Report
1. Create a new GET request
2. URL: http://localhost:8080/reports/pending-tasks
3. Headers:
   - Key: Authorization
   - Value: Bearer {{token}}
4. Optional Query Parameters:
   - userId : ID of a specific user
   - projectId : ID of a specific project
5. Send the request
6. Expected response: Status 200 with a JSON object containing pending tasks data
### Generate Team Performance Report
1. Create a new GET request
2. URL: http://localhost:8080/reports/team-performance
3. Headers:
   - Key: Authorization
   - Value: Bearer {{token}}
4. Optional Query Parameters:
   - startDate : YYYY-MM-DD
   - endDate : YYYY-MM-DD
   - projectId : ID of a specific project
5. Send the request
6. Expected response: Status 200 with a JSON object containing team performance data
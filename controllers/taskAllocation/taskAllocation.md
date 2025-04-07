## Testing Task Allocation APIs

### Get Task Allocation Recommendations

1. Create a new GET request
2. URL: http://localhost:8080/task-allocation/:taskId/recommendations
   - Replace :taskId with an actual task ID
3. Headers:
   - Key: Authorization
   - Value: Bearer {{token}}
4. Send the request
5. Expected response: Status 200 with a JSON object containing recommended users

### Apply Task Allocation

1. Create a new POST request
2. URL: http://localhost:8080/task-allocation/:taskId/allocate
   - Replace :taskId with an actual task ID
3. Headers:
   - Key: Authorization
   - Value: Bearer {{token}}
   - Key: Content-Type
   - Value: application/json
4.

```
Body (raw JSON): pass user Id to allocate the task to the user

{
  "userId": "user_id_from_recommendations"
}
```


check for project id as well to increase the team member 

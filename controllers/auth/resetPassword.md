# Password Reset API Testing Guide

This guide explains how to test the password reset functionality in our application.

## Endpoints

The password reset system consists of two main endpoints:

1. Forgot Password : Sends a reset link to the user's email
2. Reset Password : Allows setting a new password using the token

## Testing with Postman

### 1. Testing Forgot Password

1. Open Postman and create a new POST request
2. Set the URL to: http://localhost:8080/password/forgot-password
3. Go to the "Body" tab, select "raw" and choose "JSON" from the dropdown
4. Enter this JSON:

```
{
  "email": "user@example.com"
}

(Replace with an actual email that exists in your database)
```

5. Click "Send"
6. Expected response: 200 OK with message confirming email sent

### 2. Testing Reset Password

1. Create another POST request
2. Set the URL to: http://localhost:8080/password/reset-password
3. Go to the "Body" tab, select "raw" and choose "JSON"
4. Enter this JSON:

```
{
  "token": "your-reset-token-here",
  "newPassword": "newSecurePassword123"
}

(Get the token from the email or directly from the database)

```

5. Click "Send"
6. Expected response: 200 OK with message confirming password reset

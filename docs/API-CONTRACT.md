# Backend API contract — RHEMA VBS

Base URL: `https://vbs-test.onrender.com/api`

These contracts were checked against the backend source in `MMagesh23/VBS_Test`. Runtime responses must still be verified using a dedicated teacher account.

| Feature | Method | Path | Notes |
|---|---|---|---|
| Login | POST | /auth/login | Body: userID, password |
| Current user | GET | /auth/me | Bearer access token |
| Refresh | POST | /auth/refresh | Body: refreshToken; rotates token pair |
| Logout | POST | /auth/logout | Bearer token and refreshToken |
| Students | GET | /students | Teacher result scoped to classAssigned |
| Attendance window | GET | /attendance/window-status | Authenticated |
| Attendance records | GET | /attendance/students | Teacher records scoped to assigned class |
| Submit attendance | POST | /attendance/students | date, classId, records[] |

## Authentication rules

- Only a user with `role === "teacher"` may enter the app.
- Access and refresh tokens are stored with Expo SecureStore.
- Refresh tokens are rotated by the backend. The client must persist the new pair together after a successful refresh.
- If refresh fails, local credentials are cleared and the user must sign in again.
- The backend allows a maximum of five active refresh sessions per user.

## Student attendance submission

The backend controller expects:

```json
{
  "date": "YYYY-MM-DD",
  "classId": "CLASS_OBJECT_ID",
  "records": [
    { "studentId": "STUDENT_OBJECT_ID", "status": "present" },
    { "studentId": "STUDENT_OBJECT_ID", "status": "absent" }
  ]
}
```

Teacher submissions are restricted server-side to the teacher's assigned class. Duplicate submissions are rejected. Today's submission is also checked against the VBS attendance time window. Future dates and dates outside the VBS schedule are rejected.

## Known constraints

- The Teacher model uses a single `classAssigned` value.
- The classes listing endpoint is not used as a teacher-facing source because its response is not scoped in the controller.
- The app must not rely on client-side filtering for authorization.
- QR scan endpoints are not yet wired into the app; verify the QR session token lifecycle before adding camera support.


## Mobile attendance screen behavior

- Loads `GET /students?page=1&limit=100`; the backend scopes the teacher to the assigned class.
- Loads `GET /attendance/window-status` and refreshes it every 60 seconds.
- Checks `GET /attendance/students?date=YYYY-MM-DD`; teacher results are restricted to their assigned class.
- Allows per-student `present` / `absent` selection.
- Submits the exact body shown above to `POST /attendance/students`.
- If today's record already exists, the screen shows the saved statuses and disables another submission.

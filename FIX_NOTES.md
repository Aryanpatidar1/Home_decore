# Run karne ke steps
1. Atlas -> Network Access -> Add IP Address -> "Allow Access From Anywhere" (0.0.0.0/0)
2. cd server && npm install && npm run dev   (terminal me "[MongoDB] Connected" aana chahiye; products auto-seed ho jaate hain)
3. cd client && npm install && npm run dev   -> http://localhost:5173
Logins: admin@auradecor.com / password123 , user@example.com / password123
Check: http://localhost:5000/api/health -> "database": "connected"

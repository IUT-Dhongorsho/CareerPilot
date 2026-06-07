TOKEN="your_jwt"

# 1. Upload CV
curl -X POST http://localhost:8005/api/cv/upload -H "Authorization: Bearer $TOKEN" -F "cv=@/path/to/cv.pdf"

# 2. Search jobs (with cosine fit score)
curl -X GET "http://localhost:8005/api/jobs/search?q=ML%20intern&location=Dhaka" -H "Authorization: Bearer $TOKEN"

# 3. Extract profile
curl -X POST http://localhost:8005/api/cv/profile -H "Authorization: Bearer $TOKEN"

# 4. Analyze CV
curl -X POST http://localhost:8005/api/cv/analyze -H "Authorization: Bearer $TOKEN"

# 5. Start interview (Redis session)
curl -X POST http://localhost:8005/api/interview/start -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"jobTitle":"ML Engineer","jobDescription":"We need Python and TensorFlow"}'

# 6. Answer (use sessionId)
curl -X POST http://localhost:8005/api/interview/answer -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"sessionId":"...","answer":"I have 2 years of Python experience"}'

# 7. Kanban
curl -X POST http://localhost:8005/api/tracker/kanban -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"job":{"id":"123","title":"ML Engineer","company":"Google"},"status":"applied"}'
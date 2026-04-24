# ScoreBoardX

Full-stack Quiz Leaderboard system with:
- Spring Boot backend (`backend`)
- React + Tailwind frontend (`frontend`)

## Backend

```bash
cd backend
mvn spring-boot:run
```

Runs on `http://localhost:8080`.

APIs:
- `GET /api/run?regNo={regNo}`
- `POST /api/submit?regNo={regNo}`
- `GET /api/progress` (SSE)

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`.

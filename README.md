Secure Auth Project (frontend + backend)
=======================================
This zip contains:
- frontend/ : vanilla JS HTML files (use Live Server in VS Code)
- backend/  : Node.js + Express backend (connect to MongoDB Atlas)

Quick start (frontend):
1. Open frontend folder in VS Code.
2. Install Live Server extension.
3. Open any HTML file with Live Server.
4. Before using, edit the API_URL variable at top of each HTML file if your backend URL is different.

Quick start (backend):
1. Open the backend folder in terminal.
2. Copy .env.example -> .env and fill values (MONGODB_URI, JWT_SECRET, ORIGIN)
3. Run `npm install`
4. Run `npm run dev` (requires nodemon) or `npm start`
5. Backend will run at http://127.0.0.1:4000 by default.

Deploying:
- Push backend to GitHub and create a Render web service (start: npm start).
- Set environment variables in Render (MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASS, ORIGIN).
- Update frontend API_URL to the Render URL.

Good luck! If you want I can also paste step-by-step commands to push to GitHub and deploy to Render.

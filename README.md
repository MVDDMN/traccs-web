"TRACCS (Taytay Resource, Assistance, and Community Coordination System): A Mobile and Web Application for a Geolocation-driven Emergency and Assistance Reporting System for Taytay Rizal"

TRACCS is a MERN stack (MongoDB, Express.js, React + Vite, Node.js) web application for geolocation-driven 
emergency and assistance reporting, featuring real-time notifications, SMS authentication, 
GPS tracking, and automated analytics reporting. Deployed on Render.

# 🚀 TRACCS Setup Guide

Geolocation-driven Emergency & Assistance Reporting System  
Built with the **MERN Stack (MongoDB, Express, React + Vite, Node.js)** and deployed on **Render**

---

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Deployment:** Render

---

## Project Structure
traccs/
├── client/ # Frontend (Vite + React)
└── server/ # Backend (Node.js + Express)

---

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd traccs
```

## 2. Backend Setup
- **Navigate To Server**
```bash
cd server
npm install
```

- **Create .env file**
```env
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development
PORT=3001
PROD_BASE_URL=http://localhost:3001
PROD_ALT_URL=http://localhost:5173
SESSION_SECRET=your_secret_key
```
**Run Backend**
```bash
npm start
```
- Backend runs at:
```bash
http://localhost:3001
```

## 3. Frontend Setup
- Navigate to Client
```bash
cd client
npm install
```
- Create .env file
```bash
VITE_PROD_API_BASE_URL=http://localhost:3001
```

**Run Frontend**
```bash
npm run dev
```
- Frontend runs at:
```bash
http://localhost:5173
```

## 4. Frontend Configuration (Vite / Render)
- Redirects and Rewrites
```bash
/* - /index.html - Rewrite
```

- Security Headers
```bash
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy:
default-src 'self';
img-src 'self' data: https://a.basemaps.cartocdn.com https://b.basemaps.cartocdn.com https://c.basemaps.cartocdn.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
script-src 'self' 'unsafe-inline';
connect-src 'self' https://traccs-web-backend-c9a1.onrender.com;
frame-src 'self' https://www.google.com;
frame-ancestors 'self';
X-Frame-Options: ALLOW-FROM https://www.google.com
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=(self)
```

## 5. Deployment (Render)
- Frontend Static Site
> Root Directory: client
Build Command:
```bash
npm run build
```
> Publish Directory: dist

- Backend (Web Service)
> Root Directory: server
Build Command:
```bash
npm install
```
Start Command:
```bash
node index.js
```

## 6. Environment Variables)
- Backend (Render)
```bash
GMAIL_USER=
GMAIL_PASS=
MONGO_URI=
NODE_ENV=production
PORT=3001
PROD_BASE_URL=
PROD_ALT_URL=
SESSION_SECRET=
```

- Frontend (Render)
```bash
VITE_PROD_API_BASE_URL=https://your-backend-url.onrender.com
```

## 7. Production Notes
- Configure CORS in backend to allow frontend domain
- Update CSP (connect-src) with your backend URL
- Ensure all endpoints use HTTPS
- Use Gmail App Passwords instead of your main password

## 8. Testing Checklist
- Authentication (SMS / Login)
- Real-time Notifications
- Geolocation (GPS)
- Dashboard & Graphs
- API Connectivity

📌 Notes
- Ensure .env files are not committed (.gitignore)
- Double-check environment variables before deployment.
- Monitor logs in Render dashboard for debugging.

👨‍💻 Author
Developed by [Karl Angelo P. Dela Cruz][alias/Yorinu]
Aspiring Full-Stack Developer

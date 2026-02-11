# Skill-X 🎯

> **Skills, Skills Everywhere** - A skill-sharing marketplace platform connecting learners with teachers.

Skill-X is a full-stack web application that enables users to share skills, learn from others, earn money by teaching, and track their learning journey through gamification.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Seeding the Database](#-seeding-the-database)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Demo Accounts](#-demo-accounts)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### Core Features

- **Skill Sharing Marketplace** - Connect learners with teachers for 1-on-1 sessions
- **Multiple Modes** - Learn, Teach, Rent-a-Skill, Offer Service, Request Service
- **Skill DNA Profile** - Comprehensive skill tracking with confidence levels
- **Real-time Chat** - Socket.io powered messaging system
- **Escrow Payments** - Secure payment holding until session completion
- **Skill Capsules** - Verifiable proof of skill achievements

### Gamification

- XP and Leveling System (Bronze → Silver → Gold → Platinum → Legend)
- Badges and Achievements
- Daily Login Streaks
- Leaderboards

### AI Features

- **Strawberry AI Assistant** - Powered by Google Gemini
- Learning Path Recommendations
- Skill Gap Analysis
- Career Intelligence
- Mentor Matching

### Additional Features

- Learning Paths
- Community Posts
- Reviews & Ratings
- Dispute Resolution
- Referral System
- Social Impact Tracking
- Admin Dashboard
- Analytics Dashboard

---

## 🛠 Tech Stack

### Frontend

| Technology       | Purpose                 |
| ---------------- | ----------------------- |
| React 18         | UI Library              |
| Vite             | Build Tool & Dev Server |
| React Router v6  | Client-side Routing     |
| Tailwind CSS     | Styling                 |
| Framer Motion    | Animations              |
| Recharts         | Charts & Visualizations |
| Socket.io Client | Real-time Communication |
| Axios            | HTTP Client             |
| Lucide React     | Icons                   |
| React Hot Toast  | Notifications           |

### Backend

| Technology   | Purpose                 |
| ------------ | ----------------------- |
| Node.js      | Runtime Environment     |
| Express.js   | Web Framework           |
| MongoDB      | Database                |
| Mongoose     | ODM                     |
| Socket.io    | Real-time Communication |
| JWT          | Authentication          |
| bcryptjs     | Password Hashing        |
| Google GenAI | AI Features (Gemini)    |

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **npm** (v9.x or higher) - Comes with Node.js
- **MongoDB** (v6.x or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

### Verify Installation

```bash
node --version   # Should be v18.x or higher
npm --version    # Should be v9.x or higher
mongod --version # Should be v6.x or higher (if using local MongoDB)
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd skill-x
```

### 2. Install All Dependencies

Run the following command from the root directory to install dependencies for root, server, and client:

```bash
npm run install-all
```

**Or install manually:**

```bash
# Root dependencies
npm install

# Server dependencies
cd server && npm install

# Client dependencies
cd ../client && npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file in the **root directory** of the project:

```bash
touch .env
```

Add the following environment variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/skillx
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/skillx

# JWT Secret (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Google Gemini API Key (for AI features - optional)
GEMINI_API_KEY=your-gemini-api-key-here
```

### Environment Variables Explained

| Variable         | Required  | Description                                            |
| ---------------- | --------- | ------------------------------------------------------ |
| `PORT`           | No        | Server port (default: 5000)                            |
| `NODE_ENV`       | No        | Environment mode (development/production)              |
| `MONGODB_URI`    | **Yes\*** | MongoDB connection string                              |
| `JWT_SECRET`     | **Yes**   | Secret key for JWT token signing                       |
| `CLIENT_URL`     | No        | Frontend URL for CORS (default: http://localhost:5173) |
| `GEMINI_API_KEY` | No        | Google Gemini API key for AI features                  |

> **Note:** The application can run without MongoDB in "demo mode" with limited functionality using mock data.

### Getting API Keys

#### MongoDB Atlas (Free Tier)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string and replace `<password>` with your password

#### Google Gemini API (Free Tier)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Copy and paste into `GEMINI_API_KEY`

---

## ▶️ Running the Application

### Development Mode (Recommended)

Run both client and server concurrently from the root directory:

```bash
npm run dev
```

This will start:

- **Server**: http://localhost:5000
- **Client**: http://localhost:5173

### Run Separately

**Server only:**

```bash
npm run server
# Or
cd server && npm run dev
```

**Client only:**

```bash
npm run client
# Or
cd client && npm run dev
```

### Production Build

**Build the client:**

```bash
cd client && npm run build
```

**Start the server:**

```bash
cd server && npm start
```

---

## 🌱 Seeding the Database

To populate the database with sample data (users, skills, posts, sessions, etc.):

```bash
npm run seed
```

**Or manually:**

```bash
cd server && npm run seed
```

> **Note:** Seeding requires a valid `MONGODB_URI` in your `.env` file.

### What Gets Seeded

- Sample users (learners and teachers)
- Skills and skill categories
- Posts and community content
- Sample sessions and reviews
- Skill capsules
- Learning paths
- Transactions
- Notifications

---

## 📁 Project Structure

```
skill-x/
├── package.json              # Root package.json with scripts
├── .env                      # Environment variables (create this)
├── .gitignore
├── README.md
│
├── client/                   # Frontend React Application
│   ├── package.json
│   ├── vite.config.js        # Vite configuration
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── postcss.config.js
│   ├── index.html
│   ├── public/               # Static assets
│   └── src/
│       ├── App.jsx           # Main app component with routes
│       ├── main.jsx          # React entry point
│       ├── index.css         # Global styles
│       ├── components/       # Reusable components
│       │   ├── ai/           # AI-related components (Strawberry)
│       │   ├── analytics/    # Analytics components
│       │   ├── chat/         # Chat components
│       │   ├── common/       # Shared components
│       │   ├── gamification/ # Gamification components
│       │   ├── layout/       # Layout components (Sidebar, Layout)
│       │   ├── notifications/# Notification components
│       │   ├── sessions/     # Session components
│       │   └── skills/       # Skill-related components
│       ├── context/          # React Context providers
│       │   ├── AuthContext.jsx
│       │   ├── ModeContext.jsx
│       │   ├── NotificationContext.jsx
│       │   └── SocketContext.jsx
│       ├── data/             # Mock data
│       ├── hooks/            # Custom hooks
│       ├── pages/            # Page components
│       ├── services/         # API services
│       └── utils/            # Utility functions
│
└── server/                   # Backend Node.js Application
    ├── package.json
    ├── index.js              # Server entry point
    ├── config/
    │   └── db.js             # Database connection
    ├── middleware/
    │   ├── auth.js           # JWT authentication middleware
    │   └── errorHandler.js   # Error handling middleware
    ├── models/               # Mongoose models
    │   ├── User.js
    │   ├── Skill.js
    │   ├── Post.js
    │   ├── Session.js
    │   ├── Message.js
    │   ├── Conversation.js
    │   ├── Review.js
    │   ├── SkillCapsule.js
    │   ├── Transaction.js
    │   ├── Notification.js
    │   ├── LearningPath.js
    │   ├── Dispute.js
    │   └── Referral.js
    ├── routes/               # API routes
    │   ├── auth.js           # Authentication routes
    │   ├── users.js          # User management
    │   ├── skills.js         # Skills CRUD
    │   ├── posts.js          # Community posts
    │   ├── sessions.js       # Learning sessions
    │   ├── chat.js           # Messaging
    │   ├── notifications.js  # Notifications
    │   ├── transactions.js   # Wallet & payments
    │   ├── reviews.js        # Reviews & ratings
    │   ├── capsules.js       # Skill capsules
    │   ├── disputes.js       # Dispute resolution
    │   ├── referrals.js      # Referral system
    │   ├── learning-paths.js # Learning paths
    │   ├── analytics.js      # Analytics data
    │   ├── ai.js             # AI endpoints (Strawberry)
    │   └── admin.js          # Admin endpoints
    ├── seed/
    │   └── seedDatabase.js   # Database seeding script
    ├── services/             # Business logic services
    │   ├── gamificationService.js
    │   ├── matchingService.js
    │   └── pricingService.js
    └── socket/
        └── chatHandler.js    # Socket.io event handlers
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint                    | Description       |
| ------ | --------------------------- | ----------------- |
| POST   | `/api/auth/register`        | Register new user |
| POST   | `/api/auth/login`           | Login user        |
| GET    | `/api/auth/me`              | Get current user  |
| PUT    | `/api/auth/change-password` | Change password   |

### Users

| Method | Endpoint                 | Description      |
| ------ | ------------------------ | ---------------- |
| GET    | `/api/users/:id`         | Get user profile |
| PUT    | `/api/users/profile`     | Update profile   |
| PUT    | `/api/users/switch-mode` | Switch user mode |
| POST   | `/api/users/:id/follow`  | Follow user      |

### Skills & Sessions

| Method | Endpoint        | Description    |
| ------ | --------------- | -------------- |
| GET    | `/api/skills`   | Get all skills |
| POST   | `/api/skills`   | Create skill   |
| GET    | `/api/sessions` | Get sessions   |
| POST   | `/api/sessions` | Create session |

### Health Check

| Method | Endpoint      | Description          |
| ------ | ------------- | -------------------- |
| GET    | `/api/health` | Server health status |

---

## 👤 Demo Accounts

After seeding the database, you can use these demo accounts:

| Role    | Email                | Password   |
| ------- | -------------------- | ---------- |
| Learner | `learner@skillx.com` | `Demo@123` |
| Teacher | `teacher@skillx.com` | `Demo@123` |

---

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

```
MongoDB connection failed, running in demo mode with in-memory data
```

**Solution:**

- Ensure MongoDB is running locally: `mongod`
- Or verify your MongoDB Atlas connection string is correct
- Check if the `MONGODB_URI` is properly set in `.env`

#### 2. Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**

```bash
# Find and kill the process
lsof -i :5000
kill -9 <PID>
```

#### 3. CORS Errors

**Solution:** Ensure `CLIENT_URL` in `.env` matches your frontend URL

#### 4. JWT Authentication Errors

**Solution:** Ensure `JWT_SECRET` is set in your `.env` file

#### 5. AI Features Not Working

**Solution:**

- Set a valid `GEMINI_API_KEY` in `.env`
- The app will use fallback responses if the API key is missing

### Reset Database

```bash
# This will clear all data and re-seed
npm run seed
```

### Clear Node Modules

```bash
rm -rf node_modules client/node_modules server/node_modules
npm run install-all
```

---

## 📜 Scripts Reference

| Script                | Description                    |
| --------------------- | ------------------------------ |
| `npm run dev`         | Start both client and server   |
| `npm run server`      | Start server only              |
| `npm run client`      | Start client only              |
| `npm run install-all` | Install all dependencies       |
| `npm run seed`        | Seed database with sample data |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing GitHub issues
3. Create a new issue with detailed information

---

**Happy Learning! 🚀**

# Lettura

> A full-stack blogging platform built with the MERN stack, featuring JWT authentication, rich text editing, and social interactions.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://lettura-one.vercel.app)

## Overview

Lettura is a blogging platform that enables users to create, publish, and interact with blog content. Built from scratch with the MERN stack, it implements authentication, rich content creation, and social features including likes, saves, comments, and profile management.

### Key Highlights

- **Full-Stack Architecture:** Designed REST APIs and MongoDB schemas from scratch; implemented complete frontend and backend
- **Secure Authentication:** JWT-based auth with httpOnly cookies and input validation (email format, password strength)
- **Rich Content Creation:** Jodit WYSIWYG editor integration for intuitive blog composition
- **Cloud Infrastructure:** Cloudinary for image storage, MongoDB Atlas for database, deployed on Vercel + Render
- **Social Features:** Likes, saves, comments with nested comment likes, and user profiles

## Tech Stack

### Frontend
- React 18.2 with Vite
- React Router for navigation
- Axios for API communication
- Jodit React (WYSIWYG editor)

### Backend
- Node.js + Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Cookie Parser, CORS

### Cloud Services
- **Cloudinary** - Image hosting
- **MongoDB Atlas** - Database
- **Vercel** - Frontend hosting
- **Render** - Backend hosting

## Features

### Authentication
- User signup/login with validation
- JWT tokens stored in httpOnly cookies
- Protected routes with middleware

### Blog Management
- Create posts with rich text editor and cover images
- Explore feed with all published blogs
- View individual articles with comments
- Personal dashboard for managing posts

### Social Interactions
- Like/unlike posts and comments
- Save posts for later reading
- Add comments to blog posts
- View user profiles with stats (followers, posts, etc.)
- Discover other users and their content

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas account)
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/BlogSpot.git
   cd BlogSpot
   ```

2. **Install dependencies**
   ```bash
   # Server
   cd server
   npm install

   # Client
   cd ../client
   npm install
   ```

### Environment Variables

Create `.env` file in the `server` directory:

```env
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_secret_key
```

Update `client/src/config.js` with your backend URL:
```javascript
export const BACKEND_URL = 'http://localhost:3000';
```

Update Cloudinary credentials in:
- `client/src/components/PostArticle.jsx`
- `client/src/components/Editprofile.jsx`

### Running Locally

**Start Backend:**
```bash
cd server
npm start
# Runs on http://localhost:3000
```

**Start Frontend:**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /signup` - Register new user
- `POST /login` - Login user

### User Profile
- `GET /user-profile` - Get current user profile
- `POST /editprofile` - Update profile
- `POST /authorprofile` - Get other user's profile

### Blogs
- `GET /explore` - Get all blogs
- `POST /postarticle` - Create new blog
- `POST /article` - Get single blog with comments
- `GET /myposts` - Get user's posts
- `GET /likedposts` - Get liked posts
- `GET /savedposts` - Get saved posts

### Interactions
- `POST /handle-post-like` - Toggle like on blog
- `POST /handle-post-save` - Toggle save on blog
- `POST /handle-post-comment` - Add comment
- `POST /handle-comment-like` - Toggle like on comment

### Discovery
- `GET /profiles` - Get all user profiles

All endpoints except `/signup` and `/login` require JWT authentication.

## Project Structure

```
BlogSpot/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # Context API state management
│   │   ├── functions/        # Utility functions
│   │   ├── App.jsx          # Main app with routing
│   │   └── config.js        # Backend URL config
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json          # Vercel deployment config
│
└── server/                   # Express backend
    ├── server.js            # Routes + schemas
    ├── .env.example
    └── package.json
```

## Data Models

### User
- Profile info (name, email, password, bio, profile pic)
- Social stats (followers, following, post count)
- Arrays for posts, liked posts, saved posts
- Map for liked comments

### Blog
- Content (title, body, cover image)
- Metadata (author, date, read time)
- Engagement (like count, save count)
- Embedded comments array

### Comment
- Comment text and metadata
- Author reference and like count

## Roadmap

### Planned Improvements (v2)
- Password hashing with bcrypt
- Refactor server.js into modular controllers
- Redis caching for performance
- Search functionality
- Follow/unfollow system
- Blog categories and filtering
- Comprehensive testing (Jest, React Testing Library)
- CI/CD pipeline

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

---

⭐ If you find this project useful, please consider giving it a star!
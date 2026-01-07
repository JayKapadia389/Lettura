# Lettura - Project Overview for Development

> **Purpose:** This document provides a comprehensive overview of the Lettura project for AI agents and developers to quickly understand the codebase without scanning all files.

---

## Table of Contents
1. [Project Summary](#project-summary)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Data Models](#data-models)
5. [API Endpoints](#api-endpoints)
6. [Authentication & Security](#authentication--security)
7. [Key Files & Directories](#key-files--directories)
8. [Current Features](#current-features)
9. [Known Issues & Limitations](#known-issues--limitations)
10. [Development Setup](#development-setup)

---

## Project Summary

**Lettura** is a full-stack blogging platform built with the MERN stack (MongoDB, Express, React, Node.js). Users can create rich-text blog posts, engage with content through likes and comments, manage their profiles, and discover other writers.

**Live Deployment:**
- Frontend: https://lettura-one.vercel.app (Vercel)
- Backend API: https://blogspot-backend-gi19.onrender.com (Render)

**Repository Structure:**
```
Lettura/
├── client/          # React frontend (Vite)
├── server/          # Express.js backend
├── README.md        # Main documentation
├── ROADMAP.md       # Development roadmap
└── PROJECT_OVERVIEW.md  # This file
```

---

## Tech Stack

### Frontend
- **Framework:** React 18.2 with Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios (with credentials)
- **Rich Text Editor:** Jodit React (WYSIWYG)
- **UI Library:** Material-UI (MUI) + Emotion
- **Icons:** React Icons
- **Carousel:** Swiper
- **Code Quality:** ESLint

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Cookie Management:** cookie-parser
- **CORS:** CORS middleware
- **Environment:** dotenv
- **Dev Tool:** Nodemon

### Cloud Services
- **Image Storage:** Cloudinary
- **Database Hosting:** MongoDB Atlas
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render

---

## Architecture

### Current Architecture
The application follows a **monolithic architecture** with clear client-server separation:

**Frontend (SPA):**
- Single Page Application with client-side routing
- React Context API for global state management (user authentication)
- Axios configured with credentials for cookie-based auth
- Components organized by feature/page

**Backend (Monolithic):**
- Single `server.js` file (~730 lines) containing:
  - All route handlers
  - Mongoose schemas
  - Business logic
  - Middleware
- **Note:** Planned for refactoring into MVC structure in v2

**Authentication Flow:**
1. User submits credentials via `/login` or `/signup`
2. Server validates and creates JWT token
3. Token stored in httpOnly cookie (secure, sameSite: "none")
4. Client automatically sends cookie with each request
5. Server middleware validates JWT for protected routes

**Data Flow:**
```
Client Component → Axios Request → Express Route → Mongoose Model → MongoDB
                                         ↓
                                  JWT Middleware (Protected Routes)
```

---

## Data Models

### User Schema
```javascript
{
  firstName: String,
  lastName: String,
  emailId: String (unique),
  password: String,  // ⚠️ Currently plain text - needs bcrypt
  bio: String,
  profilePic: String (Cloudinary URL),
  followerCount: Number,
  followingCount: Number,
  postsCount: Number,
  posts: [ObjectId],  // References to Blog documents
  likedPosts: [ObjectId],
  savedPosts: [ObjectId],
  likedComments: Map  // commentId -> true/false
}
```

### Blog Schema
```javascript
{
  title: String,
  body: String (HTML from Jodit editor),
  category: String,
  date: Date,
  duration: Number (estimated read time in minutes),
  userId: ObjectId (ref: User),
  blogId: String,
  coverImage: String (Cloudinary URL),
  likeCount: Number,
  shareCount: Number,
  saveCount: Number,
  comments: [Comment]  // Embedded comment subdocuments
}
```

### Comment Schema (Subdocument)
```javascript
{
  comment: String,
  userId: ObjectId (ref: User),
  date: Date,
  likeCount: Number
}
```

**Relationships:**
- User has many Blogs (one-to-many)
- Blog has many Comments (embedded, one-to-many)
- User has many liked/saved Blogs (many-to-many via arrays)

---

## API Endpoints

### Public Routes
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/signup` | Register new user | `{ firstName, lastName, emailId, password }` |
| POST | `/login` | Authenticate user | `{ emailId, password }` |

### Protected Routes (Require JWT Cookie)

#### User Profile
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/user-profile` | Get current user profile | - |
| POST | `/editprofile` | Update profile | `{ firstName, lastName, bio, profilePic }` |
| POST | `/authorprofile` | Get another user's profile | `{ userId }` |
| GET | `/profiles` | Get all user profiles | - |
| GET | `/explore-header` | Get user's profile pic for header | - |

#### Blog Management
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/explore` | Get all published blogs | - |
| POST | `/postarticle` | Create new blog | `{ title, body, category, coverImage, duration }` |
| GET | `/postarticle` | Verify auth before post creation | - |
| POST | `/article` | Get single blog with comments | `{ blogId }` |
| GET | `/myposts` | Get current user's blogs | - |
| GET | `/likedposts` | Get user's liked blogs | - |
| GET | `/savedposts` | Get user's saved blogs | - |

#### Interactions
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/handle-post-like` | Toggle like on blog | `{ blogId }` |
| POST | `/handle-post-save` | Toggle save on blog | `{ blogId }` |
| POST | `/handle-post-comment` | Add comment to blog | `{ blogId, comment }` |
| POST | `/handle-comment-like` | Toggle like on comment | `{ blogId, commentId }` |

**Response Format:**
- Success: `200 OK` with JSON data
- Auth Error: `401 Unauthorized`
- Not Found: `404 Not Found`
- Server Error: `500 Internal Server Error`

---

## Authentication & Security

### Current Implementation
- **Token Type:** JWT (jsonwebtoken)
- **Storage:** httpOnly cookies (not accessible via JavaScript)
- **Cookie Flags:**
  - `httpOnly: true` - Prevents XSS attacks
  - `sameSite: "none"` - Allows cross-site requests (needed for Vercel → Render)
  - `secure: true` - HTTPS only (production)
- **Middleware:** `authenticateToken()` validates JWT on protected routes
- **CORS:** Configured to accept credentials from Vercel frontend

### ⚠️ Critical Security Issues (v2 Fixes Required)
1. **Passwords stored in plain text** - Must implement bcrypt hashing
2. **No rate limiting** - Vulnerable to brute force attacks
3. **No input validation** - Risk of injection attacks
4. **No request sanitization** - XSS vulnerabilities
5. **Error messages leak info** - Stack traces exposed in responses

---

## Key Files & Directories

### Frontend (`client/`)
```
client/
├── src/
│   ├── components/           # React components
│   │   ├── App.jsx          # Main app with routing (public/protected routes)
│   │   ├── Home.jsx         # Landing page
│   │   ├── Login.jsx        # Login form
│   │   ├── Signup.jsx       # Registration form
│   │   ├── Explore.jsx      # Browse all blogs feed
│   │   ├── Article.jsx      # Single blog view + comments section
│   │   ├── PostArticle.jsx  # Create/publish blog (Jodit editor)
│   │   ├── Userprofile.jsx  # Current user's profile page
│   │   ├── EditProfile.jsx  # Edit profile form
│   │   ├── AuthorProfile.jsx # Other user's public profile
│   │   ├── MyPosts.jsx      # User's published blogs
│   │   ├── LikedPosts.jsx   # User's liked blogs
│   │   ├── SavedPosts.jsx   # User's saved blogs
│   │   ├── blogs.jsx        # Blog card component (reusable)
│   │   ├── people.jsx       # User discovery component
│   │   ├── HomeHeader.jsx   # Header for home page
│   │   └── ExploreHeader.jsx # Header for explore page
│   ├── contexts/
│   │   ├── userContext.jsx  # React Context definition
│   │   └── userState.jsx    # Context provider with state logic
│   ├── functions/
│   │   └── getTimeStamp.js  # Convert dates to "2 hours ago" format
│   ├── main.jsx             # React entry point (renders App)
│   ├── index.css            # Global CSS styles
│   └── config.js            # Backend API URL configuration
├── public/
│   └── images/              # Static image assets
├── index.html               # HTML template
├── package.json             # Frontend dependencies
├── vite.config.js           # Vite build configuration
├── vercel.json              # Vercel deployment config (SPA rewrites)
└── .eslintrc.cjs            # ESLint configuration
```

### Backend (`server/`)
```
server/
├── server.js                # ⚠️ MONOLITHIC FILE - all code here
│                            # Contains: routes, schemas, middleware, logic
├── package.json             # Backend dependencies
├── .env.example             # Example environment variables
└── .env                     # Actual secrets (not in git)
```

### Important Notes on File Structure
- **No separation of concerns in backend** - Everything in one file
- **Frontend follows feature-based organization** - Each page is a component
- **Context API for state** - User authentication state shared globally
- **Config centralized** - Backend URL in `client/src/config.js`

---

## Current Features

### ✅ Implemented Features

**User Authentication**
- Email/password signup and login
- JWT-based authentication with httpOnly cookies
- Persistent login state across page refreshes
- Protected routes requiring authentication

**Blog Creation & Management**
- Rich text editor (Jodit) with formatting, images, links
- Cover image upload via Cloudinary
- Estimated read time calculation
- Personal blog dashboard (My Posts)
- View all published blogs (Explore feed)
- Individual article view with full content

**Social Interactions**
- Like/unlike blog posts (updates user's likedPosts array)
- Save/unsave posts for later (updates user's savedPosts array)
- Comment on blog posts
- Like/unlike individual comments
- View liked posts collection
- View saved posts collection

**User Profiles**
- Customizable profile (name, bio, profile picture)
- Profile picture upload via Cloudinary
- View profile stats (followers, following, post count)
- View user's published posts
- Browse all user profiles (People page)
- View other users' public profiles

**UI/UX Features**
- Responsive design (mobile-friendly)
- Smooth navigation with React Router
- Loading states for async operations
- Relative timestamps ("2 hours ago")
- Icon-based interactions (react-icons)
- Swiper carousels for content browsing

### 🚧 Partially Implemented
- Follow/unfollow system (data model ready, UI not implemented)
- Share functionality (counter exists, sharing not implemented)

### ❌ Not Implemented
- Search functionality (blogs, users)
- Blog categories/filtering
- Edit existing posts
- Delete posts
- Draft/publish workflow
- Notifications
- Analytics/view tracking
- Follow feed (personalized content)

---

## Known Issues & Limitations

### Critical Issues
1. **Security:** Passwords stored as plain text (no hashing)
2. **Performance:** No pagination - loads all blogs at once
3. **Error Handling:** Inconsistent error handling, no global error boundary
4. **Code Quality:** 730-line monolithic backend file
5. **Testing:** No tests (unit, integration, or E2E)

### Medium Priority
1. No input validation on forms
2. No loading skeletons (just blank screen during fetch)
3. No offline support
4. Images not optimized (no lazy loading, no compression)
5. No database indexing (slow queries at scale)
6. No caching (Redis)
7. Comments not deletable/editable
8. No moderation features
9. No email verification
10. No password reset flow

### Low Priority
1. No dark mode
2. No keyboard shortcuts
3. No accessibility (ARIA labels, screen reader support)
4. No internationalization (i18n)
5. No SEO optimization (meta tags, sitemap)

---

## Development Setup

### Prerequisites
- Node.js v16+ and npm
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### Environment Variables

**Backend (`.env` in `server/`):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
ACCESS_TOKEN_SECRET=your-secret-key-here
```

**Frontend (`client/src/config.js`):**
```javascript
export const backendUrl = "http://localhost:3000"  // Development
// export const backendUrl = "https://your-backend.onrender.com"  // Production
```

### Local Development

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm run dev  # Runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm run dev  # Runs on http://localhost:5173
```

### Key Development Notes
- Frontend proxies requests to backend via `backendUrl` config
- Cookies work locally without `secure` flag (HTTP allowed in dev)
- CORS is configured to allow `localhost:5173` origin
- Nodemon auto-restarts backend on file changes
- Vite HMR (Hot Module Replacement) for instant frontend updates

---

## Common Development Tasks

### Adding a New API Endpoint
1. Add route handler in `server/server.js`
2. Add authentication middleware if needed: `app.post('/endpoint', authenticateToken, async (req, res) => {...})`
3. Create corresponding frontend function in component
4. Use axios with credentials: `axios.post(backendUrl + '/endpoint', data, { withCredentials: true })`

### Adding a New Page/Component
1. Create component in `client/src/components/`
2. Add route in `App.jsx`:
   ```javascript
   <Route path="/newpage" element={<NewPage />} />
   ```
3. Add navigation link in header/sidebar

### Modifying User Schema
1. Update schema in `server/server.js` (User model)
2. Update any routes that read/write that field
3. Update frontend components that display/modify the field
4. Test with existing data (may need migration)

### Image Upload Flow
1. Component captures file input
2. Upload to Cloudinary via their API
3. Receive URL from Cloudinary response
4. Send URL to backend API
5. Store URL in MongoDB (not the image itself)

---

## Version History

- **v1 (Current):** Initial working version with core blogging features
- **v2 (Planned):** Security hardening, code refactoring, performance optimization, new features

**Last Commit Before v2:** `a0c75405e33edff8b87706ea6b54354c627dd901`

---

## Quick Reference for Agents

**When asked to:**
- **Add authentication** → Check `authenticateToken` middleware in `server.js`
- **Modify user data** → Update User schema and `/editprofile` route
- **Add blog features** → Check Blog schema and `/postarticle`, `/article` routes
- **Fix UI** → Check corresponding component in `client/src/components/`
- **Debug auth issues** → Verify cookie settings, CORS config, JWT secret
- **Optimize performance** → Start with pagination, add indexing, implement caching
- **Improve security** → Priority: bcrypt passwords, input validation, rate limiting

**Critical Files to Understand:**
1. `server/server.js` - Entire backend logic
2. `client/src/components/App.jsx` - Routing and app structure
3. `client/src/contexts/userState.jsx` - User authentication state
4. `client/src/config.js` - Backend API URL
5. `README.md` - Comprehensive user documentation

---

*This document is maintained alongside development. Last updated: 2026-01-05*

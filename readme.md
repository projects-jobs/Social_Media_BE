# 🌸 Vibe Backend

Express + MongoDB REST API for the Vibe social media app.

## Tech Stack

- **Node.js / Express 5**
- **MongoDB + Mongoose**
- **bcryptjs** — password hashing
- **busboy** — multipart file uploads (replaces multer v2)
- **dotenv** — environment variables

## ⚠️ Multer v2 Breaking Change

Your `package.json` has `multer: ^2.1.1` which has **breaking API changes** that cause `ENOENT` errors.

**Fix — uninstall multer, install busboy:**

```bash
npm uninstall multer
npm install busboy
```

The `server.js` provided uses `busboy` directly — no multer needed.

## Project Structure

```
SOCIAL_MEDIA_BE/
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   └── postController.js
├── models/
│   ├── User.js
│   └── Post.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   └── posts.js
├── public/
│   └── images/          ← uploaded files saved here (auto-created)
├── .env
└── server.js
```

## Setup

### 1. Install dependencies

```bash
npm install
npm uninstall multer
npm install busboy
```

### 2. Create `.env`

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/socialmedia
PORT=5000
```

### 3. Start server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server runs on **http://localhost:5000**

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| PUT | `/api/users/:id/follow` | Follow a user |
| PUT | `/api/users/:id/unfollow` | Unfollow a user |
| GET | `/api/users/:id/friends` | Get user's following list |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts` | Create post |
| GET | `/api/posts/:id` | Get single post |
| PUT | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |
| PUT | `/api/posts/:id/like` | Like / Unlike post |
| PUT | `/api/posts/:id/comment` | Add comment |
| GET | `/api/posts/timeline/:userId` | Get feed (own + following) |
| GET | `/api/posts/profile/:userId` | Get user's posts |

### Upload
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/upload` | `form-data: file (File), name (Text)` | Upload image |

**Response:**
```json
{
  "message": "File uploaded successfully",
  "filename": "post_abc123_1234567890.jpg",
  "url": "http://localhost:5000/images/post_abc123_1234567890.jpg"
}
```

### Serving Images

Uploaded images are served statically:
```
http://localhost:5000/images/<filename>
```

## Postman — Testing Upload

1. Method: `POST`
2. URL: `http://localhost:5000/api/upload`
3. Body → `form-data`
4. Add key `file` → type `File` → select your image
5. Add key `name` → type `Text` → value e.g. `my-photo.jpg`
6. Click **Send**

Expected 200 response:
```json
{ "message": "File uploaded successfully", "filename": "my-photo.jpg", "url": "..." }
```
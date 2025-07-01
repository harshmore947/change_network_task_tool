# TaskFlow - Task Management System

A simple and powerful task management system built with Next.js, MongoDB, and NextAuth. Designed for organizations to manage tasks efficiently with team collaboration features.

## 🚀 Features

- **Simple Task Management** - Create, update, and delete tasks
- **Team Collaboration** - Assign tasks to team members by email
- **User Authentication** - Secure login with NextAuth (Google & Credentials)
- **Permission Control** - Only task creators can delete their tasks
- **Responsive Design** - Modern UI built with Tailwind CSS and shadcn/ui
- **Database Integration** - MongoDB with Mongoose ODM

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, NextAuth.js
- **Database:** MongoDB with Mongoose
- **Authentication:** NextAuth.js (Google OAuth + Credentials)
- **Styling:** Tailwind CSS, Lucide React Icons

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** database (local or cloud)
- **Google OAuth credentials** (optional, for Google login)

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/harshmore947/change_network_task_tool.git
cd change_network_assignment
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/taskmanager
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. Database Setup

#### Option A: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Database will be created automatically

#### Option B: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and add to `.env.local`

### 5. Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Add credentials to `.env.local`

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 7. Add Sample Data (Optional)

Visit [http://localhost:3000/seed](http://localhost:3000/seed) to add dummy users and tasks for testing.

**Test Users:**

- Email: `test@example.com` | Password: `password123`
- Email: `demo@example.com` | Password: `password123`

## 🔗 API Documentation

### Authentication Endpoints

#### Login

- **Endpoint:** `POST /api/auth/signin`
- **Description:** Authenticate user with email/password
- **Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Register

- **Endpoint:** Server Action `signupUser`
- **Description:** Create new user account
- **Request Body:**

```json
{
  "employeeId": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "department": "Engineering",
  "position": "Developer",
  "password": "password123"
}
```

### Task Management Endpoints

#### Get All Tasks

- **Function:** `getAllTasksSimple()`
- **Description:** Get all tasks for authenticated user
- **Response:**

```json
{
  "success": true,
  "tasks": [
    {
      "_id": "task_id",
      "title": "Task Title",
      "description": "Task description",
      "status": "todo",
      "priority": "medium",
      "dueDate": "2025-07-15T00:00:00.000Z",
      "assignedTo": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdBy": {
        "_id": "creator_id",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "tags": ["frontend", "urgent"],
      "createdAt": "2025-07-01T10:00:00.000Z"
    }
  ]
}
```

#### Create Task

- **Function:** `createTask(data)`
- **Description:** Create a new task
- **Request Body:**

```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "high",
  "dueDate": "2025-07-15",
  "assignedTo": "user@example.com",
  "tags": ["frontend", "bug"]
}
```

- **Response:**

```json
{
  "success": true,
  "task": {
    /* task object */
  },
  "message": "Task created successfully"
}
```

#### Update Task

- **Function:** `updateTask(data)`
- **Description:** Update existing task
- **Request Body:**

```json
{
  "id": "task_id",
  "title": "Updated Title",
  "status": "in progress",
  "priority": "urgent"
}
```

- **Response:**

```json
{
  "success": true,
  "task": {
    /* updated task object */
  },
  "message": "Task updated successfully"
}
```

#### Delete Task

- **Function:** `deleteTask(taskId)`
- **Description:** Delete task (only creator can delete)
- **Parameters:** `taskId: string`
- **Response:**

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### Data Seeding

#### Add Test Data

- **Endpoint:** `POST /api/seed-data`
- **Description:** Add dummy users and tasks for testing
- **Response:**

```json
{
  "success": true,
  "message": "Dummy data created successfully!",
  "users": [
    {
      "email": "test@example.com",
      "password": "password123"
    }
  ]
}
```

## 📊 Database Schema

### User Model

```javascript
{
  employeeId: String (unique),
  firstName: String (required),
  lastName: String (required),
  email: String (unique, required),
  department: String (required),
  position: String (required),
  password: String (required, hashed)
}
```

### Task Model

```javascript
{
  title: String (required, max 100 chars),
  description: String (max 500 chars),
  status: Enum ["todo", "in progress", "done"],
  priority: Enum ["low", "medium", "high", "urgent"],
  dueDate: Date,
  assignedTo: ObjectId (ref: User),
  createdBy: ObjectId (ref: User, required),
  tags: [String],
  isArchived: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Permission System

- **Task Creation:** Any authenticated user
- **Task Update:** Creator or assignee
- **Task Delete:** Only creator
- **Task View:** Creator or assignee

## 🎨 UI Components

Built with **shadcn/ui** components:

- `Button` - Interactive buttons
- `Input` - Form inputs
- `Dialog` - Modal dialogs for task creation
- `DropdownMenu` - User menu
- `Card` - Content containers

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

- **Netlify:** Follow Next.js deployment guide
- **Railway:** Connect GitHub and deploy
- **Self-hosted:** Use `npm run build` and `npm start`

## 🧪 Testing

### Manual Testing

1. Visit `/seed` to add test data
2. Login with test credentials
3. Create, update, and delete tasks
4. Test task assignment functionality

### Test Accounts

```
Email: test@example.com
Password: password123

Email: demo@example.com
Password: password123
```

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📂 Project Structure

```
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (workspace)/     # Dashboard pages
│   ├── api/            # API routes
│   └── seed/           # Data seeding page
├── action/             # Server actions
├── components/         # React components
├── lib/               # Utilities and config
├── model/             # Database models
└── scripts/           # Helper scripts
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check existing documentation
- Review API examples above

---

Built with ❤️ using Next.js and modern web technologies.

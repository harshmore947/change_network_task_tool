const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Import your models (adjust paths if needed)
const User = require("../model/User-model");
const Task = require("../model/Task-model");

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/taskmanager"
    );
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Dummy users data
const dummyUsers = [
  {
    employeeId: "EMP001",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    department: "Engineering",
    position: "Frontend Developer",
    password: "password123",
  },
  {
    employeeId: "EMP002",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    department: "Design",
    position: "UI/UX Designer",
    password: "password123",
  },
  {
    employeeId: "EMP003",
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.johnson@example.com",
    department: "Engineering",
    position: "Backend Developer",
    password: "password123",
  },
  {
    employeeId: "EMP004",
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah.wilson@example.com",
    department: "Marketing",
    position: "Marketing Manager",
    password: "password123",
  },
  {
    employeeId: "EMP005",
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@example.com",
    department: "Engineering",
    position: "DevOps Engineer",
    password: "password123",
  },
];

// Function to create dummy users
const createDummyUsers = async () => {
  try {
    console.log("Creating dummy users...");

    for (const userData of dummyUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = new User({
        ...userData,
        password: hashedPassword,
      });

      await user.save();
      console.log(
        `Created user: ${userData.firstName} ${userData.lastName} (${userData.email})`
      );
    }

    console.log("Dummy users created successfully!");
  } catch (error) {
    console.error("Error creating dummy users:", error);
  }
};

// Function to create dummy tasks
const createDummyTasks = async () => {
  try {
    console.log("Creating dummy tasks...");

    // Get all users to assign tasks
    const users = await User.find({});
    if (users.length === 0) {
      console.log("No users found. Please create users first.");
      return;
    }

    // Dummy tasks data
    const dummyTasks = [
      {
        title: "Design Homepage Layout",
        description:
          "Create a modern and responsive homepage layout for the new website",
        status: "in progress",
        priority: "high",
        dueDate: new Date("2025-07-15"),
        tags: ["design", "frontend", "ui"],
        createdBy: users[0]._id, // John Doe
        assignedTo: users[1]._id, // Jane Smith
      },
      {
        title: "Implement User Authentication",
        description: "Set up NextAuth with Google and email authentication",
        status: "todo",
        priority: "urgent",
        dueDate: new Date("2025-07-10"),
        tags: ["backend", "auth", "security"],
        createdBy: users[0]._id, // John Doe
        assignedTo: users[2]._id, // Mike Johnson
      },
      {
        title: "Database Schema Design",
        description: "Design MongoDB schemas for users, tasks, and projects",
        status: "done",
        priority: "medium",
        dueDate: new Date("2025-07-05"),
        tags: ["database", "mongodb", "schema"],
        createdBy: users[2]._id, // Mike Johnson
        assignedTo: users[2]._id, // Self-assigned
      },
      {
        title: "Marketing Campaign Setup",
        description: "Plan and execute the launch marketing campaign",
        status: "todo",
        priority: "medium",
        dueDate: new Date("2025-07-20"),
        tags: ["marketing", "campaign", "launch"],
        createdBy: users[3]._id, // Sarah Wilson
        assignedTo: users[3]._id, // Self-assigned
      },
      {
        title: "Setup CI/CD Pipeline",
        description:
          "Configure GitHub Actions for automated testing and deployment",
        status: "in progress",
        priority: "high",
        dueDate: new Date("2025-07-12"),
        tags: ["devops", "ci-cd", "automation"],
        createdBy: users[4]._id, // David Brown
        assignedTo: users[4]._id, // Self-assigned
      },
      {
        title: "Create Task Management UI",
        description:
          "Build the task creation, editing, and management interface",
        status: "todo",
        priority: "high",
        dueDate: new Date("2025-07-18"),
        tags: ["frontend", "ui", "react"],
        createdBy: users[0]._id, // John Doe
        assignedTo: users[0]._id, // Self-assigned
      },
      {
        title: "API Documentation",
        description: "Write comprehensive API documentation for all endpoints",
        status: "todo",
        priority: "low",
        dueDate: new Date("2025-07-25"),
        tags: ["documentation", "api"],
        createdBy: users[2]._id, // Mike Johnson
        assignedTo: users[0]._id, // John Doe
      },
      {
        title: "Mobile Responsive Testing",
        description:
          "Test and fix mobile responsiveness across different devices",
        status: "todo",
        priority: "medium",
        dueDate: new Date("2025-07-22"),
        tags: ["testing", "mobile", "responsive"],
        createdBy: users[1]._id, // Jane Smith
        assignedTo: users[1]._id, // Self-assigned
      },
      {
        title: "Performance Optimization",
        description: "Optimize application performance and loading times",
        status: "todo",
        priority: "low",
        dueDate: new Date("2025-07-30"),
        tags: ["performance", "optimization"],
        createdBy: users[4]._id, // David Brown
        assignedTo: users[2]._id, // Mike Johnson
      },
      {
        title: "User Feedback Integration",
        description: "Implement feedback collection and analysis system",
        status: "todo",
        priority: "medium",
        dueDate: new Date("2025-08-05"),
        tags: ["feedback", "analytics"],
        createdBy: users[3]._id, // Sarah Wilson
        assignedTo: users[0]._id, // John Doe
      },
    ];

    // Clear existing tasks (optional)
    // await Task.deleteMany({});
    // console.log('Cleared existing tasks');

    // Create tasks
    for (const taskData of dummyTasks) {
      const task = new Task(taskData);
      await task.save();
      console.log(`Created task: ${taskData.title}`);
    }

    console.log("Dummy tasks created successfully!");
  } catch (error) {
    console.error("Error creating dummy tasks:", error);
  }
};

// Main function to seed all data
const seedData = async () => {
  try {
    await connectDB();

    console.log("🌱 Starting data seeding...\n");

    await createDummyUsers();
    console.log("");
    await createDummyTasks();

    console.log("\n✅ Data seeding completed successfully!");
    console.log("\nDummy users created:");
    dummyUsers.forEach((user) => {
      console.log(
        `- ${user.firstName} ${user.lastName} (${user.email}) - Password: ${user.password}`
      );
    });
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed.");
  }
};

// Run the seeding function
if (require.main === module) {
  seedData();
}

module.exports = { seedData, createDummyUsers, createDummyTasks };

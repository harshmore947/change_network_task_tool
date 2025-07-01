"use server";

import connectDB from "@/lib/database";
import User from "@/model/User-model";
import Task from "@/model/Task-model";
import bcrypt from "bcryptjs";

// Function to add dummy data
export async function addDummyData() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Dummy users
    const dummyUsers = [
      {
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        department: 'Engineering',
        position: 'Frontend Developer',
        password: await bcrypt.hash('password123', 10)
      },
      {
        employeeId: 'EMP002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        department: 'Design',
        position: 'UI/UX Designer',
        password: await bcrypt.hash('password123', 10)
      },
      {
        employeeId: 'EMP003',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        department: 'Engineering',
        position: 'Backend Developer',
        password: await bcrypt.hash('password123', 10)
      }
    ];

    // Create users if they don't exist
    for (const userData of dummyUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`Created user: ${userData.email}`);
      }
    }

    // Get users for task assignment
    const users = await User.find({});
    if (users.length < 2) {
      throw new Error("Need at least 2 users to create sample tasks");
    }

    // Dummy tasks
    const dummyTasks = [
      {
        title: 'Design Homepage Layout',
        description: 'Create a modern and responsive homepage layout',
        status: 'in progress',
        priority: 'high',
        dueDate: new Date('2025-07-15'),
        tags: ['design', 'frontend'],
        createdBy: users[0]._id,
        assignedTo: users[1]._id
      },
      {
        title: 'Implement User Authentication',
        description: 'Set up NextAuth with Google and email authentication',
        status: 'todo',
        priority: 'urgent',
        dueDate: new Date('2025-07-10'),
        tags: ['backend', 'auth'],
        createdBy: users[0]._id,
        assignedTo: users[2] ? users[2]._id : users[0]._id
      },
      {
        title: 'Database Schema Design',
        description: 'Design MongoDB schemas for users and tasks',
        status: 'done',
        priority: 'medium',
        dueDate: new Date('2025-07-05'),
        tags: ['database', 'mongodb'],
        createdBy: users[1]._id,
        assignedTo: users[1]._id
      },
      {
        title: 'Create Task Management UI',
        description: 'Build task creation and management interface',
        status: 'todo',
        priority: 'high',
        dueDate: new Date('2025-07-18'),
        tags: ['frontend', 'react'],
        createdBy: users[0]._id,
        assignedTo: users[0]._id
      },
      {
        title: 'API Documentation',
        description: 'Write API documentation for all endpoints',
        status: 'todo',
        priority: 'low',
        dueDate: new Date('2025-07-25'),
        tags: ['documentation'],
        createdBy: users[1]._id,
        assignedTo: users[0]._id
      }
    ];

    // Create tasks
    for (const taskData of dummyTasks) {
      const existingTask = await Task.findOne({ title: taskData.title });
      if (!existingTask) {
        const task = new Task(taskData);
        await task.save();
        console.log(`Created task: ${taskData.title}`);
      }
    }

    return {
      success: true,
      message: "Dummy data created successfully!",
      users: dummyUsers.map(u => ({ email: u.email, password: 'password123' }))
    };

  } catch (error) {
    console.error("Error creating dummy data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create dummy data"
    };
  }
}

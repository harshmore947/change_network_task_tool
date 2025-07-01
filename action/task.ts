"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/database";
import Task from "@/model/Task-model";
import User from "@/model/User-model";

// Types for task operations
export interface CreateTaskData {
  title: string;
  description?: string;
  status?: "todo" | "in progress" | "done";
  priority?: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  assignedTo?: string;
  tags?: string[];
}

export interface UpdateTaskData {
  id: string;
  title?: string;
  description?: string;
  status?: "todo" | "in progress" | "done";
  priority?: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  assignedTo?: string;
  tags?: string[];
  isArchived?: boolean;
}

// Create a new task
export async function createTask(data: CreateTaskData) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      throw new Error("Unauthorized: Please sign in to create tasks");
    }

    // Connect to database
    await connectDB();

    // Find the user creating the task
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      throw new Error("User not found");
    }

    // Validate required fields
    if (!data.title?.trim()) {
      throw new Error("Task title is required");
    }

    // Handle assignedTo field
    let assignedToUserId = user._id; // Default to creator
    if (data.assignedTo && data.assignedTo.trim()) {
      const assignedUser = await User.findOne({ email: data.assignedTo.trim() });
      if (assignedUser) {
        assignedToUserId = assignedUser._id;
      } else {
        throw new Error(`User with email ${data.assignedTo} not found`);
      }
    }

    // Create new task
    const newTask = new Task({
      title: data.title.trim(),
      description: data.description?.trim() || "",
      status: data.status || "todo",
      priority: data.priority || "medium",
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      assignedTo: assignedToUserId,
      createdBy: user._id,
      tags: data.tags || [],
    });

    const savedTask = await newTask.save();

    // Populate the references for return
    await savedTask.populate([
      { path: "assignedTo", select: "name email" },
      { path: "createdBy", select: "name email" }
    ]);

    // Revalidate pages that might show tasks
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/tasks");

    return {
      success: true,
      task: JSON.parse(JSON.stringify(savedTask)),
      message: "Task created successfully"
    };

  } catch (error) {
    console.error("Create task error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task"
    };
  }
}

// Update an existing task
export async function updateTask(data: UpdateTaskData) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new Error("Unauthorized: Please sign in to update tasks");
    }

    // Connect to database
    await connectDB();

    // Find the user updating the task
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      throw new Error("User not found");
    }

    // Validate task ID
    if (!data.id) {
      throw new Error("Task ID is required");
    }

    // Find the task
    const existingTask = await Task.findById(data.id);
    if (!existingTask) {
      throw new Error("Task not found");
    }

    // Check if user has permission to update (creator or assignee)
    const canUpdate = existingTask.createdBy.toString() === user._id.toString() ||
                     existingTask.assignedTo?.toString() === user._id.toString();
    
    if (!canUpdate) {
      throw new Error("You don't have permission to update this task");
    }

    // Prepare update data
    const updateData: any = {};

    if (data.title !== undefined) {
      if (!data.title.trim()) {
        throw new Error("Task title cannot be empty");
      }
      updateData.title = data.title.trim();
    }

    if (data.description !== undefined) {
      updateData.description = data.description.trim();
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    if (data.priority !== undefined) {
      updateData.priority = data.priority;
    }

    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    if (data.assignedTo !== undefined) {
      // Handle assignedTo field - can be email or user ID
      if (data.assignedTo && data.assignedTo.trim()) {
        // Try to find user by email first, then by ID
        let assignedUser = await User.findOne({ email: data.assignedTo.trim() });
        if (!assignedUser) {
          assignedUser = await User.findById(data.assignedTo);
        }
        if (!assignedUser) {
          throw new Error(`User with email/ID ${data.assignedTo} not found`);
        }
        updateData.assignedTo = assignedUser._id;
      } else {
        updateData.assignedTo = null;
      }
    }

    if (data.tags !== undefined) {
      updateData.tags = data.tags;
    }

    if (data.isArchived !== undefined) {
      updateData.isArchived = data.isArchived;
    }

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(
      data.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: "assignedTo", select: "name email" },
      { path: "createdBy", select: "name email" }
    ]);

    // Revalidate pages that might show tasks
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/tasks");

    return {
      success: true,
      task: JSON.parse(JSON.stringify(updatedTask)),
      message: "Task updated successfully"
    };

  } catch (error) {
    console.error("Update task error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task"
    };
  }
}

// Delete a task
export async function deleteTask(taskId: string) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new Error("Unauthorized: Please sign in to delete tasks");
    }

    // Connect to database
    await connectDB();

    // Find the user deleting the task
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      throw new Error("User not found");
    }

    // Validate task ID
    if (!taskId) {
      throw new Error("Task ID is required");
    }

    // Find the task
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      throw new Error("Task not found");
    }

    // Check if user has permission to delete (only creator can delete)
    if (existingTask.createdBy.toString() !== user._id.toString()) {
      throw new Error("You can only delete tasks that you created");
    }

    // Delete the task
    await Task.findByIdAndDelete(taskId);

    // Revalidate pages that might show tasks
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/tasks");

    return {
      success: true,
      message: "Task deleted successfully"
    };

  } catch (error) {
    console.error("Delete task error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete task"
    };
  }
}

// Get all tasks for the current user
export async function getUserTasks() {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new Error("Unauthorized: Please sign in to view tasks");
    }

    // Connect to database
    await connectDB();

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      throw new Error("User not found");
    }

    // Get tasks where user is either creator or assignee
    const tasks = await Task.find({
      $or: [
        { createdBy: user._id },
        { assignedTo: user._id }
      ]
    })
    .populate([
      { path: "assignedTo", select: "name email" },
      { path: "createdBy", select: "name email" }
    ])
    .sort({ createdAt: -1 });

    return {
      success: true,
      tasks: JSON.parse(JSON.stringify(tasks))
    };

  } catch (error) {
    console.error("Get tasks error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch tasks"
    };
  }
}

// Simple function to get all tasks
export async function getAllTasksSimple() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "Please sign in to view tasks" };
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get all tasks where user is creator or assignee
    const tasks = await Task.find({
      $or: [
        { createdBy: user._id },
        { assignedTo: user._id }
      ]
    })
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

    return {
      success: true,
      tasks: JSON.parse(JSON.stringify(tasks))
    };
  } catch (error) {
    console.error("Get all tasks error:", error);
    return {
      success: false,
      error: "Failed to fetch tasks"
    };
  }
}

// Simple function to add dummy data (for testing)
export async function addTestData() {
  try {
    await connectDB();

    // Create test users
    const testUsers = [
      {
        employeeId: 'TEST001',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        department: 'Testing',
        position: 'Test User',
        password: await require('bcryptjs').hash('password123', 10)
      },
      {
        employeeId: 'TEST002',
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@example.com',
        department: 'Demo',
        position: 'Demo User',
        password: await require('bcryptjs').hash('password123', 10)
      }
    ];

    // Create users
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
      }
    }

    // Get users
    const users = await User.find({ email: { $in: ['test@example.com', 'demo@example.com'] } });

    // Create test tasks
    const testTasks = [
      {
        title: 'Sample Task 1',
        description: 'This is a sample task for testing',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        tags: ['sample', 'test'],
        createdBy: users[0]._id,
        assignedTo: users[0]._id
      },
      {
        title: 'Sample Task 2',
        description: 'Another sample task assigned to demo user',
        status: 'in progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        tags: ['sample', 'demo'],
        createdBy: users[0]._id,
        assignedTo: users[1]._id
      },
      {
        title: 'Completed Sample Task',
        description: 'This is a completed sample task',
        status: 'done',
        priority: 'low',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        tags: ['sample', 'completed'],
        createdBy: users[1]._id,
        assignedTo: users[1]._id
      }
    ];

    // Create tasks
    for (const taskData of testTasks) {
      const existingTask = await Task.findOne({ title: taskData.title });
      if (!existingTask) {
        const task = new Task(taskData);
        await task.save();
      }
    }

    return {
      success: true,
      message: "Test data created successfully!",
      testUsers: [
        { email: 'test@example.com', password: 'password123' },
        { email: 'demo@example.com', password: 'password123' }
      ]
    };

  } catch (error) {
    console.error("Error creating test data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create test data"
    };
  }
}

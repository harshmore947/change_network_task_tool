import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Task title is required"],
    trim: true,
    maxlength: [100, "Task title cannot exceed 100 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"],
  },
  status: {
    type: String,
    enum: {
      values: ["todo", "in progress", "done"],
      message: "Status must be one of: todo, in progress, done"
    },
    default: "todo",
  },
  priority: {
    type: String,
    enum: {
      values: ["low", "medium", "high", "urgent"],
      message: "Priority must be one of: low, medium, high, urgent"
    },
    default: "medium",
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(date: Date) {
        return !date || date > new Date();
      },
      message: "Due date must be in the future"
    }
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Task must have a creator"],
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  isArchived: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true, // This automatically adds createdAt and updatedAt
});

// Indexes for better query performance
taskSchema.index({ createdBy: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdAt: -1 });

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'done';
});

// Ensure virtual fields are serialized
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

export default mongoose.models.Task || mongoose.model("Task", taskSchema);

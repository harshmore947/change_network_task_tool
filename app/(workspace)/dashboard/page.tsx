"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  LogOut,
  Settings,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit,
} from "lucide-react";
import { signOut, useSession, signIn } from "next-auth/react";
import { CreateTaskDialog } from "@/components/ui/create-task-dialog";
import { EditTaskDialog } from "@/components/ui/edit-task-dialog";
import { deleteTask, updateTask, getAllTasksSimple } from "@/action/task";

export default function Page() {
  const { data: session, status } = useSession();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  // Fetch tasks - simple version
  const fetchTasks = React.useCallback(async () => {
    if (status !== "authenticated") return;

    setIsLoadingTasks(true);
    try {
      const result = await getAllTasksSimple();
      if (result.success) {
        setTasks(result.tasks || []);
      } else {
        console.error("Error fetching tasks:", result.error);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoadingTasks(false);
    }
  }, [status]);

  // Fetch tasks when component mounts and user is authenticated
  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Show confirmation dialog
      const confirmed = window.confirm("Are you sure you want to log out?");

      if (!confirmed) {
        setIsLoggingOut(false);
        return;
      }

      await signOut({
        callbackUrl: "/login", // Redirect to login page after logout
        redirect: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to log out. Please try again.");
      setIsLoggingOut(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const result = await deleteTask(taskId);
      if (result.success) {
        fetchTasks(); // Refresh the task list
        alert("Task deleted successfully!");
      } else {
        alert(result.error || "Failed to delete task");
      }
    } catch (error) {
      console.error("Delete task error:", error);
      alert("An error occurred while deleting the task");
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const result = await updateTask({
        id: taskId,
        status: newStatus as "todo" | "in progress" | "done",
      });
      if (result.success) {
        fetchTasks(); // Refresh the task list
      } else {
        alert(result.error || "Failed to update task");
      }
    } catch (error) {
      console.error("Update task error:", error);
      alert("An error occurred while updating the task");
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingTask(null);
  };

  // Show loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-4">
            Please sign in to access the dashboard.
          </p>
          <Button onClick={() => signIn()}>Sign In</Button>
        </div>
      </div>
    );
  }

  // Get user info from session or use defaults
  const userName = session?.user?.name || "John Doe";
  const userEmail = session?.user?.email || "john.doe@example.com";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 p-4 lg:p-6 overflow-auto min-h-screen">
        <div className="max-w-7xl mx-auto w-full">
          {/* User Profile Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Welcome to your collaborative task manager
              </p>
            </div>

            {/* Actions and User Profile */}
            <div className="flex items-center gap-4">
              <CreateTaskDialog onTaskCreated={fetchTasks} />

              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">
                  {userName}
                </p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-ring hover:ring-offset-2 transition-all"
                    disabled={isLoggingOut}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-foreground">
                        {userInitials}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-destructive cursor-pointer focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Tasks Section */}
          {/* Tasks Section */}
          <div className="w-full">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Your Tasks
            </h2>
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              {isLoadingTasks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">
                    Loading tasks...
                  </span>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No tasks found</p>
                  <CreateTaskDialog onTaskCreated={fetchTasks} />
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => {
                    const getStatusIcon = (status: string) => {
                      switch (status) {
                        case "done":
                          return (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          );
                        case "in progress":
                          return <Clock className="w-4 h-4 text-blue-500" />;
                        default:
                          return (
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                          );
                      }
                    };

                    const getPriorityColor = (priority: string) => {
                      switch (priority?.toLowerCase()) {
                        case "urgent":
                          return "bg-red-500";
                        case "high":
                          return "bg-orange-500";
                        case "medium":
                          return "bg-yellow-500";
                        case "low":
                        default:
                          return "bg-green-500";
                      }
                    };

                    const formatDate = (dateString: string) => {
                      const date = new Date(dateString);
                      return date.toLocaleDateString();
                    };

                    const isTaskCreatedByUser =
                      task.createdBy?._id === session?.user?.id ||
                      task.createdBy?.email === session?.user?.email;

                    return (
                      <div
                        key={task._id}
                        className="flex items-center gap-3 p-4 rounded-md border hover:bg-accent transition-colors"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${getPriorityColor(
                            task.priority || "medium"
                          )} flex-shrink-0`}
                        ></div>
                        <div className="flex-shrink-0">
                          {getStatusIcon(task.status || "todo")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-card-foreground">
                            {task.title || "Untitled Task"}
                          </p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                              {task.priority || "medium"}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {task.status || "todo"}
                            </span>
                            {task.assignedTo && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Assigned to:{" "}
                                {task.assignedTo.name || task.assignedTo.email}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                Due: {formatDate(task.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Task Actions */}
                        <div className="flex items-center gap-2">
                          {/* Edit button - for creator or assignee */}
                          {(isTaskCreatedByUser ||
                            task.assignedTo?.email ===
                              session?.user?.email) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditTask(task)}
                              className="text-gray-600 hover:text-gray-700"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          )}

                          {/* Status update buttons */}
                          {task.status !== "done" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateTaskStatus(task._id, "done")
                              }
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}

                          {task.status === "todo" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateTaskStatus(task._id, "in progress")
                              }
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Clock className="w-3 h-3" />
                            </Button>
                          )}

                          {/* Delete button - only for task creator */}
                          {isTaskCreatedByUser && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteTask(task._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>

                        {task.dueDate &&
                          new Date(task.dueDate) < new Date() &&
                          task.status !== "done" && (
                            <div className="flex-shrink-0">
                              <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded-full">
                                Overdue
                              </span>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Task Dialog */}
      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          onTaskUpdated={fetchTasks}
        />
      )}
    </div>
  );
}

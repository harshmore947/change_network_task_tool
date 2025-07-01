"use server";

import dbConnect from "@/lib/database";
import User from "@/model/User-model";
import bcrypt from "bcryptjs";

export async function signupUser(formData: {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  password: string;
}) {
  await dbConnect();

  // Check if user already exists
  const existing = await User.findOne({ email: formData.email });
  if (existing) {
    return { success: false, message: "User already exists with this email." };
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(formData.password, 10);

  // Create the user
  const user = new User({
    ...formData,
    password: hashedPassword,
  });

  try {
    await user.save();
    return { success: true, message: "User registered successfully." };
  } catch (error) {
    return { success: false, message: "Error registering user." };
  }
}

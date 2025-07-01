import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/database";
import User from "@/model/User-model";
import bcrypt from "bcryptjs";

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    employeeId?: string;
    name: string;
    department?: string;
    position?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      employeeId?: string;
      name: string;
      department?: string;
      position?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    employeeId?: string;
    name: string;
    department?: string;
    position?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "john.doe@company.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();

        // Find user by email
        const user = await User.findOne({ email: credentials?.email });
        if (!user) {
          throw new Error("No user found with this email");
        }

        // Check password
        const isValid = await bcrypt.compare(
          credentials!.password,
          user.password
        );
        if (!isValid) {
          throw new Error("Invalid password");
        }

        // Return user object (omit password)
        return {
          id: user._id.toString(),
          email: user.email,
          employeeId: user.employeeId,
          name: user.firstName + " " + user.lastName,
          department: user.department,
          position: user.position,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.employeeId = user.employeeId;
        token.name = user.name;
        token.department = user.department;
        token.position = user.position;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.employeeId = token.employeeId;
        session.user.name = token.name;
        session.user.department = token.department;
        session.user.position = token.position;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);

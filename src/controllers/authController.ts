import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role?.name },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    // Remove password from response
    const { password: _, ...userData } = user;

    // Return token and user
    res.json({ token, user: userData });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password: _, ...userData } = user;
    res.json(userData);
  } catch (error: any) {
    console.error("Get me error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role?.name },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    const { password: _, ...userData } = user;
    res.json({ token: newToken, user: userData });
  } catch (error: any) {
    console.error("Refresh error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};
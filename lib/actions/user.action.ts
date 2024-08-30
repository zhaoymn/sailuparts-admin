"use server"

import { connectToDatabase } from "../mongoose"

import User from "../../database/user.model";

// get user number
export async function getUserNumber() {
  try {
    await connectToDatabase();
    return User.countDocuments();
  } catch (error) {
    console.log('Error getting user number: ', error);
  }
}
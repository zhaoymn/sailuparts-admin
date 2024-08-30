"use server"

import { connectToDatabase } from "../mongoose"

import Painting from "../../database/painting.model";

// get painting number
export async function getPaintingNumber() {
  try {
    await connectToDatabase();
    return Painting.countDocuments();
  } catch (error) {
    console.log('Error getting painting number: ', error);
  }
}

// get paintings on a page
export async function getPaintingsOnPage(page: number, limit: number) {
  try {
    await connectToDatabase();
    return Painting.find().skip((page - 1) * limit).limit(limit);
  } catch (error) {
    console.log('Error getting paintings on page: ', error);
  }
}
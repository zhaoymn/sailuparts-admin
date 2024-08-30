"use server"

import { connectToDatabase } from "../mongoose"

import Artist from "../../database/artist.model";


export async function getArtistNumber() {
  try {
    await connectToDatabase();
    const artistNumber = await Artist.countDocuments();
    console.log('artistNumber: ', artistNumber);
    return artistNumber;
  } catch (error) {
    console.log('Error getting artist number: ', error);
  }
}

export async function getArtistById(id: string) {
  try {
    await connectToDatabase();
    const artist = await Artist.findById(id);
    if (!artist) throw new Error('Artist not found');
    return JSON.stringify(artist);
  }
  catch (error) {
    console.error('Error fetching artist by id:', error);
    throw new Error('Failed to fetch artist');
  }
}

export async function getArtistByArtistId(artist_id: string) {
  try {
    await connectToDatabase();
    const artist = await Artist.findOne({ artist_id });
    if (!artist) throw new Error('Artist not found');
    return JSON.stringify(artist);
  }
  catch (error) {
    console.error('Error fetching artist by artist_id:', error);
    throw new Error('Failed to fetch artist');
  }
}

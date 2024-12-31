"use server";

import { connectToDatabase } from "../mongoose";

import Artist, { IArtist } from "../../database/artist.model";
import { revalidatePath } from "next/cache";

export async function getArtistNumber() {
  try {
    await connectToDatabase();
    const artistNumber = await Artist.countDocuments();
    console.log("artistNumber: ", artistNumber);
    return artistNumber;
  } catch (error) {
    console.log("Error getting artist number: ", error);
  }
}

export async function getArtistById(id: string) {
  try {
    await connectToDatabase();
    const artist = await Artist.findById(id);
    if (!artist) throw new Error("Artist not found");
    return JSON.stringify(artist);
  } catch (error) {
    console.error("Error fetching artist by id:", error);
    throw new Error("Failed to fetch artist");
  }
}

export async function getArtistByArtistId(artist_id: string) {
  try {
    await connectToDatabase();
    const artist = await Artist.findOne({ artist_id });
    if (!artist) throw new Error("Artist not found");
    return JSON.stringify(artist);
  } catch (error) {
    console.error("Error fetching artist by artist_id:", error);
    throw new Error("Failed to fetch artist");
  }
}

export async function deleteArtist(id: string) {
  try {
    await connectToDatabase();
    // find the artist
    const artist = await Artist.findById(id);
    if (!artist) throw new Error("Artist not found");
    // check if there are paintings associated with the artist
    // if there are, do not delete the artist
    if (artist.paintings.length > 0) {
      throw new Error("Cannot delete artist with associated paintings");
    }
    // delete the artist
    await Artist.findByIdAndDelete(id);
    revalidatePath("/artists");
    return JSON.stringify(artist);
  } catch (error) {
    console.log("Error deleting artist: ", error);
  }
}

export async function getArtists(page: number = 1, pageSize: number = 10) {
  try {
    await connectToDatabase();
    const skip = (page - 1) * pageSize;
    const artists = await Artist.find({})
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);
    const totalItems = await Artist.countDocuments({});
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNext = totalItems > skip + artists.length;
    return { artists, hasNext, totalPages };
  } catch (error) {
    console.error("Error fetching artists:", error);
    throw new Error("Failed to fetch artists");
  }
}

export async function updateArtist(id: string, data: string) {
  try {
    await connectToDatabase();
    const artistData = JSON.parse(data) as IArtist;
    console.log(artistData);
    const updatedArtist = await Artist.findByIdAndUpdate(id, {
      name: artistData.name,
      name_chinese: artistData.name_chinese,
      birth_year: artistData.birth_year,
      bio: artistData.bio,
      bio_chinese: artistData.bio_chinese,
      profile_image: artistData.profile_image,
      profile_imageId: artistData.profile_imageId,
      featured: artistData.featured,
    });
    return JSON.stringify(updatedArtist);
  } catch (error) {
    console.error("Error updating artist:", error);
    throw new Error("Failed to update artist");
  }
}

export async function createArtist(data: string) {
  try {
    await connectToDatabase();
    const artistData = JSON.parse(data) as IArtist;
    // artist_id is set to artist name, lower case, remove blank spaces
    artistData.artist_id = artistData.name.toLowerCase().replace(/\s/g, "");
    const artist = new Artist({
      artist_id: artistData.artist_id,
      name: artistData.name,
      name_chinese: artistData.name_chinese,
      birth_year: artistData.birth_year,
      bio: artistData.bio,
      bio_chinese: artistData.bio_chinese,
      profile_image: artistData.profile_image,
      profile_imageId: artistData.profile_imageId,
      featured: artistData.featured,
    });
    await artist.save();
    return JSON.stringify(artist);
  } catch (error) {
    console.error("Error creating artist:", error);
    throw new Error("Failed to create artist");
  }
}

export async function setFeatured(id: string, featured: boolean) {
  try {
    await connectToDatabase();
    const artist = await Artist.findByIdAndUpdate(id, { featured });
    return JSON.stringify(artist);
  } catch (error) {
    console.error("Error setting featured artist:", error);
    throw new Error("Failed to set featured artist");
  }
}

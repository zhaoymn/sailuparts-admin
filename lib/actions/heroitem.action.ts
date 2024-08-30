"use server"

import { connectToDatabase } from "../mongoose"
import HeroItem, { IHeroItem } from "../../database/heroitem.model";
import { revalidatePath } from "next/cache";
import { getArtistByArtistId } from "./artist.action";

// Get heroitem number
export async function getHeroItemNumber() {
  try {
    await connectToDatabase();
    return HeroItem.countDocuments();
  } catch (error) {
    console.log('Error getting heroitem number: ', error);
    throw new Error('Failed to get hero item count');
  }
}

// Get hero items with pagination
export async function getHeroItems(page: number = 1, pageSize: number = 10) {
  try {
    await connectToDatabase();
    const skip = (page - 1) * pageSize;
    const items = await HeroItem.find({})
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);
    const totalItems = await HeroItem.countDocuments({});
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNext = totalItems > skip + items.length;
    return { items, hasNext, totalPages };
  } catch (error) {
    console.error('Error fetching hero items:', error);
    throw new Error('Failed to fetch hero items');
  }
}

// Get a single hero item by ID
export async function getHeroItemById(id: string) {
  try {
    await connectToDatabase();
    console.log('id:', id);
    const heroItem = await HeroItem.findById(id);
    if (!heroItem) throw new Error('Hero item not found');
    return JSON.stringify(heroItem);
  } catch (error) {
    console.error('Error fetching hero item by id:', error);
    throw new Error('Failed to fetch hero item');
  }
}

// Update a hero item
export async function updateHeroItem(id: string, data: string) {
  try {
    await connectToDatabase();
    const heroItemData = JSON.parse(data) as IHeroItem;
    console.log(heroItemData);
    const artist_id = heroItemData.artist_id;
    // get artist item 
    const artistItemString = await getArtistByArtistId(artist_id);
    const artistItem = JSON.parse(artistItemString);
    const updatedItem = await HeroItem.findByIdAndUpdate(id, {
      title: heroItemData.title,
      artist_name: artistItem.name,
      artist_id: artist_id,
      artist_name_chinese: artistItem.name_chinese,
      image: heroItemData.image,
      painting_id: heroItemData.painting_id
    }, { new: true, runValidators: true });
    // const updatedItem = await HeroItem.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updatedItem) throw new Error('Hero item not found');
    revalidatePath(`/heroitems/${id}`);
    return JSON.stringify(updatedItem);
  } catch (error) {
    console.error('Error updating hero item:', error);
    throw new Error('Failed to update hero item');
  }
}

// Create a new hero item
export async function createHeroItem(data: string) {
  try {
    await connectToDatabase();
    const heroItemData = JSON.parse(data) as IHeroItem;
    console.log(heroItemData);
    const artist_id = heroItemData.artist_id;
    // get artist item
    const artistItemString = await getArtistByArtistId(artist_id);
    const artistItem = JSON.parse(artistItemString);
    const newItem = new HeroItem({
      title: heroItemData.title,
      artist_name: artistItem.name,
      artist_id: artist_id,
      artist_name_chinese: artistItem.name_chinese,
      image: heroItemData.image,
      painting_id: heroItemData.painting_id
    });
    // insert new hero item into database
    await newItem.save();
    revalidatePath('/heroitems');
    return JSON.stringify(newItem);
  } catch (error) {
    console.error('Error creating hero item:', error);
    throw new Error('Failed to create hero item');
  }
}

// Delete a hero item
export async function deleteHeroItem(id: string) {
  try {
    await connectToDatabase();
    const deletedItem = await HeroItem.findByIdAndDelete(id);
    if (!deletedItem) throw new Error('Hero item not found');
    revalidatePath('/heroitems');
    return JSON.stringify(deletedItem);
  } catch (error) {
    console.error('Error deleting hero item:', error);
    throw new Error('Failed to delete hero item');
  }
}
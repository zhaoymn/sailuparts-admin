"use server";

import { connectToDatabase } from "../mongoose";

import Painting from "../../database/painting.model";
import { revalidatePath } from "next/cache";
import Artist from "@/database/artist.model";

import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

// get painting number
export async function getPaintingNumber() {
  try {
    await connectToDatabase();
    return Painting.countDocuments();
  } catch (error) {
    console.log("Error getting painting number: ", error);
  }
}

// get paintings with pagination
export async function getPaintings(
  page: number = 1,
  pageSize: number = 10,
  filters: {
    painting_id?: string;
    artist_id?: string;
  } = {}
) {
  try {
    await connectToDatabase();
    const skip = (page - 1) * pageSize;

    // Build query based on filters
    const query: any = {};
    if (filters.painting_id) {
      query.painting_id = filters.painting_id;
    }
    if (filters.artist_id) {
      query.artist_id = filters.artist_id;
    }

    const items = await Painting.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);

    const totalItems = await Painting.countDocuments(query);
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNext = totalItems > skip + items.length;

    return { items, hasNext, totalPages };
  } catch (error) {
    console.error("Error fetching paintings:", error);
    throw new Error("Failed to fetch paintings");
  }
}

// delete a painting
export async function deletePainting(id: string) {
  try {
    await connectToDatabase();
    const painting = await Painting.findByIdAndDelete(id);
    if (!painting) throw new Error("Painting not found");
    revalidatePath("/paintings");
    return JSON.stringify(painting);
  } catch (error) {
    console.log("Error deleting painting: ", error);
  }
}

// get painting by id
export async function getPaintingById(id: string) {
  try {
    await connectToDatabase();
    const painting = await Painting.findById(id);
    // if imageIds not exist, create them with same length as all_images
    if (
      !painting.all_imageIds ||
      painting.all_imageIds.length !== painting.all_images.length
    ) {
      painting.all_imageIds = new Array(painting.all_images.length).fill("");
    }
    if (
      !painting.all_imageIds_150 ||
      painting.all_imageIds_150.length !== painting.all_images_150.length
    ) {
      painting.all_imageIds_150 = new Array(
        painting.all_images_150.length
      ).fill("");
    }
    if (
      !painting.all_imageIds_300 ||
      painting.all_imageIds_300.length !== painting.all_images_300.length
    ) {
      painting.all_imageIds_300 = new Array(
        painting.all_images_300.length
      ).fill("");
    }
    if (
      !painting.all_imageIds_1000 ||
      painting.all_imageIds_1000.length !== painting.all_images_1000.length
    ) {
      painting.all_imageIds_1000 = new Array(
        painting.all_images_1000.length
      ).fill("");
    }

    console.log(painting);

    // save to database
    await painting.save();

    if (!painting) throw new Error("Painting not found");
    return JSON.stringify(painting);
  } catch (error) {
    console.log("Error getting painting by id: ", error);
  }
}

// update a painting
export async function updatePaintingItem(paintingId: string, data: string) {
  try {
    await connectToDatabase();
    const paintingData = JSON.parse(data);
    console.log(paintingData);
    const painting = await Painting.findOne({ painting_id: paintingId });

    if (!painting) throw new Error("Painting not found");

    if (painting.artist_id !== paintingData.artist_id) {
      const oldArtist = await Artist.findOne({ artist_id: painting.artist_id });
      if (oldArtist) {
        oldArtist.paintings = oldArtist.paintings.filter(
          (painting: any) => painting.toString() !== painting._id.toString()
        );
        await oldArtist.save();
      }
      const newArtist = await Artist.findOne({
        artist_id: paintingData.artist_id,
      });
      if (newArtist) {
        newArtist.paintings.push(painting._id);
        await newArtist.save();
      }
    }

    painting.title = paintingData.title;
    painting.title_chinese = paintingData.title_chinese;
    painting.creation_year = paintingData.creation_year;
    painting.artist_id = paintingData.artist_id;
    painting.artist = await Artist.findOne({
      artist_id: paintingData.artist_id,
    });
    painting.collector_id = paintingData.collector_id;
    painting.material = paintingData.material;
    painting.material_chinese = paintingData.material_chinese;
    painting.source = paintingData.source;
    painting.condition = paintingData.condition;
    painting.available = paintingData.available;
    painting.on_hold = paintingData.on_hold;
    painting.description = paintingData.description;
    painting.description_chinese = paintingData.description_chinese;
    painting.seal = paintingData.seal;
    painting.seal_chinese = paintingData.seal_chinese;
    painting.inscription = paintingData.inscription;
    painting.inscription_chinese = paintingData.inscription_chinese;
    painting.awards = paintingData.awards.filter(
      (award: string) => award.trim() !== ""
    );
    painting.awards_chinese = paintingData.awards_chinese.filter(
      (award: string) => award.trim() !== ""
    );
    painting.tags = paintingData.tags.filter(
      (tag: string) => tag.trim() !== ""
    );
    painting.image_height = paintingData.image_height;
    painting.image_width = paintingData.image_width;
    painting.overall_height = paintingData.overall_height;
    painting.overall_width = paintingData.overall_width;
    painting.is_framed = paintingData.is_framed;
    painting.selling_price = paintingData.selling_price;
    painting.mount_description = paintingData.mount_description;

    await painting.save();

    revalidatePath("/paintings");
    revalidatePath(`/paintings/${painting._id}`);
    return JSON.stringify(painting);
  } catch (error) {
    console.log("Error updating painting: ", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

interface AddImageToPaintingParams {
  original: {
    url: string;
    fileId: string;
  };
  sizes: {
    "150": {
      url: string;
      fileId: string;
    };
    "300": {
      url: string;
      fileId: string;
    };
    "1000": {
      url: string;
      fileId: string;
    };
  };
}

export async function addImageToPainting(
  paintingId: string,
  result: AddImageToPaintingParams
) {
  try {
    await connectToDatabase();
    const painting = await Painting.findOne({ painting_id: paintingId });
    if (!painting) throw new Error("Painting not found");
    painting.all_images.push(result.original.url);
    painting.all_images_150.push(result.sizes["150"].url);
    painting.all_images_300.push(result.sizes["300"].url);
    painting.all_images_1000.push(result.sizes["1000"].url);
    painting.all_imageIds.push(result.original.fileId);
    painting.all_imageIds_150.push(result.sizes["150"].fileId);
    painting.all_imageIds_300.push(result.sizes["300"].fileId);
    painting.all_imageIds_1000.push(result.sizes["1000"].fileId);
    painting.image_is_rendered.push(false);
    await painting.save();
    revalidatePath(`/paintings/${painting._id}`);
    return JSON.stringify(painting);
  } catch (error) {
    console.log("Error adding image to painting: ", error);
    throw error;
  }
}

export async function removeImageFromPainting(
  paintingId: string,
  imageUrl: string
) {
  try {
    await connectToDatabase();
    const painting = await Painting.findOne({ painting_id: paintingId });
    // find the index of the image to remove
    const index = painting.all_images.indexOf(imageUrl);
    if (index === -1) throw new Error("Image not found");
    painting.all_images.splice(index, 1);
    painting.all_images_150.splice(index, 1);
    painting.all_images_300.splice(index, 1);
    painting.all_images_1000.splice(index, 1);

    // delete the images from imagekio
    try {
      await deleteFromImageKit(painting.all_imageIds[index]);
    } catch (error) {
      console.log("Error deleting image from imagekit: ", error);
    }
    try {
      await deleteFromImageKit(painting.all_imageIds_150[index]);
    } catch (error) {
      console.log("Error deleting image from imagekit: ", error);
    }
    try {
      await deleteFromImageKit(painting.all_imageIds_300[index]);
    } catch (error) {
      console.log("Error deleting image from imagekit: ", error);
    }
    try {
      await deleteFromImageKit(painting.all_imageIds_1000[index]);
    } catch (error) {
      console.log("Error deleting image from imagekit: ", error);
    }

    painting.all_imageIds.splice(index, 1);
    painting.all_imageIds_150.splice(index, 1);
    painting.all_imageIds_300.splice(index, 1);
    painting.all_imageIds_1000.splice(index, 1);
    painting.image_is_rendered.splice(index, 1);
    await painting.save();
    revalidatePath(`/paintings/${painting._id}`);
    return JSON.stringify(painting);
  } catch (error) {
    console.log("Error removing image from painting: ", error);
    throw error;
  }
}

export async function changeImageRenderedStatus(
  status: boolean,
  index: number,
  paintingId: string
) {
  try {
    await connectToDatabase();
    const painting = await Painting.findOne({ painting_id: paintingId });
    if (!painting) throw new Error("Painting not found");
    painting.image_is_rendered[index] = status;
    await painting.save();
    revalidatePath(`/paintings/${painting._id}`);
    return JSON.stringify(painting);
  } catch (error) {
    console.log("Error changing image rendered status: ", error);
    throw error;
  }
}

export const deleteFromImageKit = async (fileId: string): Promise<boolean> => {
  if (!fileId) {
    console.log("No fileId provided");
    return false;
  }

  try {
    await imagekit.deleteFile(fileId);
    console.log(`Successfully deleted file: ${fileId}`);
    return true;
  } catch (error) {
    console.error("Delete error:", error);
    throw error;
  }
};

export const paintingIdExists = async (
  paintingId: string
): Promise<boolean> => {
  try {
    await connectToDatabase();
    const painting = await Painting.findOne({ painting_id: paintingId });
    return !!painting;
  } catch (error) {
    console.error("Error checking if painting id exists:", error);
    throw error;
  }
};

export const copyPainting = async (
  original_id: string,
  newPaintingId: string
): Promise<string> => {
  try {
    await connectToDatabase();
    const painting = await Painting.findById(original_id);
    if (!painting) throw new Error("Painting not found");
    const newPainting = new Painting({
      painting_id: newPaintingId,
      _id: undefined,
      title: painting.title,
      title_chinese: painting.title_chinese,
      creation_year: painting.creation_year,
      artist_id: painting.artist_id,
      artist: painting.artist,
      collector_id: painting.collector_id,
      material: painting.material,
      material_chinese: painting.material_chinese,
      source: painting.source,
      condition: painting.condition,
      available: painting.available,
      on_hold: painting.on_hold,
      description: painting.description,
      description_chinese: painting.description_chinese,
      seal: painting.seal,
      seal_chinese: painting.seal_chinese,
      inscription: painting.inscription,
      inscription_chinese: painting.inscription_chinese,
      awards: painting.awards,
      awards_chinese: painting.awards_chinese,
      tags: painting.tags,
      image_height: painting.image_height,
      image_width: painting.image_width,
      overall_height: painting.overall_height,
      overall_width: painting.overall_width,
      is_framed: painting.is_framed,
      selling_price: painting.selling_price,
      mount_description: painting.mount_description,
      views: 0,
      favorited_by: [],
    });

    // add new painting to database, and return id
    await newPainting.save();
    revalidatePath("/paintings");
    console.log("Successfully copied painting", newPainting._id);
    const artist = await Artist.findOne({ artist_id: newPainting.artist_id });
    if (artist) {
      artist.paintings.push(newPainting._id);
      await artist.save();
    }
    //return _id cast to string
    return newPainting._id.toString();
  } catch (error) {
    console.log("Error copying painting: ", error);
    throw error;
  }
};

export const createNewPainting = async (paintingId: string) => {
  try {
    await connectToDatabase();
    console.log("Creating new painting with id: ", paintingId);
    const painting = new Painting({
      painting_id: paintingId,
      title: "",
      title_chinese: "",
      creation_year: "",
      artist_id: "",
      artist: undefined,
      collector_id: "",
      material: "",
      material_chinese: "",
      source: "original",
      available: true,
      on_hold: false,
      description: "",
      seal: "",
      inscription: "",
      awards: [],
      tags: [],
      all_images: [],
      all_imageIds: [],
      all_images_150: [],
      all_imageIds_150: [],
      all_images_300: [],
      all_imageIds_300: [],
      all_images_1000: [],
      all_imageIds_1000: [],
      image_is_rendered: [],
      views: 0,
      favorited_by: [],
      associated_order: undefined,
      image_height: 0,
      image_width: 0,
      overall_height: 0,
      overall_width: 0,
      is_framed: false,
      selling_price: 0,
      mount_description: "",
    });

    await painting.save();
    revalidatePath("/paintings");
    console.log("Successfully created new painting", painting._id);
    return painting._id.toString();
  } catch (error) {
    console.log("Error creating new painting: ", error);
    throw error;
  }
};

export const setFeatured = async (id: string, featured: boolean) => {
  try {
    await connectToDatabase();
    await Painting.findByIdAndUpdate(id, { featured });
  } catch (error) {
    console.error("Error setting featured painting:", error);
    throw new Error("Failed to set featured painting");
  }
};

export const setHomepage = async (id: string, homepage: boolean) => {
  try {
    await connectToDatabase();
    await Painting.findByIdAndUpdate(id, { homepage });
  } catch (error) {
    console.error("Error setting homepage painting:", error);
    throw new Error("Failed to set homepage painting");
  }
};

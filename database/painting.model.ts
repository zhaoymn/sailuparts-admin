import { Schema, models, model, Document } from "mongoose";

export interface IPainting extends Document {
  painting_id: string; // the id of the painting
  title: string; // the title of the painting
  title_chinese: string;
  creation_year: string; // the date the painting was created
  artist_id: string; // the id of the artist
  artist: Schema.Types.ObjectId; // associated artist
  collector_id: string; // the id of the collector
  material: string; // the material of the painting
  material_chinese: string;
  source: string; // 'original' or 'collection' or 'print'
  condition: string; // description of the condition of the painting, like any damage or wear, etc.
  available: boolean; // whether the painting is available for sale
  on_hold: boolean; // whether the painting is on hold
  description: string;
  description_chinese: string;
  seal: string;
  seal_chinese: string;
  inscription: string;
  inscription_chinese: string;

  awards: string[];
  awards_chinese: string[];

  tags: string[];
  all_images: string[];
  all_imageIds: string[];
  all_images_150: string[];
  all_imageIds_150: string[];
  all_images_300: string[];
  all_imageIds_300: string[];
  all_images_1000: string[];
  all_imageIds_1000: string[];
  image_is_rendered: boolean[];

  views: number;
  discounts: Schema.Types.ObjectId[];
  favorited_by: Schema.Types.ObjectId[];
  associated_order: Schema.Types.ObjectId;

  image_height: number;
  image_width: number;
  overall_height: number;
  overall_width: number;
  is_framed: boolean;
  selling_price: number;
  mount_description: string;

  featured: boolean;
  homepage: boolean;
}

const PaintingSchema = new Schema<IPainting>({
  painting_id: { type: String, required: true },
  title: { type: String },
  title_chinese: { type: String },
  creation_year: { type: String },
  artist_id: { type: String },
  artist: { type: Schema.Types.ObjectId, ref: "Artist" },
  collector_id: { type: String, required: false },
  material: { type: String },
  material_chinese: { type: String },
  source: { type: String, default: "original" },
  condition: { type: String },
  available: { type: Boolean, default: true },
  on_hold: { type: Boolean, default: false },
  description: { type: String, default: "" },
  description_chinese: { type: String },
  seal: { type: String },
  seal_chinese: { type: String },
  inscription: { type: String },
  inscription_chinese: { type: String },

  awards: { type: [String] },
  awards_chinese: { type: [String] },

  tags: { type: [String], required: false },
  all_images: { type: [String], required: false },
  all_imageIds: { type: [String], required: false },
  all_images_150: { type: [String], required: false },
  all_imageIds_150: { type: [String], required: false },
  all_images_300: { type: [String], required: false },
  all_imageIds_300: { type: [String], required: false },
  all_images_1000: { type: [String], required: false },
  all_imageIds_1000: { type: [String], required: false },
  image_is_rendered: { type: [Boolean], required: false },

  views: { type: Number, required: true },
  discounts: [{ type: Schema.Types.ObjectId, ref: "Discount" }],
  favorited_by: [{ type: Schema.Types.ObjectId, ref: "User" }],
  associated_order: { type: Schema.Types.ObjectId, ref: "Order" },

  image_height: { type: Number, required: true },
  image_width: { type: Number, required: true },
  overall_height: { type: Number, required: true },
  overall_width: { type: Number, required: true },
  is_framed: { type: Boolean, required: true },
  selling_price: { type: Number, required: true },
  mount_description: { type: String },

  featured: { type: Boolean, default: false },
  homepage: { type: Boolean, default: false },
});

const Painting = models.Painting || model("Painting", PaintingSchema);

export default Painting;

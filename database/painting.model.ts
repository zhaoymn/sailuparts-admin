import { Schema, models, model, Document } from 'mongoose';

export interface IPainting extends Document {
  painting_id: string; // the id of the painting
  title: string; // the title of the painting
  title_chinese: string; 
  creation_year: string; // the date the painting was created
  artist_id: string; // the id of the artist
  artist: Schema.Types.ObjectId; // associated artist
  collector_id: Schema.Types.ObjectId; // associated collector
  material: string; // the material of the painting
  material_chinese: string;
  situation: string; // the situation of the painting
  price_mounted: number;
  price_finished: number;
  height_raw: number;
  width_raw: number;
  height_mounted: number;
  width_mounted: number;
  height_finished: number;
  width_finished: number;
  mounted_format: string;
  finished_format: string;
  source: string; // 'original' or 'collection' or 'print'
  condition: string; // description of the condition of the painting, like any damage or wear, etc.
  status: string; // available or sold
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
  all_images_150: string[];
  all_images_300: string[];
  all_images_1000: string[];
  image_is_rendered: boolean[];

  views: number;
  discounts: Schema.Types.ObjectId[];
  favorited_by: Schema.Types.ObjectId[];
  associated_order: Schema.Types.ObjectId;
}

const PaintingSchema = new Schema<IPainting>({
  painting_id: { type: String, required: true },
  title: { type: String, required: true },
  title_chinese: { type: String },
  creation_year: { type: String, required: true },
  artist_id: { type: String, required: true },
  artist: { type: Schema.Types.ObjectId, ref: 'Artist' },
  collector_id: { type: Schema.Types.ObjectId, ref: 'Collector' },
  material: { type: String, required: true },
  material_chinese: { type: String },
  situation: { type: String, required: true },
  price_mounted: { type: Number, required: false },
  price_finished: { type: Number, required: false },
  height_raw: { type: Number, required: false },
  width_raw: { type: Number, required: false },
  height_mounted: { type: Number, required: false },
  width_mounted: { type: Number, required: false },
  height_finished: { type: Number, required: false },
  width_finished: { type: Number, required: false },
  mounted_format: { type: String, required: false },
  finished_format: { type: String, required: false },
  source: { type: String, required: true },
  condition: { type: String },
  status: { type: String, required: true },
  description: { type: String, required: true },
  description_chinese: { type: String },
  seal: { type: String },
  seal_chinese: { type: String },
  inscription: { type: String },
  inscription_chinese: { type: String },

  awards: { type: [String] },
  awards_chinese: { type: [String] },

  tags: { type: [String], required: false },
  all_images: { type: [String], required: false },
  all_images_150: { type: [String], required: false },
  all_images_300: { type: [String], required: false },
  all_images_1000: { type: [String], required: false },
  image_is_rendered: { type: [Boolean], required: false },

  views: { type: Number, required: true },
  discounts: [{ type: Schema.Types.ObjectId, ref: 'Discount' }],
  favorited_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  associated_order: { type: Schema.Types.ObjectId, ref: 'Order' },
});

const Painting = models.Painting || model('Painting', PaintingSchema);

export default Painting;
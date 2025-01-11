import { Schema, models, model, Document } from "mongoose";

export interface IArtist extends Document {
  artist_id: string;
  name: string; // English name
  title: string;
  name_chinese: string; // Chinese name
  birth_year: number;
  bio: string;
  bio_chinese: string;

  profile_image: string;
  profile_imageId: string;
  paintings: Schema.Types.ObjectId[];
  favorited_by: Schema.Types.ObjectId[];
  featured: boolean;
  views: number;
  short_description: string;
  key_points: {
    education: string;
    current_profession: string;
    best_achievement: string;
  };
  awards: string;
  exhibitions: string;
  external_links: string;
}

const ArtistSchema = new Schema<IArtist>({
  artist_id: { type: String, required: true },
  name: { type: String, required: true },
  title: { type: String, required: true },
  name_chinese: { type: String, required: true },
  birth_year: { type: Number },
  bio: { type: String, required: true },
  bio_chinese: { type: String, required: true },

  profile_image: { type: String, required: true },
  profile_imageId: { type: String },
  paintings: [{ type: Schema.Types.ObjectId, ref: "Painting" }],
  favorited_by: [{ type: Schema.Types.ObjectId, ref: "User" }],
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  short_description: { type: String, required: true },
  key_points: {
    education: { type: String, required: true },
    current_profession: { type: String, required: true },
    best_achievement: { type: String, required: true },
  },
  awards: { type: String, required: false },
  exhibitions: { type: String, required: false },
  external_links: { type: String, required: false },
});

const Artist = models.Artist || model("Artist", ArtistSchema);

export default Artist;

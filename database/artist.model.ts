import { Schema, models, model, Document } from 'mongoose';

export interface IArtist extends Document {
  artist_id: string;
  name: string; // English name
  name_chinese: string; // Chinese name
  birth_year: number;
  bio: string;
  bio_chinese: string;

  profile_image: string;
  paintings: Schema.Types.ObjectId[];
  favorited_by: Schema.Types.ObjectId[];
  featured: boolean;
  views: number;
}

const ArtistSchema = new Schema<IArtist>({
  artist_id: { type: String, required: true },
  name: { type: String, required: true },
  name_chinese: { type: String, required: true },
  birth_year: { type: Number },
  bio: { type: String, required: true },
  bio_chinese: { type: String, required: true },
  
  profile_image: { type: String, required: true },
  paintings: [{ type: Schema.Types.ObjectId, ref: 'Painting' }],
  favorited_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
});

const Artist = models.Artist || model('Artist', ArtistSchema);

export default Artist;

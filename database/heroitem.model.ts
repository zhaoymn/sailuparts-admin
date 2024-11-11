import { Schema, models, model, Document } from 'mongoose';

export interface IHeroItem extends Document {
  title: string;
  artist_name: string;
  artist_id: string;
  artist_name_chinese: string;
  image: string;
  imageId: string;
  painting_id: string;
}

const HeroItemSchema = new Schema<IHeroItem>({
  title: { type: String, required: true },
  artist_name: { type: String, required: true },
  artist_id: { type: String, required: true },
  artist_name_chinese: { type: String },
  image: { type: String, required: true },
  imageId: { type: String, required: false, default: '' },
  painting_id: { type: String, required: true },
});

const HeroItem = models.HeroItem || model('HeroItem', HeroItemSchema);

export default HeroItem;
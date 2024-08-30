import { Schema, models, model, Document } from 'mongoose';

export interface ICollector extends Document {
  collector_name: string;
  collector_name_chinese: string;
  anonymous: boolean;
  introduction: string;
  introduction_chinese: string;
  paintings: Schema.Types.ObjectId[];
}

const CollectorSchema = new Schema<ICollector>({
  collector_name: { type: String, required: true },
  collector_name_chinese: { type: String },
  anonymous: { type: Boolean },
  introduction: { type: String },
  introduction_chinese: { type: String },
  paintings: [{ type: Schema.Types.ObjectId, ref: 'Painting' }],
});

const Collector = models.Collector || model('Collector', CollectorSchema);

export default Collector;
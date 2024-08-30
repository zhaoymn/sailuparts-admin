import { Schema, models, model, Document } from 'mongoose';

export interface IDiscount extends Document {
  code: string;
  discount: number;
  description: string;
  start_date: Date;
  end_date: Date;
  applicable_items: Schema.Types.ObjectId[];
}

const DiscountSchema = new Schema<IDiscount>({
  code: { type: String, required: true },
  discount: { type: Number, required: true },
  description: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  applicable_items: [{ type: Schema.Types.ObjectId, ref: 'Painting' }],
});

const Discount = models.Discount || model('Discount', DiscountSchema);

export default Discount;
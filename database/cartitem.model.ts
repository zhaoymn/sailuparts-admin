import { Schema, models, model, Document } from 'mongoose';

export interface ICartItem extends Document {
  painting: Schema.Types.ObjectId;
  painting_id: string;
  user_clerkId: string;
  framing: string;
  price: number;
  available: boolean;
}

const CartItemSchema = new Schema<ICartItem>({
  painting: { type: Schema.Types.ObjectId, ref: 'Painting' },
  painting_id: { type: String, required: true },
  user_clerkId: { type: String },
  framing: { type: String, required: true },
  price: { type: Number, required: true },
  available: { type: Boolean, required: true },
});

const CartItem = models.CartItem || model('CartItem', CartItemSchema);

export default CartItem;
import { Schema, models, model, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  picture: string;
  email: string;
  favorited_artists: Schema.Types.ObjectId[];
  favorited_paintings: Schema.Types.ObjectId[];
  viewing_history: Schema.Types.ObjectId[];
  orders: Schema.Types.ObjectId[];
  cart: Schema.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true },
  picture: { type: String, required: true },
  email: { type: String, required: true },
  favorited_artists: [{ type: Schema.Types.ObjectId, ref: 'Artist' }],
  favorited_paintings: [{ type: Schema.Types.ObjectId, ref: 'Painting' }],
  viewing_history: [{ type: Schema.Types.ObjectId, ref: 'Painting' }],
  orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
  cart: [{ type: Schema.Types.ObjectId, ref: 'CartItem' }],
});

const User = models.User || model('User', UserSchema);

export default User;
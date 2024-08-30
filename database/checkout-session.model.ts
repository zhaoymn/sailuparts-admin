import { Schema, models, model, Document } from 'mongoose';

export interface ICheckoutSession extends Document {
  session_id: string;
  user_clerkId: string;
  date: Date;
  session_details: string;
}

const CheckoutSessionSchema = new Schema<ICheckoutSession>({
  session_id: { type: String, required: true },
  user_clerkId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  session_details: { type: String },
});

const CheckoutSession = models.CheckoutSession || model('CheckoutSession', CheckoutSessionSchema);

export default CheckoutSession;
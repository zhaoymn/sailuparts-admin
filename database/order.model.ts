import { Schema, models, model, Document } from 'mongoose';

export interface IOrder extends Document {
  user: Schema.Types.ObjectId;
  clerkId: string;
  date: Date;
  paintings: string[];
  painting_framings: string[];
  stripe_payment_intent_id: string;
  stripe_checkout_session_id: string;
  amount_paid: number;
  order_status: string; // 'paid', 'shipped', 'delivered'
}

const OrderSchema = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  clerkId: { type: String, required: true },
  date: { type: Date, required: true },
  paintings: { type: [String], required: true },
  painting_framings: { type: [String], required: true },
  stripe_payment_intent_id: { type: String, required: true },
  stripe_checkout_session_id: { type: String, required: true },
  amount_paid: { type: Number, required: true },
  order_status: { type: String, required: true}
});


const Order = models.Order || model('Order', OrderSchema);

export default Order;
import { Schema, models, model, Document } from 'mongoose';

export interface IPaymentIntent extends Document {
  payment_intent_id: string;
  date: Date;
  payment_details: string;
}

const PaymentIntentSchema = new Schema<IPaymentIntent>({
  payment_intent_id: { type: String, required: true },
  date: { type: Date, default: Date.now },
  payment_details: { type: String },
});

const PaymentIntent = models.PaymentIntent || model('PaymentIntent', PaymentIntentSchema);

export default PaymentIntent;
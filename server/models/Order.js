import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, default: 1, min: 1 },
  style: { type: String, default: 'Bespoke Custom Frame' },
  image: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  custom_design_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomDesign',
    default: null,
    index: true
  },
  order_number: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  total_price: {
    type: Number,
    required: [true, 'Total price is required'],
    min: 0
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'crafting', 'dispatched', 'delivered', 'cancelled'],
    default: 'placed',
    index: true
  },
  shipping_address: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  payment_info: {
    method: { type: String, default: 'razorpay' },
    status: { type: String, default: 'paid' },
    payment_id: { type: String, default: null }
  },
  placed_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const Order = mongoose.model('Order', orderSchema);

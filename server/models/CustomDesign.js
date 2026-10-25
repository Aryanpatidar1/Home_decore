import mongoose from 'mongoose';

const customDesignSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required'],
    index: true
  },
  design_json: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Design payload is required']
  },
  preview_image_path: {
    type: String,
    default: null
  },
  room_image_path: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'saved', 'ordered'],
    default: 'saved',
    index: true
  }
}, {
  timestamps: true
});

export const CustomDesign = mongoose.model('CustomDesign', customDesignSchema);

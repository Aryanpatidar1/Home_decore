import mongoose from 'mongoose';

const roomImageSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  path: {
    type: String,
    required: true
  },
  ai_style: {
    type: String,
    default: null
  },
  ai_suggestions: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true
});

export const RoomImage = mongoose.model('RoomImage', roomImageSchema);

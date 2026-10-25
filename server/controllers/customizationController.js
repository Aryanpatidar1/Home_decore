import { CustomDesign } from '../models/CustomDesign.js';
import { RoomImage } from '../models/RoomImage.js';
import { Product } from '../models/Product.js';

export const saveDesign = async (req, res, next) => {
  try {
    const { product_id } = req.body;
    let design_json = req.body.design_json;

    if (!product_id) {
      return res.status(422).json({ message: 'Product ID is required.' });
    }

    if (typeof design_json === 'string') {
      try {
        design_json = JSON.parse(design_json);
      } catch (e) {
        return res.status(422).json({ message: 'Design payload must be valid JSON object.' });
      }
    }

    if (!design_json || typeof design_json !== 'object') {
      return res.status(422).json({ message: 'Design payload must be a valid object.' });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Specified product does not exist.' });
    }

    let roomImagePath = req.body.room_image_path || null;

    if (req.file) {
      roomImagePath = `/uploads/${req.file.filename}`;
      await RoomImage.create({
        user_id: req.user ? req.user._id : null,
        path: roomImagePath
      });
    }

    const design = await CustomDesign.create({
      user_id: req.user ? req.user._id : null,
      product_id,
      design_json,
      room_image_path: roomImagePath,
      preview_image_path: req.body.preview_image_path || null,
      status: 'saved'
    });

    res.status(201).json({
      success: true,
      status: 'saved',
      design_id: design._id,
      preview_url: `/designs/${design._id}/preview`,
      data: design
    });
  } catch (error) {
    next(error);
  }
};

export const getDesignById = async (req, res, next) => {
  try {
    const design = await CustomDesign.findById(req.params.id).populate('product_id');
    if (!design) {
      return res.status(404).json({ message: 'Custom design not found.' });
    }

    res.json({
      success: true,
      data: {
        ...design.toObject(),
        product: design.product_id
      }
    });
  } catch (error) {
    next(error);
  }
};

export const uploadRoomImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(422).json({ message: 'No image file uploaded.' });
    }

    const roomImagePath = `/uploads/${req.file.filename}`;
    const roomImage = await RoomImage.create({
      user_id: req.user ? req.user._id : null,
      path: roomImagePath
    });

    res.status(201).json({
      success: true,
      status: 'uploaded',
      room_image_id: roomImage._id,
      image_path: roomImagePath
    });
  } catch (error) {
    next(error);
  }
};

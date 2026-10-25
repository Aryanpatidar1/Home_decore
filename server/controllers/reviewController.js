import { Review } from '../models/Review.js';

export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product_id: req.params.productId })
      .sort({ createdAt: -1 })
      .populate('user_id', 'name');

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    if (!rating || !comment) {
      return res.status(422).json({ message: 'Rating and comment are required.' });
    }

    const review = await Review.create({
      user_id: req.user._id,
      product_id: productId,
      rating: Number(rating),
      comment: comment.trim()
    });

    const populatedReview = await Review.findById(review._id).populate('user_id', 'name');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: populatedReview
    });
  } catch (error) {
    next(error);
  }
};

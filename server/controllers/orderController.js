import { Order } from '../models/Order.js';
import { CustomDesign } from '../models/CustomDesign.js';
import { Product } from '../models/Product.js';

const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${dateStr}-${randomStr}`;
};

export const createOrder = async (req, res, next) => {
  try {
    const { custom_design_id, items, shipping_address, payment_info } = req.body;

    let calculatedTotal = 0;
    let orderItems = [];
    let linkedDesign = null;

    if (custom_design_id) {
      linkedDesign = await CustomDesign.findById(custom_design_id).populate('product_id');
      if (!linkedDesign) {
        return res.status(404).json({ message: 'Selected custom design does not exist.' });
      }

      const product = linkedDesign.product_id;
      if (!product) {
        return res.status(422).json({ message: 'Custom design has no valid product attached.' });
      }

      const subtotal = product.base_price;
      const gst = subtotal * 0.18;
      calculatedTotal = subtotal + gst;

      orderItems = [{
        product_id: product._id,
        name: product.name,
        price: product.base_price,
        qty: 1,
        style: linkedDesign.design_json?.frame_style || 'Bespoke Custom Frame',
        image: linkedDesign.room_image_path || product.image_path
      }];

      linkedDesign.status = 'ordered';
      await linkedDesign.save();
    } else if (items && Array.isArray(items) && items.length > 0) {
      let subtotal = 0;
      for (const item of items) {
        const itemPrice = parseFloat(item.price);
        const itemQty = parseInt(item.qty, 10) || 1;
        subtotal += itemPrice * itemQty;

        orderItems.push({
          product_id: item.id || item.product_id || null,
          name: item.name,
          price: itemPrice,
          qty: itemQty,
          style: item.style || 'Bespoke Collective',
          image: item.image
        });
      }

      const gst = subtotal * 0.18;
      calculatedTotal = subtotal + gst;
    } else {
      return res.status(422).json({ message: 'Order must specify either a custom_design_id or cart items.' });
    }

    if (!shipping_address) {
      return res.status(422).json({ message: 'Shipping address is required.' });
    }

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      user_id: req.user ? req.user._id : null,
      custom_design_id: linkedDesign ? linkedDesign._id : null,
      order_number: orderNumber,
      total_price: calculatedTotal,
      items: orderItems,
      shipping_address,
      payment_info: {
        method: payment_info?.method || 'razorpay',
        status: payment_info?.status || 'paid',
        payment_id: payment_info?.payment_id || `rzp_${Date.now()}`
      },
      status: 'placed',
      placed_at: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      status: 'placed',
      order_id: order._id,
      order_number: order.order_number,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'custom_design_id',
        populate: { path: 'product_id' }
      });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: 'custom_design_id',
      populate: { path: 'product_id' }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.user_id && req.user && req.user.role !== 'admin' && !order.user_id.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied: You cannot view another user\'s order.' });
    }

    res.json({
      success: true,
      data: {
        ...order.toObject(),
        customDesign: order.custom_design_id,
        product: order.custom_design_id?.product_id || (order.items?.[0] ? order.items[0] : null)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('user_id', 'name email')
      .populate({
        path: 'custom_design_id',
        populate: { path: 'product_id' }
      });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['placed', 'confirmed', 'crafting', 'dispatched', 'delivered', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(422).json({ message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}.`,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

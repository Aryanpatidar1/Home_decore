# HomeDecor (Aura Decor) Migration Map: Laravel to MERN Stack

## 1. Executive Summary & Architecture Overview

The **HomeDecor (Aura Decor)** e-commerce application is a bespoke luxury interior décor platform featuring:
- An interactive dynamic product showroom with category/room/style filters and quick view modals.
- An interactive Room Visualizer & Customization Studio powered by HTML5 Canvas (real-time canvas rendering, customizable dimensions, frame mouldings, scene backdrops, scaling, and dragging).
- AI Vector Art Spec Generator and Multi-modal Spatial Interior Designer integrating Google Gemini and Pollinations AI.
- A client-side and authenticated cart workflow with 18% GST calculation, address capture, and Razorpay checkout simulation.
- Customer dashboard for tracking orders, milestone production stages, and saved curation specifications.

This document details the exact 1-to-1 mapping from Laravel 11 / PHP / Blade / MySQL to Node.js / Express / React (Vite) / MongoDB.

---

## 2. Database Mapping: MySQL to MongoDB (Mongoose)

| Laravel MySQL Table | Mongoose Model | File Path | Key Attributes & Conversion Details |
|---|---|---|---|
| `users` | `User` | `server/models/User.js` | `name`, `email` (unique index), `password` (hashed with bcryptjs, 12 rounds), `role` ('customer' \| 'admin'), `addresses` (array of subdocuments: street, city, state, postalCode, phone, isDefault), `createdAt`, `updatedAt` |
| `products` | `Product` | `server/models/Product.js` | `name`, `description`, `category` (Wall Decor, Lighting, Soft Furnishings, Decorative Accents, Rugs & Mats), `base_price` (Number), `image_path` (String), `is_active` (Boolean, default true), `stock` (Number, default 50), timestamps |
| `custom_designs` | `CustomDesign` | `server/models/CustomDesign.js` | `user_id` (ref: 'User', nullable), `product_id` (ref: 'Product', required), `design_json` (Mixed/Object containing color, size, scale, frame_style, ai_art_spec, backdrop, offset_x, offset_y, frame_w, frame_h, product_category), `preview_image_path`, `room_image_path`, `status` ('draft', 'saved', 'ordered'), timestamps |
| `orders` | `Order` | `server/models/Order.js` | `user_id` (ref: 'User', nullable), `custom_design_id` (ref: 'CustomDesign', nullable), `order_number` (String, unique indexed e.g. ORD-YYYYMMDD-XXXXXX), `total_price` (Number), `items` (Array of items: productId, name, price, qty, style, image), `status` ('placed', 'confirmed', 'crafting', 'dispatched', 'delivered', 'cancelled'), `shipping_address` (Object: name, phone, email, address, city, postal_code), `payment_info` (method, status, payment_id), `placed_at` (Date), timestamps |
| `room_images` | `RoomImage` | `server/models/RoomImage.js` | `user_id` (ref: 'User', nullable), `path` (String), `ai_style` (String), `ai_suggestions` (Mixed), timestamps |
| *(Extended)* `reviews` | `Review` | `server/models/Review.js` | `user_id` (ref: 'User'), `product_id` (ref: 'Product'), `rating` (Number 1-5), `comment` (String), timestamps |

---

## 3. Route & Endpoint Mapping

### A. Client-Side Page Routes (React Router DOM)

| Laravel Blade Route | URI | React Router Route | React Page Component | Access Level |
|---|---|---|---|---|
| `home` | `/` | `/` | `pages/Home.jsx` | Public |
| `products.index` | `/products` | `/products` | `pages/Products.jsx` | Public |
| `customize.index` | `/customize` | `/customize` | `pages/CustomizeIndex.jsx` | Public |
| `products.customize` | `/products/:id/customize` | `/products/:id/customize` | `pages/CustomizeStudio.jsx` | Public |
| `designs.preview` | `/designs/:id/preview` | `/designs/:id/preview` | `pages/DesignPreview.jsx` | Public |
| `cart.index` | `/cart` | `/cart` | `pages/Cart.jsx` | Public |
| `ai.designer` | `/ai-designer` | `/ai-designer` | `pages/AiDesigner.jsx` | Public |
| `login` | `/login` | `/login` | `pages/Login.jsx` | Guest |
| `register` | `/register` | `/register` | `pages/Register.jsx` | Guest |
| `dashboard` | `/dashboard` | `/dashboard` | `pages/Dashboard.jsx` | Protected (User) |
| `orders.show` | `/orders/:id` | `/orders/:id` | `pages/OrderConfirmation.jsx` | Protected (User) |
| *(Admin)* | `/admin` | `/admin` | `pages/AdminDashboard.jsx` | Protected (Admin) |

### B. Backend REST API Endpoints (Express.js)

| Laravel Method & Route | Express Method & URI | Controller & Handler | Middleware | Description |
|---|---|---|---|---|
| `POST /register` | `POST /api/auth/register` | `authController.register` | None | Register new user, hash password, return JWT token and user profile |
| `POST /login` | `POST /api/auth/login` | `authController.login` | Rate limiter | Authenticate credentials, return JWT token |
| `POST /logout` | `POST /api/auth/logout` | `authController.logout` | `verifyToken` | Invalidate client session / acknowledge logout |
| `GET /api/auth/me` | `GET /api/auth/me` | `authController.getMe` | `verifyToken` | Fetch logged-in user profile and addresses |
| `GET /products` | `GET /api/products` | `productController.getProducts` | None | Get active products (supports category, room, style, search, sorting) |
| `GET /products/{id}` | `GET /api/products/:id` | `productController.getProductById` | None | Get single product by ID |
| `POST /api/products` | `POST /api/products` | `productController.createProduct` | `verifyToken`, `isAdmin`, `upload.single` | Admin create product |
| `PUT /api/products/:id` | `PUT /api/products/:id` | `productController.updateProduct` | `verifyToken`, `isAdmin`, `upload.single` | Admin update product |
| `DELETE /api/products/:id`| `DELETE /api/products/:id` | `productController.deleteProduct` | `verifyToken`, `isAdmin` | Admin toggle/delete product |
| `POST /designs` | `POST /api/designs` | `customizationController.saveDesign` | `optionalAuth`, `upload.single` | Save custom visualizer design + room upload |
| `GET /designs/{id}` | `GET /api/designs/:id` | `customizationController.getDesignById` | None | Retrieve custom design with populated product |
| `POST /room-images` | `POST /api/designs/room-image` | `customizationController.uploadRoomImage` | `optionalAuth`, `upload.single` | Upload room overlay image |
| `POST /orders` | `POST /api/orders` | `orderController.createOrder` | `verifyToken` | Create custom design order or direct cart checkout |
| `GET /dashboard` (orders) | `GET /api/orders` | `orderController.getUserOrders` | `verifyToken` | Get all orders belonging to authenticated user |
| `GET /orders/{order}` | `GET /api/orders/:id` | `orderController.getOrderById` | `verifyToken` | Get order details with custom design & product |
| `GET /api/admin/orders` | `GET /api/admin/orders` | `orderController.getAllOrders` | `verifyToken`, `isAdmin` | Admin list all orders across system |
| `PATCH /api/admin/orders/:id/status` | `PATCH /api/admin/orders/:id/status` | `orderController.updateOrderStatus` | `verifyToken`, `isAdmin` | Update milestone status (placed -> confirmed -> crafting -> dispatched -> delivered) |
| `POST /api/ai/generate-art` | `POST /api/ai/generate-art` | `aiController.generateArtSpec` | None | Generate vector spec with Gemini AI + synthesized image |
| `POST /api/ai/analyze-room` | `POST /api/ai/analyze-room` | `aiController.analyzeRoom` | `upload.single` | Analyze room photo and prompt with Gemini AI multi-modal |
| `POST /api/ai/recommend` | `POST /api/ai/recommend` | `aiController.recommend` | None | Fallback recommendation engine |

---

## 4. Frontend Component & State Architecture

### A. State Management (React Context API)
- **`AuthContext` (`context/AuthContext.jsx`)**: Manages JWT authentication state, user object, login, register, logout, profile updates, and persistence in `localStorage`.
- **`CartContext` (`context/CartContext.jsx`)**: Manages shopping cart items (`aura_cart`), quantities, item removal, subtotal calculation, 18% GST calculation, and global badge counter.
- **`ToastContext` (`context/ToastContext.jsx`)**: Global elegant notifications for toast alerts (success, error, info).

### B. Layouts & Shared Components
- **`layouts/MainLayout.jsx`**: Main application wrapper featuring the sticky glassmorphic TopNavbar, mobile slide-over drawer, footer, and flash messages.
- **`components/Navbar.jsx`**: Responsive navbar with Brand logo, navigation links, portfolio link, cart bag badge counter, login/signup/logout actions.
- **`components/Footer.jsx`**: Curated footer with collection links, experience links, and newsletter subscription form.
- **`components/AestheticQuizModal.jsx`**: The 3-Step interactive Aesthetic Discovery Quiz with animated progress bar and matching curation recommendation.
- **`components/QuickViewModal.jsx`**: Product quick view modal with specs, materials, and quick Add to Cart.
- **`components/RazorpayModal.jsx`**: Razorpay checkout dialog with UPI ID selection, instant feedback, and SSL verification badges.
- **`components/ProtectedRoute.jsx`**: React Router route wrapper requiring user authentication.
- **`components/AdminRoute.jsx`**: React Router route wrapper requiring admin privileges.

---

## 5. Security & Migration Checklist

1. **Password Security**: Passwords hashed with `bcryptjs` using 12 salt rounds matching Laravel's default `BCRYPT_ROUNDS=12`.
2. **JWT Authentication**: Signed with `JWT_SECRET` stored in environment variables, expiring in 7 days.
3. **Data Protection**: Users can only query and mutate their own orders and designs; admin routes are guarded with `isAdmin` middleware.
4. **CORS & Rate Limiting**: Express configured with `cors` with configured `CLIENT_URL` whitelist, plus `express-rate-limit` for authentication routes.
5. **Multer Uploads**: Whitelisted image extensions (JPEG, PNG, WebP) with a 5MB size limit stored in `server/uploads/` and served statically.
6. **Data Seeder Script**: `server/utils/seedDatabase.js` populates all 15 initial curated products across 5 categories identical to `ProductSeeder.php`.

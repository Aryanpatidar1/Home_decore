# Aura Decor — Full-Stack MERN E-Commerce Platform

A luxury home décor e-commerce application with real-time interactive canvas visualizer and AI spatial computing designer, migrated from Laravel / Blade / MySQL to a standalone MERN stack (MongoDB, Express.js, React + Vite, Node.js).

---

## 1. Technology Stack

### Frontend
- **Framework**: React.js 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **State Management**: React Context API (`AuthContext`, `CartContext`, `ToastContext`)
- **HTTP Client**: Axios with automated bearer token interception
- **Icons**: Lucide React & Google Material Symbols Outlined
- **Canvas Rendering**: Native HTML5 Canvas 2D Engine

### Backend
- **Runtime**: Node.js v20+
- **Server Framework**: Express.js (REST APIs)
- **Database**: MongoDB via Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with 7-day expiration
- **Password Hashing**: bcryptjs (12 salt rounds)
- **File Uploads**: Multer (5MB limit, image mime type whitelist)
- **Security**: CORS origin whitelist, Express rate-limiter, sanitized input handling
- **AI Integrations**: Google Gemini API multi-modal integration + Pollinations AI server-side proxy

---

## 2. Directory Structure

```
HomeDecor-MERN/
├── client/                      # React + Vite Frontend
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # Reusable UI components (Navbar, Footer, Modals)
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── AestheticQuizModal.jsx
│   │   │   ├── QuickViewModal.jsx
│   │   │   ├── RazorpayModal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AdminRoute.jsx
│   │   ├── context/             # React Contexts
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx   # Top-level shell with Header/Footer/Modals
│   │   ├── pages/               # Application pages
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── CustomizeIndex.jsx
│   │   │   ├── CustomizeStudio.jsx
│   │   │   ├── DesignPreview.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── OrderConfirmation.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AiDesigner.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js           # Central Axios client
│   │   ├── App.jsx              # Route definitions
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Tailwind directives & typography
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                      # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                # MongoDB connection handler
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── customizationController.js
│   │   ├── orderController.js
│   │   ├── aiController.js
│   │   └── reviewController.js
│   ├── middleware/
│   │   ├── auth.js              # verifyToken, optionalAuth, isAdmin
│   │   ├── upload.js            # Multer file upload handler
│   │   └── errorHandler.js      # Global error middleware
│   ├── models/                  # Mongoose Schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── CustomDesign.js
│   │   ├── Order.js
│   │   ├── RoomImage.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── customizationRoutes.js
│   │   ├── orderRoutes.js
│   │   └── aiRoutes.js
│   ├── tests/
│   │   └── apiTest.js           # Automated end-to-end API test suite
│   ├── uploads/                 # Uploaded room photos & products
│   ├── utils/
│   │   └── seedDatabase.js      # Seed script for 15 initial products & demo users
│   ├── .env.example
│   ├── package.json
│   └── server.js                # Express app entry point
│
├── MIGRATION_MAP.md             # Detailed Laravel to MERN conversion mapping
└── README.md                    # Setup and execution guide
```

---

## 3. Prerequisites

- **Node.js**: v18.0.0 or higher (v24 recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance running on `localhost:27017` or a MongoDB Atlas connection URI

---

## 4. Installation & Setup

### Step 1: Install Backend Dependencies & Seed Database

```bash
# Navigate to the backend server directory
cd HomeDecor-MERN/server

# Install dependencies
npm install

# (Optional) Review or edit environment configuration
cp .env.example .env

# Populate MongoDB with all 15 catalog products and demo users
npm run seed
```

#### Seeded Demo Accounts:
- **Administrator**:
  - Email: `admin@auradecor.com`
  - Password: `password123`
  - Role: `admin` (Has access to `/admin` dashboard to manage orders & catalog)
- **Demo Customer**:
  - Email: `user@example.com`
  - Password: `password123`
  - Role: `customer` (Has populated portfolio and saved addresses)

---

### Step 2: Install Frontend Dependencies & Build

```bash
# Navigate to the frontend client directory
cd ../client

# Install dependencies
npm install

# Test production build
npm run build
```

---

## 5. Running the Application

### Option A: Development Mode (Recommended)

Open two terminal windows:

**Terminal 1 — Backend Server:**
```bash
cd HomeDecor-MERN/server
npm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 — React Frontend:**
```bash
cd HomeDecor-MERN/client
npm run dev
# Frontend starts on http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser.

---

### Option B: Production Mode

```bash
# 1. Build the React frontend
cd HomeDecor-MERN/client
npm run build

# 2. Start the Express server
cd ../server
npm start
```

### Deploying to Vercel

The frontend and API are separate Vercel projects. Configure both projects to use
this repository and the `main` branch:

1. **Frontend project**
   - Set **Root Directory** to `client`.
   - Use `npm run build` as the build command and `dist` as the output directory.
   - Add `VITE_API_URL` as an environment variable. Set it to the full backend
     URL ending in `/api`, for example `https://<your-server-domain>/api`.
   - Redeploy after changing the environment variable; Vite embeds it at build time.
2. **Backend project**
   - Set **Root Directory** to `server`.
   - Add `MONGODB_URI` and `JWT_SECRET` as environment variables. Set `CLIENT_URL`
     to the deployed frontend URL. `GEMINI_API_KEY` is optional.
   - Allow the backend deployment to access your MongoDB Atlas cluster.

The frontend defaults to `/api` when `VITE_API_URL` is unset, which only works
when the API is served from the same domain. Since these Vercel projects are
separate, configure `VITE_API_URL` before deploying the frontend. Keep real
credentials in Vercel environment settings or local `.env` files; never put them
in `.env.example` or commit them.

---

## 6. Running Automated Tests

A comprehensive 14-step automated test suite verifies:
1. Health check endpoint
2. Product collection querying & category filtering
3. Single product query
4. Customer login & JWT issuance
5. Authenticated `/api/auth/me` profile resolution
6. AI Art spec generation & fallback mechanism
7. AI Spatial room harmony diagnostics
8. Custom design saving & validation
9. Populated design retrieval
10. Order placement with server price & GST verification
11. Order confirmation invoice generation
12. Customer portfolio order archiving
13. Admin role authorization check
14. Production milestone status transition (`placed` -> `crafting`)

```bash
# Ensure server is running or start it, then in server directory:
cd HomeDecor-MERN/server
node tests/apiTest.js
```

---

## 7. Key Features Migrated

1. **Brand Identity & Responsive Design**:
   - Matches original "Aura Decor" luxury styling, emerald green palette, typography, and glassmorphic navigation.
2. **Product Catalog & Filters**:
   - Full filtering by categories: Wall Décor, Lighting, Soft Furnishings, Accents, Rugs & Mats.
   - Filtering by target room (`Living Room`, `Bedroom`, etc.) and decor personality (`Minimalist`, `Japandi`, etc.).
   - Interactive Quick View modal with instant Add to Cart.
3. **Interactive Studio Visualizer**:
   - Real-time HTML5 Canvas rendering on photo-realistic backdrops.
   - Interactive drag & drop repositioning of frames.
   - Scale adjuster (50% to 150%) and standard dimension toggles (A4, A3, A2).
   - Frame moulding styles (Charcoal Ash, Raw Oak, Bespoke Gold, Borderless).
   - Category-specific rendering for Lighting fixtures, Soft Furnishings, Rugs, and Accents.
4. **AI Interior Designer Suite**:
   - Neural design prompt engine generating vector layouts and color swatches.
   - Spatial diagnostics report with harmony analysis, lighting assessment, and recommended palettes.
5. **Shopping Cart & Checkout**:
   - LocalStorage + Backend synchronized cart state.
   - Server-verified total price with 18% GST calculation.
   - Integrated Razorpay payment modal with UPI, Cards, and Netbanking support.
6. **Customer Dashboard**:
   - Portfolio of active curations, design specification archives, and order status tracking.
7. **Admin Dashboard**:
   - Manage all customer orders and advance production milestone statuses (`placed` -> `confirmed` -> `crafting` -> `dispatched` -> `delivered`).
   - Catalog management: add new products, adjust pricing, toggle visibility, and update stock.

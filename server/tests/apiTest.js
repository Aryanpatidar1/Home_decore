import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('════════════════════════════════════════════════════════════');
  console.log('       Aura Decor MERN Application Automated Test Suite     ');
  console.log('════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  };

  try {
    const healthRes = await axios.get(`${BASE_URL}/health`);
    assert(healthRes.status === 200 && healthRes.data.status === 'online', '1. Server Health Check API');

    const productsRes = await axios.get(`${BASE_URL}/products`);
    assert(
      productsRes.status === 200 && Array.isArray(productsRes.data.data) && productsRes.data.data.length >= 15,
      `2. Catalog Products Query (Returned ${productsRes.data.data.length} seeded products)`
    );

    const sampleProduct = productsRes.data.data[0];
    const productId = sampleProduct._id;

    const singleProductRes = await axios.get(`${BASE_URL}/products/${productId}`);
    assert(
      singleProductRes.status === 200 && singleProductRes.data.data.name === sampleProduct.name,
      `3. Single Product Query by ID (${sampleProduct.name})`
    );

    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'user@example.com',
      password: 'password123'
    });
    assert(
      loginRes.status === 200 && loginRes.data.token && loginRes.data.user.email === 'user@example.com',
      '4. User Login & JWT Token Issuance (user@example.com)'
    );

    const userToken = loginRes.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${userToken}` } };

    const meRes = await axios.get(`${BASE_URL}/auth/me`, authHeaders);
    assert(
      meRes.status === 200 && meRes.data.user.name === 'Arjun Sharma',
      '5. Authenticated User Profile Query (/api/auth/me)'
    );

    const aiSpecRes = await axios.post(`${BASE_URL}/ai/generate-art`, {
      prompt: 'bohemian abstract rising sun with warm earth tones'
    });
    assert(
      aiSpecRes.status === 200 && aiSpecRes.data.status === 'success' && aiSpecRes.data.data.palette_name,
      `6. AI Art Spec Generator (Generated palette: "${aiSpecRes.data.data.palette_name}")`
    );

    const aiRoomRes = await axios.post(`${BASE_URL}/ai/analyze-room`, {
      objective: 'Create a peaceful Japandi reading nook',
      room_scene: 'living'
    });
    assert(
      aiRoomRes.status === 200 && aiRoomRes.data.status === 'success' && Array.isArray(aiRoomRes.data.data.palette),
      '7. AI Spatial Diagnostics & Palette Synthesis'
    );

    const designPayload = {
      product_id: productId,
      design_json: {
        color: '#064e3b',
        size: 'A3',
        scale: 100,
        frame_style: 'oak',
        backdrop: 'living',
        ai_art_spec: aiSpecRes.data.data
      }
    };
    const designRes = await axios.post(`${BASE_URL}/designs`, designPayload, authHeaders);
    assert(
      designRes.status === 201 && designRes.data.status === 'saved' && designRes.data.design_id,
      `8. Custom Design Creation in Studio (Design ID: ${designRes.data.design_id})`
    );
    const designId = designRes.data.design_id;

    const getDesignRes = await axios.get(`${BASE_URL}/designs/${designId}`);
    assert(
      getDesignRes.status === 200 && getDesignRes.data.data.product?.name === sampleProduct.name,
      '9. Populated Custom Design Retrieval (/api/designs/:id)'
    );

    const orderPayload = {
      custom_design_id: designId,
      shipping_address: 'Flat 4B, Prestige Heights, MG Road, Bengaluru — 560001',
      payment_info: {
        method: 'razorpay',
        status: 'paid',
        payment_id: 'rzp_test_123456'
      }
    };
    const orderRes = await axios.post(`${BASE_URL}/orders`, orderPayload, authHeaders);
    assert(
      orderRes.status === 201 && orderRes.data.order_number.startsWith('ORD-') && orderRes.data.data.total_price > 0,
      `10. Order Placement & Server Price Calculation (Order: ${orderRes.data.order_number}, Total: ₹${orderRes.data.data.total_price})`
    );
    const orderId = orderRes.data.order_id;

    const getOrderRes = await axios.get(`${BASE_URL}/orders/${orderId}`, authHeaders);
    assert(
      getOrderRes.status === 200 && getOrderRes.data.data.status === 'placed',
      '11. Order Confirmation Retrieval (/api/orders/:id)'
    );

    const userOrdersRes = await axios.get(`${BASE_URL}/orders`, authHeaders);
    assert(
      userOrdersRes.status === 200 && Array.isArray(userOrdersRes.data.data) && userOrdersRes.data.data.length >= 1,
      `12. Customer Portfolio Orders Query (${userOrdersRes.data.data.length} orders found)`
    );

    const adminLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@auradecor.com',
      password: 'password123'
    });
    assert(
      adminLoginRes.status === 200 && adminLoginRes.data.user.role === 'admin',
      '13. Admin Login & Authorization Verification'
    );
    const adminHeaders = { headers: { Authorization: `Bearer ${adminLoginRes.data.token}` } };

    const updateStatusRes = await axios.patch(
      `${BASE_URL}/orders/${orderId}/status`,
      { status: 'crafting' },
      adminHeaders
    );
    assert(
      updateStatusRes.status === 200 && updateStatusRes.data.data.status === 'crafting',
      '14. Admin Order Production Milestone Transition (placed -> crafting)'
    );

    console.log('\n════════════════════════════════════════════════════════════');
    console.log(`Test Execution Finished: ${passed} PASSED | ${failed} FAILED`);
    console.log('════════════════════════════════════════════════════════════\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test Suite encountered an unexpected error:', error.response?.data || error.message);
    process.exit(1);
  }
};

runTests();

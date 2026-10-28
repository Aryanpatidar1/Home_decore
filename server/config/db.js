import mongoose from 'mongoose';
import { seedIfEmpty } from '../utils/seedDatabase.js';

let cached = global.mongooseCache || { conn: null, promise: null, seeded: false };
global.mongooseCache = cached;

const explain = (message = '') => {
  const m = message.toLowerCase();
  if (m.includes('whitelist') || m.includes('could not connect to any servers') || m.includes('server selection')) {
    return 'Atlas ne is IP ko block kiya hai. Atlas -> Network Access -> Add IP Address -> "Allow Access From Anywhere" (0.0.0.0/0), 1-2 min wait karo.';
  }
  if (m.includes('auth')) {
    return 'Username/password galat hai. Atlas -> Database Access me user check karo (special chars password me URL-encode karo, e.g. @ -> %40).';
  }
  if (m.includes('enotfound') || m.includes('querysrv') || m.includes('econnrefused')) {
    return 'DNS/Network issue. Internet check karo ya different network/hotspot try karo; non-SRV (mongodb://) URI use karo.';
  }
  return '';
};

export const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/homedecor';
    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        family: 4
      })
      .then(async (m) => {
        console.log(`[MongoDB] Connected: ${m.connection.host}/${m.connection.name}`);
        cached.conn = m;
        if (!cached.seeded) {
          cached.seeded = true;
          try {
            await seedIfEmpty();
          } catch (err) {
            console.warn(`[Seeder Warning] ${err.message}`);
          }
        }
        return m;
      })
      .catch((error) => {
        cached.promise = null;
        cached.conn = null;
        console.error(`[MongoDB ERROR] ${error.message}`);
        const hint = explain(error.message);
        if (hint) console.error(`[MongoDB HINT] ${hint}`);
        console.warn('[MongoDB] Running in demo mode (sample products only, login/orders disabled).');
        return null;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

mongoose.connection.on('disconnected', () => {
  cached.conn = null;
  cached.promise = null;
});

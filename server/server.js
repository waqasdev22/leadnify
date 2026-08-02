import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// 1️⃣ SCHEMAS & MODELS
const UserSchema = new mongoose.Schema({ 
  name: String, 
  email: String 
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

const DataSchema = new mongoose.Schema({
  title: String,
  value: Number,
  createdAt: { type: Date, default: Date.now }
});

const DashboardData = mongoose.model('DashboardData', DataSchema);

// Dynamic Collections setup (packages, listings, dealrooms)
const COLLECTIONS = ['packages', 'listings', 'dealrooms'];
const collectionModels = {};
for (const name of COLLECTIONS) {
  collectionModels[name] = mongoose.model(
    name,
    new mongoose.Schema({}, { strict: false, versionKey: false, minimize: false }),
    name
  );
}

// 2️⃣ DATABASE CONNECTION & INITIAL TEST DATA
const dbURI = process.env.MONGO_URI || process.env.MONGODB_URI;

mongoose.connect(dbURI, {
  serverSelectionTimeoutMS: 15000,
  directConnection: false,
  tls: true,
  tlsAllowInvalidCertificates: true
})
  .then(async () => {
    console.log("✅ MongoDB Connected Successfully!");
    try {
      await User.create({ name: "Test User", email: "test@gmail.com" });
      console.log("✅ Test User created successfully in CRE-Dashbaord!");
    } catch (err) {
      console.log("User create notice:", err.message);
    }
  })
  .catch((err) => {
    console.error("❌ Connection Error:", err.message);
  });

// 3️⃣ MIDDLEWARE: Check DB Status
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database connecting or not available — please check Atlas connection.' });
  }
  next();
});

// 4️⃣ API ROUTES (SPECIFIC ROUTES PEHLE RAKHEIN)

// Save Custom Data
app.post('/api/add-data', async (req, res) => {
  try {
    const newData = new DashboardData(req.body);
    await newData.save();
    res.status(201).json({ message: '✅ Data Database Mein Save Ho Gaya!', data: newData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read Custom Data
app.get('/api/get-data', async (req, res) => {
  try {
    const allData = await DashboardData.find();
    res.json(allData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SAVE a user on login -> POST /api/users { name, email }
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;

    // Safety check: Agar email empty hai to error respond karein, DB crash mat hone dein
    if (!email) {
      return res.status(400).json({ error: 'Email is required to save user' });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { name: name || 'Anonymous', email },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ message: '✅ Login user saved!', user });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: error.message });
  }
});

// ⚠️ DYNAMIC ROUTES SABSE AAKHIR MEIN RAKHEIN

// GET Dashboard Collections -> GET /api/packages, /api/listings, etc.
app.get('/api/:col', async (req, res) => {
  const { col } = req.params;
  
  // Exclude 'users' from being treated as dynamic collection if hit by accident
  if (col === 'users') {
    const users = await User.find();
    return res.json(users);
  }

  const Model = collectionModels[col];
  if (!Model) return res.status(404).json({ error: `Unknown collection: ${col}` });
  
  try {
    const docs = await Model.find().lean();
    res.json(docs.map(({ _id, ...rest }) => rest));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT Dashboard Collections -> PUT /api/packages
app.put('/api/:col', async (req, res) => {
  const { col } = req.params;
  const Model = collectionModels[col];
  if (!Model) return res.status(404).json({ error: `Unknown collection: ${col}` });
  
  try {
    const items = Array.isArray(req.body) ? req.body : [];
    await Model.deleteMany({});
    if (items.length) await Model.insertMany(items, { ordered: false });
    res.json({ ok: true, count: items.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5️⃣ START SERVER
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
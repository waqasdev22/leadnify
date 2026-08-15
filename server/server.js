import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import express from 'express';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { initializeApp as initAdmin, cert } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getStorage as getAdminStorage } from 'firebase-admin/storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Firebase Admin — verify the ID token the frontend sends on each API call.
// If the service-account key is missing, auth is disabled (dev fallback) with a warning.
let authEnabled = false;
try {
  const serviceAccount = JSON.parse(readFileSync(path.join(__dirname, 'serviceAccount.json'), 'utf8'));
  initAdmin({ credential: cert(serviceAccount), storageBucket: 'cre-dashboard-ba596.firebasestorage.app' });
  authEnabled = true;
  console.log('🔐 Firebase Admin ready — API is protected.');
} catch (e) {
  console.warn('⚠️  API auth DISABLED —', e.message);
}
const requireAuth = async (req, res, next) => {
  if (!authEnabled) return next(); // no key configured — allow (dev only)
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Sign in required' });
  try {
    req.user = await getAdminAuth().verifyIdToken(token);
    // Look up the user's role (stored on login). Team-wide roles see everything; a Member
    // sees only their own records. Unknown user → treated as Member (least privilege).
    try {
      const dbUser = await User.findOne({ email: req.user.email });
      req.user.role = dbUser?.role || 'Member';
    } catch { req.user.role = 'Member'; }
    req.user.owner = req.user.name || req.user.email; // matches the "owner" field on records
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired session — please sign in again' });
  }
};
const isTeamWide = (role) => ['Owner', 'Admin', 'Manager'].includes(role);
const OWNER_SCOPED = ['leads', 'contacts']; // filtered per-user for Members; listings/deals stay team-wide

// 1️⃣ SCHEMAS & MODELS
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

const DataSchema = new mongoose.Schema({
  title: String,
  value: Number,
  createdAt: { type: Date, default: Date.now }
});

const DashboardData = mongoose.model('DashboardData', DataSchema);

// NDA executions — recorded when a deal-room visitor signs the confidentiality agreement.
// A visitor can only fetch a confidential file after an NDA record exists for (roomId, email).
const NdaSchema = new mongoose.Schema({
  roomId: String, name: String, email: String,
}, { timestamps: true });
const Nda = mongoose.model('Nda', NdaSchema);

// Dynamic Collections setup (packages, listings, dealrooms, leads, contacts)
const COLLECTIONS = ['packages', 'listings', 'dealrooms', 'leads', 'contacts'];
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
// PUBLIC — website visitors (not logged in) submit a lead/inquiry form here. Defined BEFORE
// requireAuth so it stays open; it creates a new lead automatically (Milestone II 3.7).
app.post('/api/lead-capture', async (req, res) => {
  try {
    const { name, email, company, property, source, phone } = req.body || {};
    if (!name && !email) return res.status(400).json({ error: 'Please add your name or email.' });
    const Leads = collectionModels['leads'];
    const lead = {
      id: 'web-' + Date.now(),
      name: name || (email ? email.split('@')[0] : 'Website visitor'),
      email: email || '—',
      phone: phone || '',
      company: company || '—',
      property: property || '',
      listing: property || 'Website',
      source: source || 'Website',
      type: 'Inquiry', profile: 'Principal', pipeline: 'Active', active: 'Active',
      status: 'Unread', unread: true,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      owner: '', // unassigned — the team can claim it
    };
    await Leads.create(lead);
    res.status(201).json({ ok: true, message: "Thanks — we'll be in touch shortly." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUBLIC — a deal-room visitor signs the NDA/confidentiality agreement for a room.
app.post('/api/nda-sign', async (req, res) => {
  try {
    const { roomId, name, email } = req.body || {};
    if (!roomId || !email) return res.status(400).json({ error: 'Room and email are required.' });
    await Nda.findOneAndUpdate({ roomId, email }, { roomId, name: name || '', email }, { upsert: true, setDefaultsOnInsert: true });
    res.status(201).json({ ok: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// PUBLIC — hand out a short-lived (15-min) signed URL for a confidential file, but ONLY when the
// requesting visitor has an NDA record for that room. Files themselves stay private (no public URL).
app.post('/api/file-access', async (req, res) => {
  try {
    const { roomId, path: filePath, email } = req.body || {};
    if (!roomId || !filePath || !email) return res.status(400).json({ error: 'Room, file and email are required.' });
    const signed = await Nda.findOne({ roomId, email });
    if (!signed) return res.status(403).json({ error: 'Sign the confidentiality agreement first.' });
    if (!authEnabled) return res.status(503).json({ error: 'File service not configured on the server.' });
    const [url] = await getAdminStorage().bucket().file(filePath).getSignedUrl({ action: 'read', expires: Date.now() + 15 * 60 * 1000 });
    res.json({ ok: true, url, expiresInMinutes: 15 });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Every /api route below now requires a valid signed-in user.
app.use('/api', requireAuth);

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
    const { name, email, role } = req.body;

    // Safety check: Agar email empty hai to error respond karein, DB crash mat hone dein
    if (!email) {
      return res.status(400).json({ error: 'Email is required to save user' });
    }

    const update = { name: name || 'Anonymous', email };
    if (role) update.role = role; // store the role so the API can enforce permissions
    const user = await User.findOneAndUpdate(
      { email },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ message: '✅ Login user saved!', user });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send a REAL email through SMTP (Gmail App Password in .env). Requires a signed-in user.
app.post('/api/send-email', async (req, res) => {
  const { to, subject, body, fromName } = req.body || {};
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.status(400).json({ error: 'Email not configured — add SMTP_USER and SMTP_PASS (Gmail App Password) to server/.env' });
  }
  if (!to || !subject) return res.status(400).json({ error: 'Recipient (to) and subject are required' });
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const recipients = Array.isArray(to) ? to.join(',') : to;
    const info = await transporter.sendMail({
      from: `"${fromName || 'MyCREBlueprint'}" <${process.env.SMTP_USER}>`,
      to: recipients,
      subject,
      html: body || '',
    });
    res.json({ ok: true, id: info.messageId, sentBy: req.user?.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// A tiny public page to CHECK the NDA file gate by clicking (open http://localhost:4000/nda-test).
app.get('/nda-test', (req, res) => {
  res.type('html').send(`<!doctype html><meta charset=utf8><title>NDA File Security Test</title>
<style>body{font-family:Inter,Arial,sans-serif;max-width:640px;margin:40px auto;color:#0f172a}
button{background:#F97316;color:#fff;border:0;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer;margin:6px 6px 6px 0}
pre{background:#0f172a;color:#a7f3d0;padding:12px;border-radius:8px;white-space:pre-wrap;word-break:break-all}
input{padding:8px;border:1px solid #cbd5e1;border-radius:8px;margin:4px} .ok{color:#16a34a}.bad{color:#dc2626}</style>
<h2>🔒 NDA File Security — Test</h2>
<p>Room: <input id=room value=testroom> Email: <input id=email value=you@example.com> File: <input id=file value=uploads/secret.pdf></p>
<button onclick=tryFile()>1. Try file WITHOUT NDA (should be blocked)</button>
<button onclick=sign()>2. Sign NDA</button>
<button onclick=tryFile()>3. Try file WITH NDA (should give a link)</button>
<pre id=out>Result yahan aayega…</pre>
<script>
var out=document.getElementById('out');
function body(){return {roomId:room.value,email:email.value,path:file.value,name:'Test'}}
async function call(p){var r=await fetch('/api/'+p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body())});var j=await r.json();return {code:r.status,j:j}}
async function tryFile(){out.textContent='…';var x=await call('file-access');out.innerHTML=(x.code===403?'<span class=bad>🔒 BLOCKED ('+x.code+'): ':'<span class=ok>✅ ALLOWED ('+x.code+'): ')+JSON.stringify(x.j,null,2)+'</span>'}
async function sign(){out.textContent='…';var x=await call('nda-sign');out.innerHTML='<span class=ok>✅ NDA signed ('+x.code+'): '+JSON.stringify(x.j)+'</span>'}
</script>`);
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
    // A Member only sees their OWN leads/contacts; Managers/Admins/Owners see everything.
    const scoped = OWNER_SCOPED.includes(col) && !isTeamWide(req.user.role);
    const filter = scoped ? { owner: req.user.owner } : {};
    const docs = await Model.find(filter).lean();
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
    // A Member's save replaces ONLY their own records (others' data is preserved).
    const scoped = OWNER_SCOPED.includes(col) && !isTeamWide(req.user.role);
    if (scoped) {
      await Model.deleteMany({ owner: req.user.owner });
      const own = items.filter((i) => (i.owner || req.user.owner) === req.user.owner);
      if (own.length) await Model.insertMany(own.map((i) => ({ ...i, owner: req.user.owner })), { ordered: false });
      return res.json({ ok: true, count: own.length, scoped: true });
    }
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
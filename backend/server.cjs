/**
 * ================================================================
 *  خانه بازار — Node.js API Server (کامل)
 * ================================================================
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const mysql = require("mysql2/promise");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3001;
// نقشه و مسیریابی از OpenStreetMap / Nominatim استفاده می‌کند — کاملاً رایگان و بدون نیاز به کلید API.
// طبق Usage Policy نمینتیم، هدر User-Agent معتبر الزامی است.
const NOMINATIM_USER_AGENT = process.env.NOMINATIM_USER_AGENT || "KhaneBazaar/1.0 (https://khane-bazar-118.ir)";
const SITE_URL = (process.env.SITE_URL || "https://khane-bazar-118.ir").replace(/\/$/, "");
// اگر می‌خواهید فرانت‌اند (پوشه dist) از همین سرور Node سرو شود و صفحات آگهی
// به‌صورت prerender با متادیتا به گوگل داده شوند، FRONTEND_DIR را تنظیم کنید.
const FRONTEND_DIR = process.env.FRONTEND_DIR || path.join(__dirname, "..", "dist");

const DB_CONFIG = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_DATABASE || "pxavqkqz_118",
  user: process.env.DB_USERNAME || "pxavqkqz_mahdiyar",
  password: process.env.DB_PASSWORD || "",
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
};

const app = express();
app.use(compression());

const corsOptions = {
  origin: ["https://khane-bazar-118.ir","https://www.khane-bazar-118.ir","http://localhost:5173","http://localhost:3000"],
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","Accept"],
  credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "35mb" }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => console.log(`${new Date().toISOString()} | ${req.method} ${req.path} | ${res.statusCode} | ${Date.now()-start}ms`));
  next();
});

let pool = null;
async function getPool() {
  if (!pool) {
    try {
      pool = mysql.createPool(DB_CONFIG);
      await pool.query("SELECT 1");
      console.log("✅ MySQL connected");
    } catch (err) {
      console.error("❌ MySQL:", err.message);
      pool = null;
    }
  }
  return pool;
}
getPool();

// ---- Listing helpers ----
// SELECT مشترک که نام دسته/استان/شهر و اطلاعات کاربر را هم برمی‌گرداند
const LISTING_BASE_SELECT = `
  SELECT l.*,
         u.name  AS user_name,
         u.phone AS user_phone,
         cat.slug   AS cat_join_slug,
         cat.name   AS category_name,
         parent.slug AS parent_join_slug,
         pr.name AS province_name,
         ci.name AS city_name
  FROM listings l
  LEFT JOIN users u        ON u.id = l.user_id
  LEFT JOIN categories cat ON cat.id = l.category_id
  LEFT JOIN categories parent ON parent.id = cat.parent_id
  LEFT JOIN provinces pr   ON pr.id = l.province_id
  LEFT JOIN cities ci      ON ci.id = l.city_id
`;

// تبدیل ردیف دیتابیس (snake_case) به شکل مورد انتظار فرانت‌اند (camelCase)
function normalizeListing(row) {
  let fields = {};
  try { fields = row.fields_json ? (typeof row.fields_json === "string" ? JSON.parse(row.fields_json) : row.fields_json) : {}; } catch { fields = {}; }
  return {
    id: String(row.id),
    userId: String(row.user_id),
    userName: row.user_name || "",
    userPhone: row.user_phone || "",
    categorySlug: row.category_slug || row.parent_join_slug || row.cat_join_slug || "",
    subSlug: row.sub_slug || (row.parent_join_slug ? row.cat_join_slug : "") || "",
    categoryName: row.category_name || "",
    title: row.title || "",
    slug: row.slug || "",
    shortDescription: row.short_description || "",
    description: row.description || "",
    price: Number(row.price) || 0,
    priceType: row.price_type || "fixed",
    fields,
    images: (row.images || []).map((im) => ({
      id: String(im.id),
      dataUrl: im.image_path || "",
      isPrimary: !!im.is_primary,
    })),
    province: row.province || row.province_name || "",
    city: row.city || row.city_name || "",
    neighborhood: row.neighborhood || "",
    address: row.address || "",
    lat: row.latitude != null ? Number(row.latitude) : undefined,
    lng: row.longitude != null ? Number(row.longitude) : undefined,
    status: row.status,
    views: Number(row.views) || 0,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    expiresAt: row.expires_at ? new Date(row.expires_at).getTime() : 0,
  };
}

// عکس‌های هر مجموعه آگهی را یکجا می‌گیرد تا از N+1 query جلوگیری شود
async function attachImages(p, rows, primaryOnly = false) {
  if (!rows.length) return rows;
  const ids = rows.map((r) => r.id);
  const placeholders = ids.map(() => "?").join(",");
  const [imgs] = await p.query(
    `SELECT id, listing_id, image_path, is_primary, sort_order FROM listing_images WHERE listing_id IN (${placeholders}) ORDER BY is_primary DESC, sort_order ASC`,
    ids
  );
  const byListing = {};
  for (const im of imgs) {
    const arr = (byListing[im.listing_id] = byListing[im.listing_id] || []);
    if (primaryOnly && arr.length >= 1) continue; // فقط تصویر اصلی برای نمای لیست
    arr.push(im);
  }
  for (const r of rows) r.images = byListing[r.id] || [];
  return rows;
}

// اجرای کوئری آگهی با JOIN؛ اگر جداول کمکی (استان/شهر/دسته) موجود نبودند،
// به یک کوئری ساده برمی‌گردد تا آگهی همچنان نمایش داده شود.
async function runListingQuery(p, where = "", params = [], tail = "") {
  const full = `${LISTING_BASE_SELECT} ${where} ${tail}`;
  try {
    const [rows] = await p.query(full, params);
    return rows;
  } catch (e) {
    console.error("listing JOIN query failed, using simple fallback:", e && e.message);
    const simple = `SELECT l.*, u.name AS user_name, u.phone AS user_phone
      FROM listings l LEFT JOIN users u ON u.id = l.user_id ${where} ${tail}`;
    const [rows] = await p.query(simple, params);
    return rows;
  }
}

function validatePhone(p) { return /^09\d{9}$/.test(p); }
function hashPassword(p) { return crypto.createHash("sha256").update(p).digest("hex"); }
function generateToken() { return crypto.randomBytes(32).toString("hex"); }

// شکل یکسان کاربر برای همه‌ی پاسخ‌های API (register/login/auth/profile)
function serializeUser(u) {
  return {
    id: u.id,
    phone: u.phone,
    name: u.name,
    email: u.email || "",
    nationalCode: u.national_code || "",
    avatar: u.avatar || "",
    isAdmin: !!u.is_admin,
    isVerified: !!u.is_verified,
    createdAt: u.created_at ? new Date(u.created_at).getTime() : Date.now(),
  };
}

async function saveToken(userId, token) {
  const p = await getPool();
  await p.execute(
    "INSERT INTO personal_access_tokens (tokenable_type, tokenable_id, name, token, created_at) VALUES ('User', ?, 'api', ?, NOW())",
    [userId, token]
  );
}

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ error: "احراز هویت الزامی است" });
  const token = header.split(" ")[1];
  try {
    const p = await getPool();
    const [rows] = await p.execute(
      "SELECT u.* FROM users u JOIN personal_access_tokens t ON t.tokenable_id = u.id WHERE t.token = ?",
      [token]
    );
    if (!rows.length) return res.status(401).json({ error: "توکن نامعتبر" });
    req.user = rows[0];
    next();
  } catch { res.status(401).json({ error: "خطا در احراز هویت" }); }
}

// ---- AUTH ----
app.post("/api/auth/register", async (req, res) => {
  const { phone, password, name, nationalCode } = req.body;
  if (!phone || !validatePhone(phone)) return res.status(400).json({ error: "شماره موبایل نامعتبر است" });
  if (!password || password.length < 4) return res.status(400).json({ error: "رمز عبور باید حداقل ۴ کاراکتر باشد" });
  if (!name || name.trim().length < 2) return res.status(400).json({ error: "نام باید حداقل ۲ حرف باشد" });
  const national = String(nationalCode || "").replace(/\D/g, "");
  if (!/^\d{10}$/.test(national)) return res.status(400).json({ error: "کد ملی باید ۱۰ رقم باشد" });
  try {
    const p = await getPool();
    if (!p) return res.status(500).json({ error: "اتصال به دیتابیس برقرار نیست" });
    const [exists] = await p.execute("SELECT id FROM users WHERE phone = ?", [phone]);
    if (exists.length) return res.status(409).json({ error: "این شماره قبلاً ثبت شده است" });
    const [result] = await p.execute(
      "INSERT INTO users (phone, name, national_code, password_hash, is_verified, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, 1, NOW(), NOW())",
      [phone, name.trim(), national, hashPassword(password)]
    );
    const token = generateToken();
    await saveToken(result.insertId, token);
    const [rows] = await p.execute("SELECT * FROM users WHERE id = ?", [result.insertId]);
    res.json({ success: true, token, user: serializeUser(rows[0]) });
  } catch (err) { console.error(err); res.status(500).json({ error: "خطای سرور" }); }
});

app.post("/api/auth/login", async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !validatePhone(phone)) return res.status(400).json({ error: "شماره موبایل نامعتبر است" });
  if (!password) return res.status(400).json({ error: "رمز عبور الزامی است" });
  try {
    const p = await getPool();
    if (!p) return res.status(500).json({ error: "اتصال به دیتابیس برقرار نیست" });
    const [rows] = await p.execute(
      "SELECT * FROM users WHERE phone = ? AND password_hash = ? AND is_active = 1",
      [phone, hashPassword(password)]
    );
    if (!rows.length) return res.status(401).json({ error: "شماره یا رمز عبور اشتباه است" });
    const user = rows[0];
    const token = generateToken();
    await saveToken(user.id, token);
    res.json({ success: true, token, user: serializeUser(user) });
  } catch (err) { console.error(err); res.status(500).json({ error: "خطای سرور" }); }
});

app.get("/api/auth/user", authMiddleware, (req, res) => {
  res.json(serializeUser(req.user));
});

app.post("/api/auth/logout", authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const p = await getPool();
    await p.execute("DELETE FROM personal_access_tokens WHERE token = ?", [token]);
  } catch {}
  res.json({ success: true });
});

// ---- Admin: users list ----
app.get("/api/admin/users", authMiddleware, async (req, res) => {
  if (!req.user.is_admin) return res.status(403).json({ error: "دسترسی مجاز نیست" });
  try {
    const p = await getPool();
    const [rows] = await p.query(
      "SELECT id, name, phone, email, is_admin, is_verified, is_active, created_at FROM users ORDER BY created_at DESC"
    );
    const data = rows.map((u) => ({
      id: String(u.id),
      name: u.name,
      phone: u.phone,
      email: u.email || "",
      isAdmin: !!u.is_admin,
      isVerified: !!u.is_verified,
      isActive: !!u.is_active,
      createdAt: u.created_at ? new Date(u.created_at).getTime() : Date.now(),
    }));
    res.json({ data });
  } catch (err) { console.error(err); res.status(500).json({ error: "خطای سرور" }); }
});

// ---- LISTINGS ----
app.get("/api/listings", async (req, res) => {
  try {
    const p = await getPool();
    if (!p) return res.status(500).json({ error: "اتصال به دیتابیس برقرار نیست" });
    const { status = "active", limit = 20, offset = 0 } = req.query;
    const lim = Math.min(Math.max(parseInt(limit) || 20, 1), 500);
    const off = Math.max(parseInt(offset) || 0, 0);
    // status=all یعنی همه وضعیت‌ها (برای پنل ادمین)
    const where = (status && status !== "all") ? "WHERE l.status = ?" : "";
    const params = (status && status !== "all") ? [status] : [];
    const tail = `ORDER BY l.created_at DESC LIMIT ${lim} OFFSET ${off}`;
    // نکته: LIMIT/OFFSET داخل رشته گذاشته می‌شود چون mysql2 در حالت prepared
    // برای آن‌ها خطای mysqld_stmt_execute می‌دهد.
    const rows = await runListingQuery(p, where, params, tail);
    await attachImages(p, rows, true);
    const data = rows.map(normalizeListing);
    res.json({ data, total: data.length });
  } catch (err) { console.error(err); res.status(500).json({ error: "خطای سرور" }); }
});

app.get("/api/listings/my", authMiddleware, async (req, res) => {
  try {
    const p = await getPool();
    const rows = await runListingQuery(p, "WHERE l.user_id = ?", [req.user.id], "ORDER BY l.created_at DESC");
    await attachImages(p, rows, true);
    res.json({ data: rows.map(normalizeListing) });
  } catch (err) { console.error(err); res.status(500).json({ error: "خطای سرور" }); }
});

app.get("/api/listings/:id", async (req, res) => {
  try {
    const p = await getPool();
    const rows = await runListingQuery(p, "WHERE l.id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "آگهی یافت نشد" });
    await attachImages(p, rows);
    await p.execute("UPDATE listings SET views = views + 1 WHERE id = ?", [rows[0].id]);
    res.json(normalizeListing(rows[0]));
  } catch (err) { res.status(500).json({ error: "خطای سرور" }); }
});

app.post("/api/listings", authMiddleware, async (req, res) => {
  try {
    const p = await getPool();
    const { title, shortDescription, description, price, priceType="fixed", categorySlug, subSlug, province, city, neighborhood, address, lat, lng, fields={}, images=[], status="pending" } = req.body;
    if (!title || !shortDescription || price === undefined) return res.status(400).json({ error: "عنوان، توضیح و قیمت الزامی است" });

    let categoryId = null;
    try {
      if (categorySlug) {
        const [cats] = await p.execute("SELECT id FROM categories WHERE slug = ?", [categorySlug]);
        if (cats.length) categoryId = cats[0].id;
      }
    } catch { /* جدول categories موجود نیست */ }
    let provinceId = null, cityId = null;
    try { if (province) { const [r] = await p.execute("SELECT id FROM provinces WHERE name = ? OR slug = ?", [province, province]); if (r.length) provinceId = r[0].id; } } catch { /* provinces موجود نیست */ }
    try { if (city) { const [r] = await p.execute("SELECT id FROM cities WHERE name = ? OR slug = ?", [city, city]); if (r.length) cityId = r[0].id; } } catch { /* cities موجود نیست */ }

    const slug = title.replace(/\s+/g, "-") + "-" + Date.now();
    // آگهی‌ها هیچ محدودیت زمانی ندارند و منقضی نمی‌شوند
    const expiresAt = null;

    // ثبت مقاوم: اگر ستون‌های جدید (category_slug/province/city/...) در دیتابیس
    // نبودند (migration اجرا نشده)، با ستون‌های پایه ثبت می‌شود تا آگهی از دست نرود.
    let result;
    try {
      [result] = await p.execute(
        "INSERT INTO listings (user_id, category_id, category_slug, sub_slug, title, slug, short_description, description, price, price_type, status, province_id, city_id, province, city, neighborhood, address, latitude, longitude, fields_json, created_at, updated_at, expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW(),?)",
        [req.user.id, categoryId, categorySlug||"", subSlug||"", title, slug, shortDescription, description||"", price, priceType, status, provinceId, cityId, province||"", city||"", neighborhood||"", address||"", lat||null, lng||null, JSON.stringify(fields), expiresAt]
      );
    } catch (e) {
      if (e && (e.code === "ER_BAD_FIELD_ERROR" || /Unknown column/i.test(e.message || ""))) {
        console.warn("listings insert: ستون‌های جدید موجود نیست — ثبت با ستون‌های پایه. لطفاً migration را اجرا کنید.");
        [result] = await p.execute(
          "INSERT INTO listings (user_id, category_id, title, slug, short_description, description, price, price_type, status, province_id, city_id, address, latitude, longitude, fields_json, created_at, updated_at, expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW(),?)",
          [req.user.id, categoryId, title, slug, shortDescription, description||"", price, priceType, status, provinceId, cityId, address||"", lat||null, lng||null, JSON.stringify(fields), expiresAt]
        );
      } else throw e;
    }
    const listingId = result.insertId;
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      await p.execute("INSERT INTO listing_images (listing_id, image_path, is_primary, sort_order, created_at) VALUES (?,?,?,?,NOW())", [listingId, img.dataUrl||img.image_path||"", i===0?1:0, i]);
    }
    res.json({ success: true, id: listingId, message: "آگهی با موفقیت ثبت شد" });
  } catch (err) { console.error("create listing:", err); res.status(500).json({ error: "خطا در ثبت آگهی: " + (err && (err.sqlMessage || err.message) || "نامشخص") }); }
});

app.put("/api/listings/:id", authMiddleware, async (req, res) => {
  try {
    const p = await getPool();
    // ادمین می‌تواند هر آگهی را ویرایش/تأیید کند؛ کاربر عادی فقط آگهی خودش را
    const owns = req.user.is_admin
      ? await p.execute("SELECT id FROM listings WHERE id = ?", [req.params.id])
      : await p.execute("SELECT id FROM listings WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    const [rows] = owns;
    if (!rows.length) return res.status(404).json({ error: "آگهی یافت نشد" });
    const { title, shortDescription, description, price, priceType, status, fields } = req.body;
    await p.execute("UPDATE listings SET title=?,short_description=?,description=?,price=?,price_type=?,status=?,fields_json=?,updated_at=NOW() WHERE id=?",
      [title, shortDescription, description, price, priceType, status, JSON.stringify(fields||{}), req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "خطای سرور" }); }
});

app.delete("/api/listings/:id", authMiddleware, async (req, res) => {
  try {
    const p = await getPool();
    const where = req.user.is_admin ? "id=?" : "id=? AND user_id=?";
    const params = req.user.is_admin ? [req.params.id] : [req.params.id, req.user.id];
    await p.execute(`DELETE FROM listings WHERE ${where}`, params);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "خطای سرور" }); }
});

// ---- SEARCH ----
app.get("/api/search", async (req, res) => {
  try {
    const p = await getPool();
    const { q="", minPrice, maxPrice, limit=20, offset=0 } = req.query;
    const lim = Math.min(Math.max(parseInt(limit) || 20, 1), 500);
    const off = Math.max(parseInt(offset) || 0, 0);
    let where = "WHERE l.status='active'";
    const params = [];
    if (q) { where += " AND (l.title LIKE ? OR l.short_description LIKE ?)"; params.push(`%${q}%`,`%${q}%`); }
    if (minPrice) { where += " AND l.price >= ?"; params.push(parseInt(minPrice)); }
    if (maxPrice) { where += " AND l.price <= ?"; params.push(parseInt(maxPrice)); }
    const tail = `ORDER BY l.created_at DESC LIMIT ${lim} OFFSET ${off}`;
    const rows = await runListingQuery(p, where, params, tail);
    await attachImages(p, rows, true);
    const data = rows.map(normalizeListing);
    res.json({ data, total: data.length });
  } catch (err) { res.status(500).json({ error: "خطای سرور" }); }
});


app.get("/api/favorites", authMiddleware, async (req, res) => {
  try {
    const p = await getPool();
    const rows = await runListingQuery(p, "JOIN favorites f ON f.listing_id = l.id WHERE f.user_id = ?", [req.user.id], "ORDER BY f.created_at DESC");
    await attachImages(p, rows, true);
    res.json({ data: rows.map(normalizeListing) });
  } catch (err) { res.status(500).json({ error: "خطای سرور" }); }
});

app.post("/api/favorites", authMiddleware, async (req, res) => {
  try {
    const p = await getPool();
    const { listingId } = req.body;
    const [existing] = await p.execute("SELECT id FROM favorites WHERE user_id=? AND listing_id=?", [req.user.id, listingId]);
    if (existing.length) {
      await p.execute("DELETE FROM favorites WHERE user_id=? AND listing_id=?", [req.user.id, listingId]);
      return res.json({ success: true, action: "removed" });
    }
    await p.execute("INSERT INTO favorites (user_id, listing_id, created_at) VALUES (?,?,NOW())", [req.user.id, listingId]);
    res.json({ success: true, action: "added" });
  } catch (err) { res.status(500).json({ error: "خطای سرور" }); }
});

// ---- CONVERSATIONS ----
app.get("/api/conversations", authMiddleware, async (req, res) => {
  try {
    const p = await getPool();
    const [rows] = await p.execute(
      `SELECT c.*, l.title as listing_title, ub.name as buyer_name, us.name as seller_name
       FROM conversations c
       LEFT JOIN listings l ON l.id = c.listing_id
       LEFT JOIN users ub ON ub.id = c.buyer_id
       LEFT JOIN users us ON us.id = c.seller_id
       WHERE c.buyer_id=? OR c.seller_id=?
       ORDER BY c.last_message_at DESC`,
      [req.user.id, req.user.id]
    );
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: "خطای سرور" }); }
});

app.post("/api/conversations", authMiddleware, async (req, res) => {
  try {
    const p = await getPool();
    const { listingId, sellerId } = req.body;
    const buyerId = req.user.id;
    const [existing] = await p.execute("SELECT * FROM conversations WHERE listing_id=? AND buyer_id=? AND seller_id=?", [listingId, buyerId, sellerId]);
    if (existing.length) return res.json(existing[0]);
    const [result] = await p.execute("INSERT INTO conversations (listing_id, buyer_id, seller_id, created_at) VALUES (?,?,?,NOW())", [listingId, buyerId, sellerId]);
    res.json({ id: result.insertId, listingId, buyerId, sellerId });
  } catch (err) { res.status(500).json({ error: "خطای سرور" }); }
});

app.get("/api/conversations/:id/messages", authMiddleware, async (req, res) => {
  try {
    const p = await getPool();
    const [rows] = await p.execute("SELECT * FROM messages WHERE conversation_id=? ORDER BY created_at ASC", [req.params.id]);
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: "خطای سرور" }); }
});

app.post("/api/conversations/:id/messages", authMiddleware, async (req, res) => {
  try {
    const p = await getPool();
    const { message } = req.body;
    const [result] = await p.execute("INSERT INTO messages (conversation_id, sender_id, message, created_at) VALUES (?,?,?,NOW())", [req.params.id, req.user.id, message]);
    await p.execute("UPDATE conversations SET last_message_at=NOW() WHERE id=?", [req.params.id]);
    res.json({ id: result.insertId, message, senderId: req.user.id });
  } catch (err) { res.status(500).json({ error: "خطای سرور" }); }
});

// ---- NOTIFICATIONS ----
app.get("/api/notifications", authMiddleware, async (req, res) => {
  try {
    const p = await getPool();
    const [rows] = await p.execute("SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50", [req.user.id]);
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: "خطای سرور" }); }
});

// ---- USER ----
app.get("/api/user/profile", authMiddleware, (req, res) => {
  res.json(serializeUser(req.user));
});

app.put("/api/user/profile", authMiddleware, async (req, res) => {
  try {
    const p = await getPool();
    const { name, email, nationalCode } = req.body;
    if (!name || name.trim().length < 2) return res.status(400).json({ error: "نام باید حداقل ۲ حرف باشد" });
    const cleanEmail = String(email || "").trim();
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return res.status(400).json({ error: "ایمیل نامعتبر است" });
    if (cleanEmail) {
      const [dup] = await p.execute("SELECT id FROM users WHERE email = ? AND id != ?", [cleanEmail, req.user.id]);
      if (dup.length) return res.status(409).json({ error: "این ایمیل قبلاً استفاده شده است" });
    }
    const national = String(nationalCode || "").replace(/\D/g, "");
    if (national && !/^\d{10}$/.test(national)) return res.status(400).json({ error: "کد ملی باید ۱۰ رقم باشد" });
    await p.execute(
      "UPDATE users SET name=?, email=?, national_code=?, updated_at=NOW() WHERE id=?",
      [name.trim(), cleanEmail || null, national || req.user.national_code || null, req.user.id]
    );
    const [rows] = await p.execute("SELECT * FROM users WHERE id = ?", [req.user.id]);
    res.json({ success: true, user: serializeUser(rows[0]) });
  } catch (err) { console.error(err); res.status(500).json({ error: "خطای سرور" }); }
});

app.put("/api/user/password", authMiddleware, async (req, res) => {
  try {
    const p = await getPool();
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "رمز عبور فعلی و جدید الزامی است" });
    if (newPassword.length < 4) return res.status(400).json({ error: "رمز عبور جدید باید حداقل ۴ کاراکتر باشد" });
    if (hashPassword(currentPassword) !== req.user.password_hash) return res.status(401).json({ error: "رمز عبور فعلی اشتباه است" });
    await p.execute("UPDATE users SET password_hash=?, updated_at=NOW() WHERE id=?", [hashPassword(newPassword), req.user.id]);
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: "خطای سرور" }); }
});

// ---- MAP (OpenStreetMap / Nominatim — رایگان، بدون کلید API) ----
app.get("/api/map/geocode", async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: "مختصات الزامی است" });
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fa`,
      { headers: { "User-Agent": NOMINATIM_USER_AGENT } }
    );
    const data = await r.json();
    res.json({ formatted_address: data?.display_name || "", address: data?.address || null, raw: data });
  } catch { res.status(500).json({ error: "خطا در آدرس" }); }
});

app.get("/api/map/search", async (req, res) => {
  const { q, lat, lng } = req.query;
  if (!q) return res.status(400).json({ error: "عبارت جستجو الزامی است" });
  try {
    const params = new URLSearchParams({ format: "json", q, "accept-language": "fa", limit: "8" });
    if (lat && lng) { params.set("lat", lat); params.set("lon", lng); }
    const r = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { "User-Agent": NOMINATIM_USER_AGENT },
    });
    const data = await r.json();
    res.json({ items: (data || []).map((it) => ({ title: it.display_name, lat: parseFloat(it.lat), lng: parseFloat(it.lon) })) });
  } catch { res.status(500).json({ error: "خطا در جستجو" }); }
});

// ---- HEALTH ----
app.get("/api/health", async (req, res) => {
  let dbOk = false;
  try { const p = await getPool(); if (p) { await p.query("SELECT 1"); dbOk = true; } } catch {}
  res.json({ status: "ok", service: "خانه بازار API", version: "2.0.0", time: new Date().toISOString(), services: { map: true, mysql: dbOk } });
});

// نسخه‌ی بک‌اند + قابلیت‌های جدید (برای اطمینان از به‌روز و ری‌استارت‌شدن بک‌اند)
app.get("/api/version", (req, res) => {
  res.json({
    build: "1.7",
    features: ["status=all", "admin-users", "city-column", "national-code", "resilient-listing-query"],
    time: new Date().toISOString(),
  });
});

// نقشه‌ی سایت پویا — شامل صفحات ثابت، دسته‌بندی‌ها و همه‌ی آگهی‌های فعال
app.get("/sitemap.xml", async (req, res) => {
  const SITE = (process.env.SITE_URL || "https://khane-bazar-118.ir").replace(/\/$/, "");
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const urls = [];
  const staticPages = [
    { p: "/", pr: "1.0", cf: "daily" },
    { p: "/search", pr: "0.8", cf: "daily" },
    { p: "/about", pr: "0.4", cf: "monthly" },
    { p: "/contact", pr: "0.4", cf: "monthly" },
    { p: "/terms", pr: "0.3", cf: "yearly" },
    { p: "/faq", pr: "0.4", cf: "monthly" },
    { p: "/blog", pr: "0.6", cf: "weekly" },
  ];
  for (const s of staticPages) urls.push({ loc: SITE + s.p, priority: s.pr, changefreq: s.cf });
  try {
    const p = await getPool();
    if (p) {
      try {
        const [cats] = await p.query("SELECT slug FROM categories WHERE parent_id IS NULL OR parent_id = 0");
        for (const c of cats) if (c.slug) urls.push({ loc: `${SITE}/category/${c.slug}`, priority: "0.7", changefreq: "weekly" });
      } catch {}
      const [rows] = await p.query("SELECT id, updated_at, created_at FROM listings WHERE status = 'active' ORDER BY created_at DESC LIMIT 10000");
      for (const r of rows) {
        const d = r.updated_at || r.created_at;
        urls.push({ loc: `${SITE}/listing/${r.id}`, priority: "0.8", changefreq: "weekly", lastmod: d ? new Date(d).toISOString().slice(0, 10) : undefined });
      }
    }
  } catch (err) { console.error("sitemap error:", err && err.message); }
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) =>
      `  <url><loc>${esc(u.loc)}</loc>` +
      (u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : "") +
      `<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
    ).join("\n") +
    `\n</urlset>\n`;
  res.header("Content-Type", "application/xml; charset=utf-8");
  res.send(body);
});

// ================================================================
//  Prerender / SEO — سرو فرانت‌اند از Node با متادیتای آماده برای گوگل
//  (اختیاری: فقط وقتی dist در دسترس باشد یا SERVE_FRONTEND=1 باشد)
// ================================================================
function escHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function tomanFmt(n) {
  const v = Math.round(Number(n) || 0);
  if (!v) return "توافقی";
  return v.toLocaleString("en-US") + " تومان";
}
let _indexHtmlCache = null;
function getIndexHtml() {
  if (_indexHtmlCache != null) return _indexHtmlCache;
  try {
    _indexHtmlCache = fs.readFileSync(path.join(FRONTEND_DIR, "index.html"), "utf8");
  } catch {
    _indexHtmlCache = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>خانه بازار</title></head><body><div id="root"></div></body></html>`;
  }
  return _indexHtmlCache;
}
function renderListingPage(listing) {
  const title = `${listing.title} | خانه بازار`;
  const loc = [listing.province, listing.city, listing.neighborhood].filter(Boolean).join("، ");
  const descRaw = listing.shortDescription || listing.description || `${listing.categoryName || "آگهی"}${loc ? " در " + loc : ""}`;
  const desc = String(descRaw).replace(/\s+/g, " ").slice(0, 160);
  const canonical = `${SITE_URL}/listing/${listing.id}`;
  const firstImg = (listing.images && listing.images[0] && listing.images[0].dataUrl) || "";
  const ogImage = /^https?:\/\//.test(firstImg) ? firstImg : `${SITE_URL}/images/logo.png`;
  const priceText = listing.priceType === "negotiable" ? "توافقی" : tomanFmt(listing.price);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: desc,
    image: ogImage,
    category: listing.categoryName || undefined,
    offers: {
      "@type": "Offer",
      price: Number(listing.price) || 0,
      priceCurrency: "IRR",
      availability: "https://schema.org/InStock",
      url: canonical,
      areaServed: listing.city || undefined,
    },
  };

  const head = `
    <title>${escHtml(title)}</title>
    <meta name="description" content="${escHtml(desc)}" />
    <link rel="canonical" href="${escHtml(canonical)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta property="og:type" content="product" />
    <meta property="og:title" content="${escHtml(title)}" />
    <meta property="og:description" content="${escHtml(desc)}" />
    <meta property="og:url" content="${escHtml(canonical)}" />
    <meta property="og:image" content="${escHtml(ogImage)}" />
    <meta property="og:site_name" content="خانه بازار" />
    <meta property="product:price:amount" content="${Number(listing.price) || 0}" />
    <meta property="product:price:currency" content="IRR" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escHtml(title)}" />
    <meta name="twitter:description" content="${escHtml(desc)}" />
    <meta name="twitter:image" content="${escHtml(ogImage)}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  `;

  // محتوای اولیه‌ی قابل‌ایندکس داخل #root (ری‌اکت هنگام اجرا جایگزینش می‌کند)
  const body = `
    <article style="max-width:900px;margin:0 auto;padding:16px;font-family:Tahoma,sans-serif" dir="rtl">
      <h1>${escHtml(listing.title)}</h1>
      <p><strong>قیمت:</strong> ${escHtml(priceText)}</p>
      ${loc ? `<p><strong>موقعیت:</strong> ${escHtml(loc)}</p>` : ""}
      ${listing.categoryName ? `<p><strong>دسته:</strong> ${escHtml(listing.categoryName)}</p>` : ""}
      <p>${escHtml(listing.description || listing.shortDescription || "")}</p>
    </article>
  `;

  let html = getIndexHtml();
  html = html.replace(/<title>[\s\S]*?<\/title>/i, "");
  html = html.replace(/<\/head>/i, head + "\n</head>");
  html = html.replace(/(<div id="root">)([\s\S]*?)(<\/div>)/i, `$1${body}$3`);
  return html;
}

const frontendEnabled = process.env.SERVE_FRONTEND === "1" || fs.existsSync(path.join(FRONTEND_DIR, "index.html"));
if (frontendEnabled) {
  // پیش‌رندر صفحه‌ی آگهی
  app.get("/listing/:id", async (req, res, next) => {
    try {
      const p = await getPool();
      if (!p) return next();
      const rows = await runListingQuery(p, "WHERE l.id = ?", [req.params.id]);
      if (!rows.length) { res.status(404); return res.set("Content-Type", "text/html; charset=utf-8").send(getIndexHtml()); }
      await attachImages(p, rows);
      const listing = normalizeListing(rows[0]);
      res.set("Content-Type", "text/html; charset=utf-8").send(renderListingPage(listing));
    } catch (err) { console.error("prerender error:", err && err.message); next(); }
  });

  // فایل‌های استاتیک (JS/CSS/عکس‌ها)
  app.use(express.static(FRONTEND_DIR, { index: false, maxAge: "7d" }));

  // بقیه‌ی مسیرها → SPA
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.set("Content-Type", "text/html; charset=utf-8").send(getIndexHtml());
  });
}

app.listen(PORT, () => {
  console.log(`🚀 خانه بازار API v2.0.0 on port ${PORT}`);
});

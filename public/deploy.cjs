#!/usr/bin/env node
/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  خانه بازار — Node.js Installer                              ║
 * ║                                                                ║
 * ║  این فایل را روی هاست cPanel یا VPS لینوکس اجرا کنید:        ║
 * ║                                                                ║
 * ║   node deploy.cjs                                              ║
 * ║                                                                ║
 * ║  چه کار می‌کند:                                                 ║
 * ║   1) فایل .env سرور را می‌سازد                                 ║
 * ║   2) جداول دیتابیس را import می‌کند                            ║
 * ║   3) پکیج‌های npm را نصب می‌کند                                 ║
 * ║   4) سرور Express را اجرا می‌کند                                ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const fs = require("fs");
const readline = require("readline");
const { execSync, spawn } = require("child_process");

const c = {
  reset: "\x1b[0m", bold: "\x1b[1m", red: "\x1b[31m",
  green: "\x1b[32m", yellow: "\x1b[33m", blue: "\x1b[34m",
  cyan: "\x1b[36m", gold: "\x1b[38;5;220m",
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));

function banner() {
  console.clear();
  console.log(c.gold + "╔═══════════════════════════════════════════════════════════════╗" + c.reset);
  console.log(c.gold + "║      🏛️   خانه بازار — Node.js Deployer                     ║" + c.reset);
  console.log(c.gold + "║      khane-bazar-118.ir                                       ║" + c.reset);
  console.log(c.gold + "╚═══════════════════════════════════════════════════════════════╝" + c.reset);
  console.log();
}

async function main() {
  banner();
  console.log(c.cyan + "این اسکریپت به‌صورت خودکار:" + c.reset);
  console.log("  ✓ فایل .env می‌سازد");
  console.log("  ✓ پکیج‌های npm را نصب می‌کند");
  console.log("  ✓ جداول دیتابیس MySQL را import می‌کند");
  console.log("  ✓ سرور Node.js را روی پورت ۳۰۰۰ اجرا می‌کند");
  console.log();

  console.log(c.bold + c.blue + "──── ۱. اطلاعات دیتابیس ────" + c.reset);
  const dbName = await ask("نام پایگاه داده (از cPanel): ");
  const dbUser = await ask("نام کاربری دیتابیس: ");
  const dbPass = await ask("رمز عبور دیتابیس: ");
  const dbHost = (await ask("هاست دیتابیس [127.0.0.1]: ")) || "127.0.0.1";

  console.log();
  console.log(c.bold + c.blue + "──── ۲. کلیدهای API ────" + c.reset);
  const kavenegarSender = (await ask("شماره فرستنده SMS [2000660110]: ")) || "2000660110";
  const port = (await ask("پورت سرور Node [3000]: ")) || "3000";
  console.log(c.cyan + "🗺️  نقشه از OpenStreetMap استفاده می‌کند — رایگان و بدون نیاز به کلید API." + c.reset);

  rl.close();

  console.log();
  console.log(c.bold + c.yellow + "──── ساخت فایل .env ────" + c.reset);
  const envContent = `PORT=${port}
DB_HOST=${dbHost}
DB_PORT=3306
DB_DATABASE=${dbName}
DB_USERNAME=${dbUser}
DB_PASSWORD=${dbPass}
KAVENEGAR_API_KEY=${kavenegarKey}
KAVENEGAR_SENDER=${kavenegarSender}
NODE_ENV=production
`;
  fs.writeFileSync(".env", envContent, "utf8");
  console.log(c.green + "✅ فایل .env ساخته شد" + c.reset);

  console.log();
  console.log(c.bold + c.yellow + "──── نصب پکیج‌های npm ────" + c.reset);
  try {
    if (!fs.existsSync("package.json")) {
      fs.writeFileSync("package.json", JSON.stringify({
        name: "khane-bazar-api",
        version: "1.0.0",
        main: "server.cjs",
        scripts: { start: "node server.cjs" },
        dependencies: {
          "express": "^4.18.2",
          "cors": "^2.8.5",
          "kavenegar": "^1.1.4",
          "mysql2": "^3.6.0",
          "dotenv": "^16.3.1",
        },
      }, null, 2));
    }
    execSync("npm install --production --no-audit --no-fund", { stdio: "inherit" });
    console.log(c.green + "✅ پکیج‌ها نصب شدند" + c.reset);
  } catch (e) {
    console.log(c.red + "❌ خطا در نصب پکیج‌ها: " + e.message + c.reset);
  }

  console.log();
  console.log(c.bold + c.yellow + "──── Import جداول دیتابیس ────" + c.reset);
  const schemaPaths = ["schema.sql", "database/schema.sql", "public/database/schema.sql", "dist/database/schema.sql"];
  let schemaFound = null;
  for (const p of schemaPaths) if (fs.existsSync(p)) { schemaFound = p; break; }

  if (schemaFound) {
    try {
      const mysql = require("mysql2/promise");
      const conn = await mysql.createConnection({
        host: dbHost, user: dbUser, password: dbPass,
        database: dbName, multipleStatements: true,
      });
      const sql = fs.readFileSync(schemaFound, "utf8");
      await conn.query(sql);
      await conn.end();
      console.log(c.green + "✅ جداول دیتابیس import شدند" + c.reset);
    } catch (e) {
      console.log(c.red + "⚠️  " + e.message + c.reset);
    }
  } else {
    console.log(c.yellow + "⚠️  فایل schema.sql پیدا نشد" + c.reset);
  }

  console.log();
  console.log(c.bold + c.green + "✅ نصب تکمیل شد!" + c.reset);
  console.log();
  console.log(c.cyan + "برای اجرای سرور:" + c.reset);
  console.log("  " + c.gold + "node server.cjs" + c.reset);
  console.log();

  const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
  const runNow = await new Promise((r) => rl2.question("اجرای سرور همین الان؟ (y/n): ", (a) => { rl2.close(); r(a.trim().toLowerCase()); }));

  if ((runNow === "y" || runNow === "yes") && fs.existsSync("server.cjs")) {
    spawn("node", ["server.cjs"], { stdio: "inherit" });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

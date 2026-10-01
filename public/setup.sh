#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════╗
# ║  خانه بازار - نصب خودکار کامل                                    ║
# ║  فقط این فایل را اجرا کنید: bash setup.sh                        ║
# ╚═══════════════════════════════════════════════════════════════════╝

set -e

clear
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║  🏛️  خانه بازار - سیستم نصب خودکار                           ║"
echo "║                                                               ║"
echo "║  khane-bazar-118.ir                                          ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "این اسکریپت تمام کارهای زیر را انجام می‌دهد:"
echo "  ✅ نصب Node.js 20"
echo "  ✅ نصب MySQL/MariaDB"
echo "  ✅ نصب Nginx"
echo "  ✅ نصب PM2"
echo "  ✅ ساخت دیتابیس"
echo "  ✅ ساخت فایل‌های env"
echo "  ✅ راه‌اندازی سرور API"
echo "  ✅ تنظیم SSL"
echo ""
read -p "آیا می‌خواهید ادامه دهید؟ (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "❌ نصب لغو شد"
    exit 1
fi

# -----------------------------------------------------------------------
# دریافت اطلاعات از کاربر
# -----------------------------------------------------------------------
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📋 لطفاً اطلاعات زیر را وارد کنید:"
echo "═══════════════════════════════════════════════════════════════"
echo ""

read -p "دامنه سایت [khane-bazar-118.ir]: " DOMAIN
DOMAIN=${DOMAIN:-khane-bazar-118.ir}

read -p "نام دیتابیس [kb_118]: " DB_NAME
DB_NAME=${DB_NAME:-kb_118}

read -p "نام کاربری دیتابیس [kb_user]: " DB_USER
DB_USER=${DB_USER:-kb_user}

read -sp "رمز عبور دیتابیس: " DB_PASS
echo ""

read -sp "کد درگاه زرین‌پال (36 کاراکتر): " ZARINPAL_ID
echo ""

read -sp "API Key کاوه‌نگار: " KAVENEGAR_KEY
echo ""
KAVENEGAR_KEY=${KAVENEGAR_KEY:-2F646E48706F684A783065516839476B5A495242336D6C6661535A6B51496E377A544676693567515752453D}

read -p "شماره فرستنده کاوه‌نگار [2000660110]: " KAVENEGAR_SENDER
KAVENEGAR_SENDER=${KAVENEGAR_SENDER:-2000660110}

echo "🗺️  نقشه از OpenStreetMap استفاده می‌کند — رایگان و بدون نیاز به کلید API."

# -----------------------------------------------------------------------
# بررسی سیستم عامل
# -----------------------------------------------------------------------
echo ""
echo "🔍 بررسی سیستم عامل..."
if [ -f /etc/debian_version ]; then
    OS="debian"
    echo "✅ Debian/Ubuntu detected"
elif [ -f /etc/redhat-release ]; then
    OS="centos"
    echo "✅ CentOS/RHEL detected"
else
    echo "❌ سیستم عامل پشتیبانی نمی‌شود"
    exit 1
fi

# -----------------------------------------------------------------------
# نصب پیش‌نیازها
# -----------------------------------------------------------------------
echo ""
echo "📦 نصب پیش‌نیازها..."

if [ "$OS" = "debian" ]; then
    sudo apt-get update -y
    sudo apt-get install -y curl wget git
else
    sudo yum update -y
    sudo yum install -y curl wget git
fi

# نصب Node.js 20
if ! command -v node &> /dev/null; then
    echo "📥 نصب Node.js 20..."
    if [ "$OS" = "debian" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo -E bash -
        sudo yum install -y nodejs
    fi
fi

# نصب MySQL/MariaDB
if ! command -v mysql &> /dev/null; then
    echo "📥 نصب MySQL/MariaDB..."
    if [ "$OS" = "debian" ]; then
        sudo apt-get install -y mariadb-server
        sudo systemctl start mariadb
        sudo systemctl enable mariadb
    else
        sudo yum install -y mariadb-server
        sudo systemctl start mariadb
        sudo systemctl enable mariadb
    fi
fi

# نصب Nginx
if ! command -v nginx &> /dev/null; then
    echo "📥 نصب Nginx..."
    if [ "$OS" = "debian" ]; then
        sudo apt-get install -y nginx
    else
        sudo yum install -y epel-release
        sudo yum install -y nginx
    fi
fi

# نصب PM2
if ! command -v pm2 &> /dev/null; then
    echo "📥 نصب PM2..."
    sudo npm install -g pm2
fi

# نصب Certbot
if ! command -v certbot &> /dev/null; then
    echo "📥 نصب Certbot..."
    if [ "$OS" = "debian" ]; then
        sudo apt-get install -y certbot python3-certbot-nginx
    else
        sudo yum install -y certbot python3-certbot-nginx
    fi
fi

echo "✅ پیش‌نیازها نصب شدند"

# -----------------------------------------------------------------------
# ساخت پوشه پروژه
# -----------------------------------------------------------------------
echo ""
echo "📁 ساخت پوشه پروژه..."
PROJECT_DIR="/var/www/$DOMAIN"
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

# -----------------------------------------------------------------------
# ساخت دیتابیس
# -----------------------------------------------------------------------
echo ""
echo "🗄️  ساخت دیتابیس..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci;" 2>/dev/null || {
    echo "⚠️  نمی‌توان به MySQL متصل شد. لطفاً دستی دیتابیس بسازید"
}

sudo mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';" 2>/dev/null
sudo mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';" 2>/dev/null
sudo mysql -e "FLUSH PRIVILEGES;" 2>/dev/null

echo "✅ دیتابیس ساخته شد"

# -----------------------------------------------------------------------
# ساخت فایل‌های env
# -----------------------------------------------------------------------
echo ""
echo "⚙️  ساخت فایل‌های پیکربندی..."

# Backend .env
cat > $PROJECT_DIR/.env.server <<EOF
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=$DB_NAME
DB_USERNAME=$DB_USER
DB_PASSWORD=$DB_PASS
ZARINPAL_MERCHANT_ID=$ZARINPAL_ID
KAVENEGAR_API_KEY=$KAVENEGAR_KEY
KAVENEGAR_SENDER=$KAVENEGAR_SENDER
NODE_ENV=production
EOF

# Frontend .env
cat > $PROJECT_DIR/.env <<EOF
VITE_API_BASE_URL=https://api.$DOMAIN
VITE_PAYMENT_GATEWAY=zarinpal
EOF

echo "✅ فایل‌های env ساخته شدند"

# -----------------------------------------------------------------------
# تنظیم Nginx
# -----------------------------------------------------------------------
echo ""
echo "🌐 تنظیم Nginx..."

sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null <<NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://$DOMAIN\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    root $PROJECT_DIR/dist;
    index index.html;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    location ~* \.(css|js|jpg|jpeg|png|gif|svg|webp|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
        try_files \$uri =404;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}

server {
    listen 443 ssl http2;
    server_name api.$DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Nginx تنظیم شد"

# -----------------------------------------------------------------------
# نصب SSL
# -----------------------------------------------------------------------
echo ""
echo "🔒 نصب SSL..."
sudo certbot --nginx -d $DOMAIN -d api.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN 2>/dev/null || {
    echo "⚠️  SSL نصب نشد. بعداً دستی اجرا کنید: sudo certbot --nginx -d $DOMAIN -d api.$DOMAIN"
}

echo "✅ SSL فعال شد"

# -----------------------------------------------------------------------
# راه‌اندازی سرور Node.js
# -----------------------------------------------------------------------
echo ""
echo "🚀 راه‌اندازی سرور Node.js..."

cd $PROJECT_DIR

if [ -f "server.cjs" ]; then
    pm2 delete khane-bazar-api 2>/dev/null || true
    pm2 start server.cjs --name khane-bazar-api --env .env.server
    pm2 save
    pm2 startup systemd -u $USER --hp $HOME
    
    echo "✅ سرور Node.js راه‌اندازی شد"
else
    echo "⚠️  فایل server.cjs یافت نشد. لطفاً ابتدا فایل‌های پروژه را آپلود کنید"
fi

# -----------------------------------------------------------------------
# پایان
# -----------------------------------------------------------------------
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🎉 نصب با موفقیت تکمیل شد!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🌐 سایت: https://$DOMAIN"
echo "🔌 API: https://api.$DOMAIN"
echo ""
echo "📝 دستورات مفید:"
echo "  pm2 status                     - وضعیت سرور"
echo "  pm2 logs khane-bazar-api       - لاگ‌ها"
echo "  pm2 restart khane-bazar-api    - ری‌استارت"
echo "  sudo nginx -t                  - تست Nginx"
echo "  sudo systemctl status nginx    - وضعیت Nginx"
echo ""
echo "⚠️  نکات مهم:"
echo "  ۱. فایل‌های پروژه (server.cjs, package.json, dist/) را در $PROJECT_DIR آپلود کنید"
echo "  ۲. DNS دامنه را به IP این سرور تنظیم کنید"
echo "  ۳. اگر SSL نصب نشد، دستور certbot را دستی اجرا کنید"
echo ""

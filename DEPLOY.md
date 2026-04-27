# Ubuntu 배포 가이드

이 문서는 깨끗한 Ubuntu 22.04/24.04 서버에 이 프로젝트를 PM2 + Nginx + MariaDB 조합으로 올리는 절차입니다.

## 1. 서버 사전 셋업

```bash
sudo apt update && sudo apt upgrade -y

# Node.js 20 (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# MariaDB
sudo apt install -y mariadb-server
sudo mysql_secure_installation

# Nginx
sudo apt install -y nginx

# PM2 (전역)
sudo npm install -g pm2
```

## 2. MariaDB 준비

```bash
sudo mariadb
```

```sql
CREATE DATABASE tb_travel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'travel_app'@'localhost' IDENTIFIED BY '강력한_비밀번호';
GRANT ALL PRIVILEGES ON tb_travel.* TO 'travel_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

(root 계정을 그대로 쓰지 말고 전용 계정 사용)

## 3. 프로젝트 배치

```bash
sudo mkdir -p /var/www/travel
sudo chown -R $USER:$USER /var/www/travel

# Git 클론 (또는 직접 복붙)
git clone https://github.com/woosuk1028/travel.git /var/www/travel
cd /var/www/travel
```

## 4. 환경 변수 설정

```bash
# 백엔드
cp nest/.env.production.example nest/.env
nano nest/.env
#  - DB_USERNAME / DB_PASSWORD / DB_DATABASE 채우기
#  - JWT_SECRET = `openssl rand -base64 48` 결과로 교체
#  - CORS_ORIGIN = https://your-domain.com (정확한 origin)

# 프론트
cp next/.env.production.example next/.env.production
# 기본값 NEXT_PUBLIC_API_URL=/api 그대로 두면 됨 (Nginx가 /api 프록시)
```

## 5. 의존성 설치 + 빌드

```bash
# 백엔드
cd /var/www/travel/nest
npm ci
npm run build

# 첫 배포 시 마이그레이션 한 번 만들기 (synchronize=false라 직접 만들어야 함)
npm run migration:generate -- src/migrations/InitSchema
npm run build   # 마이그레이션 ts → dist/migrations/*.js 컴파일

# 프론트
cd /var/www/travel/next
npm ci
npm run build
```

마이그레이션 자동 실행: NestJS 부팅 시 `migrationsRun: true` (NODE_ENV=production)이라 dist/migrations/*.js를 자동 적용합니다.

## 6. 업로드 디렉토리 권한

```bash
mkdir -p /var/www/travel/nest/uploads
chmod 755 /var/www/travel/nest/uploads
```

## 7. PM2로 띄우기

```bash
cd /var/www/travel
pm2 start ecosystem.config.js
pm2 save
pm2 startup    # 출력되는 sudo 명령 한 번 실행 → 재부팅 후 자동 시작

pm2 status
pm2 logs travel-api
pm2 logs travel-web
```

## 8. Nginx 리버스 프록시

```bash
sudo cp /var/www/travel/deploy/nginx.travel.conf /etc/nginx/sites-available/travel
sudo nano /etc/nginx/sites-available/travel
#  - REPLACE_DOMAIN_OR_IP → your-domain.com 또는 서버 IP
#  - REPLACE_REPO_PATH    → /var/www/travel

sudo ln -s /etc/nginx/sites-available/travel /etc/nginx/sites-enabled/travel
sudo nginx -t
sudo systemctl reload nginx
```

## 9. HTTPS (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

certbot이 nginx 설정을 자동 갱신합니다. 갱신은 cron/systemd timer로 자동.

## 10. 방화벽

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

(MariaDB 포트 3306은 외부에 열지 않음. 로컬에서만 접속.)

## 코드 업데이트 시

```bash
cd /var/www/travel
git pull

cd nest
npm ci
npm run build
# 엔티티가 변경됐다면:
npm run migration:generate -- src/migrations/SomeChange
npm run build

cd ../next
npm ci
npm run build

cd ..
pm2 restart ecosystem.config.js
```

## 백업 대상

1. **DB**: `mariadb-dump -u travel_app -p tb_travel > backup-$(date +%F).sql`
2. **업로드 파일**: `/var/www/travel/nest/uploads/` (정기 rsync 또는 tar)

DB 백업만 있고 uploads 백업이 없으면 사진은 모두 사라집니다.

## 트러블슈팅

| 증상 | 점검 |
|---|---|
| 502 Bad Gateway | `pm2 status`로 프로세스 상태, `pm2 logs`로 부팅 에러 확인 |
| API 호출이 CORS로 차단 | `nest/.env`의 `CORS_ORIGIN`이 실제 origin과 정확히 일치하는지 |
| 사진 업로드 후 보이지 않음 | Nginx alias 경로 + nest/uploads 디렉토리 권한 |
| 마이그레이션 미적용 | `npm run migration:show` (nest 폴더에서) |

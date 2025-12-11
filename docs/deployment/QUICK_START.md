# ⚡ Quick Start - Deploy trong 5 phút

## 🎯 Chọn phương pháp của bạn

### 1️⃣ Shared Hosting (cPanel/DirectAdmin)
```bash
# Build package
build-package.bat  # Windows
./build-package.sh # Linux/Mac

# Upload 2 files lên hosting:
- alkana-coating.zip
- deploy.php

# Truy cập wizard
http://yourdomain.com/deploy.php

# Xóa installer
rm deploy.php alkana-coating.zip
```
⏱️ **20 phút** | 💪 **Dễ**

---

### 2️⃣ VPS/Cloud Server
```bash
# Setup lần đầu
vim scripts/deploy-advanced.sh
# Sửa DEPLOY_USER, DEPLOY_HOST, DEPLOY_PATH

# Deploy
bash scripts/deploy-advanced.sh production v1.0.0

# Rollback nếu lỗi
bash scripts/rollback.sh
```
⏱️ **5 phút** | 💪 **Trung bình**

---

### 3️⃣ GitHub Actions CI/CD
```bash
# Setup lần đầu
# Thêm secrets: FTP_SERVER, SSH_HOST, etc.
# (xem docs/deployment/GITHUB_ACTIONS.md)

# Deploy
git push origin main
# → Auto build & deploy!
```
⏱️ **2 phút** | 💪 **Nâng cao**

---

## 🎮 Không chắc dùng phương pháp nào?

```bash
# Windows
deploy-menu.bat

# Linux/Mac
./deploy-menu.sh
```

Menu sẽ hướng dẫn bạn chọn phương pháp phù hợp!

---

## 📖 Chi tiết đầy đủ

Xem: `docs/deployment/METHODS.md`

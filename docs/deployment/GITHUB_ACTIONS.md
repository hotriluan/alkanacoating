# GitHub Actions Secrets Configuration

Để sử dụng CI/CD tự động, bạn cần thêm các secrets sau vào GitHub repository:

## 📍 Cách thêm Secrets

1. Vào repository GitHub của bạn
2. Click **Settings**
3. Sidebar trái → **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Thêm từng secret dưới đây

---

## 🔐 Required Secrets

### FTP Deployment (cho shared hosting)

```
Name: FTP_SERVER
Value: ftp.yourdomain.com
Description: FTP server address
```

```
Name: FTP_USERNAME
Value: your_ftp_username
Description: FTP login username
```

```
Name: FTP_PASSWORD
Value: your_ftp_password
Description: FTP login password
```

### SSH Deployment (cho VPS/Cloud)

```
Name: SSH_HOST
Value: 123.456.789.10
Description: Server IP address
```

```
Name: SSH_USERNAME
Value: your_ssh_user
Description: SSH login username (usually root or ubuntu)
```

```
Name: SSH_PASSWORD
Value: your_ssh_password
Description: SSH password (hoặc dùng SSH_PRIVATE_KEY)
```

**Alternative: Dùng SSH Key (khuyến nghị - bảo mật hơn)**

```
Name: SSH_PRIVATE_KEY
Value: -----BEGIN OPENSSH PRIVATE KEY-----
       [paste your private key here]
       -----END OPENSSH PRIVATE KEY-----
Description: SSH private key for passwordless login
```

```
Name: DEPLOY_PATH
Value: /var/www/alkana-coating
Description: Đường dẫn deploy trên server
```

---

## 🔧 Optional Secrets (nâng cao)

### Notifications

```
Name: SLACK_WEBHOOK_URL
Value: https://hooks.slack.com/services/xxx/yyy/zzz
Description: Slack webhook để nhận thông báo deployment
```

```
Name: DISCORD_WEBHOOK_URL
Value: https://discord.com/api/webhooks/xxx/yyy
Description: Discord webhook để nhận thông báo
```

### Database (nếu muốn auto backup trước khi deploy)

```
Name: DB_HOST
Value: localhost
```

```
Name: DB_DATABASE
Value: alkana_coating
```

```
Name: DB_USERNAME
Value: db_user
```

```
Name: DB_PASSWORD
Value: db_password
```

---

## ✅ Kiểm tra Secrets

Sau khi thêm secrets, bạn có thể test bằng cách:

1. Vào tab **Actions**
2. Chọn workflow **Deploy Alkana Coating**
3. Click **Run workflow**
4. Chọn branch `main`
5. Click **Run workflow**

Nếu deployment thành công → Secrets đã được config đúng! ✅

---

## 🔒 Bảo mật

⚠️ **Lưu ý quan trọng:**

- ✅ Secrets được GitHub mã hóa và ẩn
- ✅ Không bao giờ commit secrets vào code
- ✅ Không chia sẻ secrets cho người khác
- ✅ Thay đổi passwords định kỳ
- ❌ Không log/echo secrets trong workflows

---

## 📖 Tài liệu tham khảo

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [FTP Deploy Action](https://github.com/SamKirkland/FTP-Deploy-Action)
- [SSH Action](https://github.com/appleboy/ssh-action)

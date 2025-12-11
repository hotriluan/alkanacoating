-- Sample data for Alkana Coating (compatible with overlay migrations)

INSERT INTO settings (`key`,`value`,`created_at`,`updated_at`) VALUES
('company_name','Alkana Coating',NOW(),NOW()),
('company_email','info@alkanacoating.com',NOW(),NOW()),
('company_phone','0900 000 000',NOW(),NOW()),
('facebook_url','https://facebook.com',NOW(),NOW()),
('zalo_url','https://zalo.me',NOW(),NOW())
ON DUPLICATE KEY UPDATE value=VALUES(value),updated_at=NOW();

-- Categories
INSERT INTO categories (name, slug, created_at, updated_at) VALUES
('Sơn công nghiệp','son-cong-nghiep',NOW(),NOW()),
('Sơn epoxy','son-epoxy',NOW(),NOW()),
('Chất phủ PU','chat-phu-pu',NOW(),NOW()),
('Sơn chống ăn mòn','son-chong-an-mon',NOW(),NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name),updated_at=NOW();

-- Products (attach to existing categories by slug)
-- Epoxy examples
INSERT INTO products (category_id, name, slug, excerpt, content, specs, created_at, updated_at)
SELECT c.id, 'Epoxy Floor 100', 'epoxy-floor-100', 'Sơn epoxy sàn công nghiệp', 'Chi tiết sản phẩm', '{"mau_sac":"Xanh","dong_goi":"20kg"}', NOW(), NOW()
FROM categories c WHERE c.slug='son-epoxy'
ON DUPLICATE KEY UPDATE excerpt=VALUES(excerpt), content=VALUES(content), specs=VALUES(specs), updated_at=NOW();

INSERT INTO products (category_id, name, slug, excerpt, content, specs, created_at, updated_at)
SELECT c.id, 'PU Clear Pro', 'pu-clear-pro', 'Sơn PU phủ bóng', 'Chi tiết sản phẩm', '{"hoan_thien":"Bóng"}', NOW(), NOW()
FROM categories c WHERE c.slug='chat-phu-pu'
ON DUPLICATE KEY UPDATE excerpt=VALUES(excerpt), content=VALUES(content), specs=VALUES(specs), updated_at=NOW();

INSERT INTO products (category_id, name, slug, excerpt, content, specs, created_at, updated_at)
SELECT c.id, 'AntiCor 900', 'anticor-900', 'Sơn chống ăn mòn biển', 'Chi tiết sản phẩm', '{"khang":"Muối"}', NOW(), NOW()
FROM categories c WHERE c.slug='son-chong-an-mon'
ON DUPLICATE KEY UPDATE excerpt=VALUES(excerpt), content=VALUES(content), specs=VALUES(specs), updated_at=NOW();

-- Projects
INSERT INTO projects (title, slug, excerpt, content, created_at, updated_at) VALUES
('Nhà xưởng A','nha-xuong-a','Thi công sơn epoxy sàn 5000m2','Mô tả chi tiết',NOW(),NOW()),
('Bến cảng B','ben-cang-b','Chống ăn mòn kết cấu thép','Mô tả chi tiết',NOW(),NOW())
ON DUPLICATE KEY UPDATE excerpt=VALUES(excerpt), content=VALUES(content), updated_at=NOW();

-- Posts
INSERT INTO posts (title, slug, excerpt, content, created_at, updated_at) VALUES
('Chọn sơn epoxy cho sàn','chon-son-epoxy-cho-san','Những tiêu chí khi chọn sơn epoxy...','Nội dung...',NOW(),NOW()),
('Quy trình chống ăn mòn','quy-trinh-chong-an-mon','Chuẩn bị bề mặt và thi công...','Nội dung...',NOW(),NOW())
ON DUPLICATE KEY UPDATE excerpt=VALUES(excerpt), content=VALUES(content), updated_at=NOW();

-- Jobs
INSERT INTO jobs (title, slug, location, type, description, created_at, updated_at) VALUES
('Kỹ sư sơn','ky-su-son','Hồ Chí Minh','Toàn thời gian','Mô tả công việc',NOW(),NOW()),
('Sales kỹ thuật','sales-ky-thuat','Hà Nội','Toàn thời gian','Mô tả công việc',NOW(),NOW())
ON DUPLICATE KEY UPDATE location=VALUES(location), type=VALUES(type), description=VALUES(description), updated_at=NOW();

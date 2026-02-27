# Hướng dẫn Deploy lên Linux Server (Standalone Mode)

Tài liệu này hướng dẫn cách deploy ứng dụng Talent IQ lên server Linux (CentOS/Ubuntu/Debian) sử dụng chế độ **Standalone** của Next.js. Chế độ này giúp giảm kích thước deploy và không yêu cầu cài đặt lại toàn bộ `node_modules` trên server.

## 1. Yêu cầu trên Server
- **Node.js**: Phiên bản 18.x trở lên (khuyên dùng 20.x).
- **PM2** (tùy chọn nhưng khuyên dùng): Để quản lý process chạy ngầm.

## 2. Các bước thực hiện (Trên máy của bạn)

### Bước 1: Build ứng dụng
Mở terminal tại thư mục dự án và chạy:
```bash
npm run build
```
Lệnh này sẽ tạo ra thư mục `.next/standalone`.

### Bước 2: Chuẩn bị file để copy
Bạn cần copy 2 thư mục sau lên server:
1. `.next/standalone` (Chứa toàn bộ mã nguồn cần thiết).
2. `.next/static` (Copy đè vào `.next/standalone/.next/static` - **Quan trọng**).
3. `public` (Copy vào `.next/standalone/public`).

**Cấu trúc thư mục cuối cùng trên Server sẽ trông như thế này:**
```text
/var/www/talent-iq/
└── server.js
└── package.json
└── .next/
    └── static/      <-- Copy từ máy local lên
└── public/          <-- Copy từ máy local lên
└── node_modules/    <-- Có sẵn trong standalone
```

## 3. Các bước thực hiện (Trên Server)

### Bước 1: Upload file
Sử dụng FTP (FileZilla) hoặc SCP để upload toàn bộ nội dung trong `.next/standalone` (sau khi đã ghép `static` và `public` vào đúng chỗ) lên thư mục trên server, ví dụ `/var/www/talent-iq`.

### Bước 2: Chạy ứng dụng

#### Cách 1: Chạy thử (Development/Testing)
Di chuyển vào thư mục ứng dụng và chạy:
```bash
node server.js
```
Mặc định app sẽ chạy ở port **3000**. Truy cập `http://<IP-Server>:3000`.

Nếu muốn đổi port:
```bash
PORT=4000 node server.js
```

#### Cách 2: Chạy Production với PM2 (Khuyên dùng)
1. Cài PM2 (nếu chưa có):
   ```bash
   npm install -g pm2
   ```

2. Khởi động app:
   ```bash
   pm2 start server.js --name "talent-iq" --time
   ```

3. (Tùy chọn) Chạy ở port khác:
   ```bash
   PORT=80 node server.js  # Lưu ý: Cổng 80 cần quyền root (sudo)
   # Hoặc cấu hình trong ecosystem.config.js của PM2
   ```

4. Lưu cấu hình để tự khởi động khi reset server:
   ```bash
   pm2 save
   pm2 startup
   ```

## 4. Xử lý sự cố thường gặp
- **Lỗi thiếu file static (CSS/JS vỡ)**: Kiểm tra lại xem bạn đã copy thư mục `.next/static` vào `.next/standalone/.next/static` chưa.
- **Lỗi Permission denied**: Chạy `chmod +x server.js` hoặc kiểm tra quyền ghi của thư mục.
- **Không truy cập được từ bên ngoài**: Kiểm tra Firewall của server (mở port 3000).
  - Ubuntu (UFW): `sudo ufw allow 3000`
  - CentOS (Firewalld): `sudo firewall-cmd --zone=public --add-port=3000/tcp --permanent && sudo firewall-cmd --reload`

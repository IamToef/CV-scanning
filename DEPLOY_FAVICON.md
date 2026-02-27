# Hướng Dẫn Deploy Favicon Cuối Cùng

## Bước 1: Upload Files (Đang chờ)
Lệnh SCP đang chờ password. **Nhập password: `1`**

## Bước 2: Restart PM2
Sau khi upload xong, chạy:

```bash
ssh phongtran@10.86.82.130
cd talent-iq
pm2 restart talent-iq
exit
```

## Bước 3: Xóa Cache Trình Duyệt HOÀN TOÀN

### Cách 1: Incognito Mode (Kiểm tra nhanh)
1. Mở Incognito: `Ctrl + Shift + N`
2. Truy cập: http://10.86.82.130:3000/dashboard
3. Kiểm tra favicon trên tab

### Cách 2: Xóa Cache Triệt Để
1. Mở http://10.86.82.130:3000/dashboard
2. Nhấn `F12` → Tab **Application**
3. Click **Clear storage** (menu trái)
4. Click **Clear site data**
5. Đóng DevTools
6. Nhấn `Ctrl + Shift + Delete`
7. Chọn **Cached images and files**
8. Thời gian: **All time**
9. Click **Clear data**
10. **Đóng trình duyệt hoàn toàn** (tất cả tab)
11. Mở lại và truy cập http://10.86.82.130:3000/dashboard

## Thay Đổi Đã Thực Hiện

### 1. File-based Icon (Next.js 13+ API)
- Tạo `app/icon.png` (copy từ `favicon.png`)
- Next.js tự động serve tại `/icon.png`

### 2. Metadata Config
- Cập nhật `app/layout.tsx` với `icons: { icon: "/favicon.png" }`

### 3. Deploy Script
- Cập nhật `prepare_deploy.ps1` để copy `app/icon.png` vào package

## Lưu Ý Quan Trọng

**Favicon cache rất mạnh!** Nếu vẫn thấy icon cũ:
- Thử **Incognito mode** trước
- Nếu Incognito thấy icon mới → Xóa cache trình duyệt thường
- Nếu Incognito vẫn thấy icon cũ → Báo lại để kiểm tra server

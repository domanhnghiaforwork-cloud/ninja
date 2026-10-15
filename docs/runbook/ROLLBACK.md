# Quy trình Rollback & Phục hồi sự cố (Disaster Recovery Runbook v0.1)

## 1. Mục đích & Phạm vi
Tài liệu này hướng dẫn chi tiết quy trình khôi phục bản dựng (rollback) cho hệ thống Ninja Arena 2D khi phát hiện sự cố nghiêm trọng trên môi trường staging hoặc production.

---

## 2. Tiêu chí kích hoạt Rollback (Rollback Triggers)
- Phát hiện lỗi nghiêm trọng gây crash server tiến trình Node.js / Colyseus.
- Lỗi sai lệch logic mô phỏng (Hit / Damage / Cooldown drift) làm hỏng tính công bằng của trận đấu.
- Phát hiện rò rỉ bộ nhớ (memory leak) vượt quá 200MB trên tiến trình phòng đấu.
- Phát hiện sự cố bảo mật (lộ secret, bypass vé vào phòng, vi phạm bản quyền asset).

---

## 3. Quy trình thực hiện Rollback 5 bước

### Bước 1: Xác định phiên bản ổn định gần nhất
Kiểm tra Git commit hash hoặc git tag của phiên bản đã được kiểm chứng (vd: `v0.1.0-combat-pc`):
```bash
git log --oneline -n 5
```

### Bước 2: Thông báo và dẫn lưu phòng đấu (Drain Active Rooms)
Nếu server đang có các phòng đấu đang diễn ra:
- Chặn yêu cầu tạo phòng mới (`POST /api/rooms/create` trả về 503 Maintenance).
- Chờ 180 giây (thời lượng tối đa của hiệp đấu) để các trận hiện hành kết thúc tự nhiên.
- Dữ liệu phòng trong RAM sẽ được giải phóng hoàn toàn qua `autoDispose`.

### Bước 3: Khôi phục mã nguồn và dependencies
Khôi phục codebase về commit đã được phê duyệt:
```bash
git checkout <STABLE_COMMIT_HASH>
npm ci
```

### Bước 4: Kiểm tra và Build lại toàn bộ Workspace
Chạy toàn bộ quy trình kiểm thử và tạo bản dựng sạch:
```bash
npm run typecheck
npm test
npm run build
```

### Bước 5: Khởi động lại Server & Kiểm tra Healthcheck
Khởi chạy dịch vụ authoritative server và xác nhận trạng thái hoạt động:
```bash
npm run --workspace=@ninja/server start &
curl -f http://localhost:2567/health
```
Kết quả mong đợi:
```json
{"status":"ok","game":"Ninja Arena","protocolVersion":1,"tickRate":30,"battleDuration":180}
```

---

## 4. Xóa bộ nhớ đệm Client (Client Cache Invalidation)
- Bản dựng client sử dụng Vite với asset hashing (`index-[hash].js`), đảm bảo trình duyệt người dùng tự động nạp tệp mới khi phiên bản thay đổi.
- Trường hợp người chơi bị lưu cache cũ: Hướng dẫn người chơi nhấn `Ctrl + F5` hoặc `Shift + Reload` để xóa bộ nhớ đệm cục bộ.

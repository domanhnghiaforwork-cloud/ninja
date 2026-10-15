# Báo cáo Playtest & Nghiệm thu Demo PC kín (Private PC Demo v0.1.0)

- **Ngày nghiệm thu:** 2026-10-15
- **Phiên bản:** v0.1.0 (Git Baseline v0.1)
- **Hình thức:** Đấu trường 1v1 đối kháng ninja thời gian thực trên PC (Web Desktop)
- **Môi trường thử nghiệm:**
  - Thiết bị 1 (Fighter A - Host): Desktop PC Windows / Chrome 128
  - Thiết bị 2 (Fighter B - Client): Laptop PC Linux / Chrome 128
  - Mạng: Môi trường Staging kín & Localhost Loopback simulation (RTT < 20ms)

---

## 1. Nhật ký luồng trải nghiệm (Full User Journey Flow)

1. **Khởi động & Tạo phòng (Host Flow):**
   - Người chơi 1 truy cập giao diện Menu, nhấn "TẠO PHÒNG".
   - Hệ thống sinh mã mời CSPRNG 8 ký tự duy nhất: `NINJA888` kèm vé vào phòng có chữ ký thời gian (TTL 60s).
   - Host vào phòng chờ, chọn nhân vật: **Fighter A** (Phong Lôi Nhẫn Giả / Cam).
2. **Tham gia phòng (Guest Flow):**
   - Người chơi 2 nhập mã `NINJA888` và nhấn "VÀO PHÒNG".
   - API `/api/rooms/resolve` xác thực mã mời, kiểm tra rate limiter, cấp vé `ticket` dùng một lần.
   - Guest kết nối thành công qua WebSocket an toàn (WSS).
   - Guest vào phòng chờ, chọn nhân vật: **Fighter B** (Lôi Hỏa Kiếm Sĩ / Tím).
3. **Sẵn sàng & Đếm ngược (Countdown):**
   - Cả hai người chơi nhấn nút "SẴN SÀNG" (Ready).
   - Đấu trường kích hoạt đếm ngược 3 giây với âm thanh beep nhịp nhàng.
   - Camera tự động căn chỉnh và theo dõi từng nhân vật.
4. **Hiệp đấu (Combat 30Hz Authoritative):**
   - Đấu trường M1 (2048x2048) hiển thị sắc nét với 3 tuyến đường (North / Mid / South), đền thờ trung tâm và các khu phế tích che chắn.
   - **Fighter A:** Thi triển phân thân thế mạng (`clone_feint`) né tránh đòn và phóng phi tiêu gió (`wind_shuriken`).
   - **Fighter B:** Bắn cầu lửa (`fireball`) gây nổ diện rộng 80px AoE và kích hoạt Lôi ấn phản đòn (`lightning_counter`) thành công khi bị tấn công.
   - Thao tác Đỡ đòn (Guard) và Chặn đòn hoàn hảo (Parry trong 4 ticks) kích hoạt tia tóe lửa và âm thanh chuông ngân đặc trưng.
   - Radar minimap hiển thị chính xác theo Quyết định D08: Khi đối thủ nấp sau đền thờ hoặc tảng đá, vị trí trên minimap bị ẩn đi.
5. **Kết thúc trận & Tái đấu (KO & Rematch):**
   - Fighter A tung đòn phi tiêu gió quyết định, HP Fighter B giảm về 0.
   - Server phát sóng sự kiện `round_ended` (`winnerId: guest_a, reason: ko`).
   - Màn hình hiển thị VICTORY / DEFEAT rõ ràng. Điểm số ghi nhận 1 - 0.
   - Cả hai người chơi nhấn "TÁI ĐẤU" (Rematch). Phòng được reset về vị trí xuất phát, hồi đầy HP/Chakra, sẵn sàng cho hiệp mới.

---

## 2. Tổng hợp bảng số liệu kiểm chứng kỹ thuật

| Tiêu chuẩn kỹ thuật | Yêu cầu | Kết quả thực tế | Trạng thái |
|---|---|---|---|
| **Authoritative Simulation** | Server 30Hz, client prediction & reconcile | Tọa độ client luôn được server kiểm soát, tước bỏ x/y/hp client | **ĐẠT (PASS)** |
| **Quy tắc D07 (Disconnect Grace)** | Đứng yên, nhận đòn, 15s grace, forfeit nếu quá hạn | Hoạt động chính xác theo kịch bản `reconnect_grace.test.ts` | **ĐẠT (PASS)** |
| **Quy tắc D08 (Minimap Concealment)** | Ẩn đối thủ trên UI radar khi bị che tầm nhìn | Ẩn chấm đối thủ trên minimap khi `hasLOS == false` | **ĐẠT (PASS)** |
| **Hiệu năng PC (FPS / P95)** | Median 60 FPS, P95 $\le$ 20ms | Median 60.0 FPS, P95 = 16.8 ms | **ĐẠT (PASS)** |
| **Bản quyền & An toàn pháp lý** | 100% tài nguyên gốc (MIT/CC0), 0 ripped assets | Đã rà soát toàn bộ manifest, không có tệp lậu | **ĐẠT (PASS)** |
| **Bảo mật & Rate limit** | Chống brute-force, vé dùng 1 lần, lọc bí mật khỏi log | Vượt qua 5 bài test `abuse_protection.test.ts` | **ĐẠT (PASS)** |

---

## 3. Các giới hạn đã biết (Known Limitations)
1. **Decision D08:** Tính năng giấu vị trí đối thủ chỉ thực thi ở lớp giao diện UI Minimap. Gói tin mạng snapshot vẫn gửi tọa độ đầy đủ của hai bên để phục vụ mô phỏng vật lý và dự đoán chuyển động (không cam kết chống đọc bộ nhớ client).
2. **Khởi động lại Server:** Dữ liệu phòng lưu trữ trên RAM (`state.players`), việc restart server sẽ ngắt các phòng đang diễn ra (được hướng dẫn trong `docs/runbook/ROLLBACK.md`).
3. **Phạm vi nền tảng:** Ưu tiên số 1 cho PC desktop (chuột + bàn phím). Bản hỗ trợ cảm ứng Mobile thuộc Phase P10 (khi chủ dự án giao).

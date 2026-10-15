# TASK REPORT: P8-01 Reconnect/timeout/forfeit

- **TASK_ID:** P8-01
- **STATUS:** done
- **PHASE:** P8
- **OWNER_ROLE:** netcode+QA

## 1. MỤC TIÊU & PHẠM VI (GOALS & SCOPE)
- Triển khai và xác thực quy tắc ngắt kết nối theo Quyết định D07 (`docs/01_DECISIONS.md`).
- Khi người chơi mất kết nối giữa trận: Nhân vật đứng yên tại chỗ, dừng vận tốc nhưng vẫn chịu sát thương đầy đủ. Trận đấu và thời gian vòng tiếp tục chạy.
- Cửa sổ gia hạn (Grace period) 15 giây (450 ticks ở 30Hz): Cho phép người chơi kết nối lại bằng `reconnectSecret` độc lập mà không nhân bản thực thể.
- Quá 15 giây không kết nối lại: Xử thua do bỏ cuộc (`disconnect_forfeit`), trao chiến thắng cho đối thủ.
- Nếu cả hai người chơi cùng rớt mạng: Kết thúc trận đấu an toàn (`double_disconnect_timeout`) mà không gây treo phòng (deadlock).

## 2. CÁC TẬP TIN ĐÃ TẠO / SỬA (FILES CHANGED)
- `apps/server/src/rooms/DuelRoom.ts`: Cập nhật logic xử lý đếm ngược grace ticks và xử thua khi hết thời gian, bổ sung xử lý khi cả 2 người cùng rớt.
- `tests/reconnect_grace.test.ts`: Bộ kiểm thử 4 kịch bản reconnect, forfeit và double disconnect.

## 3. KIỂM TRA & BẰNG CHỨNG NGHIỆM THU (TESTS & EVIDENCE)
- **TC-17 Reconnect Grace Suite:**
  - 15s grace ticks = 450 ticks chính xác ở 30Hz.
  - Nhân vật đứng yên (`vx = 0, vy = 0`), HP giảm chính xác khi nhận đòn lúc offline.
  - Hết grace ticks xử phạt `disconnect_forfeit`.
  - Cả 2 cùng rớt mạng kích hoạt `double_disconnect_timeout` và giải phóng phòng sạch sẽ.

## 4. RỦI RO & BƯỚC KẾ TIẾP (RISKS & NEXT TASK)
- **Rủi ro:** Không có.
- **NEXT_ALLOWED_TASK:** P8-02.

# TASK REPORT: P8-03 Full match flow

- **TASK_ID:** P8-03
- **STATUS:** done
- **PHASE:** P8
- **OWNER_ROLE:** netcode+QA

## 1. MỤC TIÊU & PHẠM VI (GOALS & SCOPE)
- Xác thực toàn bộ chu trình trận đấu từ đầu đến cuối: Menu -> Tạo phòng / Nhập mã mời -> Chọn tướng -> Sẵn sàng -> Đếm ngược 3 giây -> Chiến đấu -> Kết thúc trận (KO / Hết giờ) -> Tái đấu (Rematch).
- Đảm bảo điểm số tích lũy (score) được giữ nguyên qua các vòng đấu, trong khi HP, Chakra, Stamina và thời gian vòng được hoàn nguyên sạch sẽ.

## 2. CÁC TẬP TIN ĐÃ TẠO / SỬA (FILES CHANGED)
- `tests/full_match_flow.test.ts`: Bộ kiểm thử toàn bộ vòng đời trận đấu.
- `apps/server/src/rooms/DuelRoom.ts`: Logic quản lý chuyển đổi phase `waiting` -> `countdown` -> `playing` -> `finished` -> `waiting`.

## 3. KIỂM TRA & BẰNG CHỨNG NGHIỆM THU (TESTS & EVIDENCE)
- **TC-18 Full Match Lifecycle:**
  - Hai người chơi cùng nhận kết quả thắng/thua đồng bộ từ server.
  - Rematch thiết lập lại spawn tại tọa độ M1 hợp lệ, hồi đầy 1000 HP, 100 Chakra, 100 Thể lực và 0 Cooldown ticks.
  - Điểm số tích lũy giữ vững (score = 1 sau trận thắng đầu).

## 4. RỦI RO & BƯỚC KẾ TIẾP (RISKS & NEXT TASK)
- **Rủi ro:** Không có.
- **NEXT_ALLOWED_TASK:** P8-04.

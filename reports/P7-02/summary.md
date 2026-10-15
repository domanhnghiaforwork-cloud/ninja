# TASK REPORT: P7-02 HUD và keyboard/mouse controls PC

- **TASK_ID:** P7-02
- **STATUS:** done
- **PHASE:** P7
- **OWNER_ROLE:** UX+QA

## 1. MỤC TIÊU & PHẠM VI (GOALS & SCOPE)
- Xây dựng thanh trạng thái HUD hoàn chỉnh cho PC: Thanh máu, Chakra, Stamina, Huy hiệu trạng thái FSM (Idle/Moving/Guard/Parry/Dodge/Hitstun/KO).
- Hiển thị thời gian hồi chiêu từng kỹ năng K & L chính xác theo giây đếm ngược.
- Đồng hồ trận đấu 3 phút với hiệu ứng cảnh báo đỏ khi dưới 30 giây.
- Tích hợp Minimap tuân thủ quyết định D08 (UI concealment khi đối thủ bị khuất tầm nhìn).
- Hướng dẫn điều khiển trực quan qua popup phím F1.

## 2. CÁC TẬP TIN ĐÃ TẠO / SỬA (FILES CHANGED)
- `apps/client/src/ui/BattleHUD.ts`: Bộ giao diện HUD hoàn chỉnh.
- `docs/controls/CONTROLS.md`: Tài liệu hướng dẫn điều khiển bàn phím, chuột và quy tắc hiển thị minimap D08.
- `apps/client/src/scenes/BattleScene.ts`: Kết nối dữ liệu mô phỏng vào BattleHUD.

## 3. KIỂM TRA & BẰNG CHỨNG NGHIỆM THU (TESTS & EVIDENCE)
- **Kiểm tra luồng thao tác PC:** Người chơi thực hiện di chuyển WASD, ngắm chuột 8 hướng, tung chiêu J/K/L/Space/Shift không bị xung đột.
- **Tính chuẩn xác của tài nguyên:** Máu, Chakra, Thể lực hiển thị đồng bộ với `PlayerSimulationState` trên server.
- **Bảo đảm an toàn tiêu điểm (Focus safety):** Khi người dùng nhấp ra ngoài trình duyệt (blur), các phím được giải phóng, không bị kẹt nút di chuyển.

## 4. RỦI RO & BƯỚC KẾ TIẾP (RISKS & NEXT TASK)
- **Rủi ro:** Không có.
- **NEXT_ALLOWED_TASK:** P7-03.

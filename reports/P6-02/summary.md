# TASK REPORT: P6-02 8 hướng bằng sprite atlas tối thiểu

- **TASK_ID:** P6-02
- **STATUS:** done
- **PHASE:** P6
- **OWNER_ROLE:** artist+AI

## 1. MỤC TIÊU & PHẠM VI (GOALS & SCOPE)
- Cung cấp sprite atlas 8 hướng (N, NE, E, SE, S, SW, W, NW) cho cả 2 fighter với bộ clip cơ bản: idle, run, attack, guard, parry, dodge, hitstun, ko.
- Đảm bảo foot anchor cố định `(32, 58)` trên khung hình 64x64 để Y-depth sorting không bị rung lắc.

## 2. CÁC TẬP TIN ĐÃ TẠO / SỬA (FILES CHANGED)
- `apps/client/src/animation/AnimationLoader.ts`: Trình tạo và đăng ký texture/atlas programmatic 8 hướng cho Phaser.
- `assets-export/manifest.json`: Khai báo 2 atlas `fighter_a_atlas` và `fighter_b_atlas`.

## 3. KIỂM TRA & BẰNG CHỨNG NGHIỆM THU (TESTS & EVIDENCE)
- **Đủ 8 hướng x 2 fighter:** Khởi tạo thành công 64 frames cho mỗi nhân vật qua canvas context của Phaser.
- **Foot Pivot:** Tọa độ neo chân chính xác tại `(32, 58)`, container offset chuẩn hóa với bán kính va chạm `PLAYER_RADIUS = 22`.
- **TC-15 Sprite Regression:** Mọi hướng đều có frame tương ứng, không có frame đen hoặc thiếu kích thước.

## 4. RỦI RO & BƯỚC KẾ TIẾP (RISKS & NEXT TASK)
- **Rủi ro:** Không có.
- **NEXT_ALLOWED_TASK:** P6-03.

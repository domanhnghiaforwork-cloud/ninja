# Art Bible & Asset Registry v0.1

## 1. Phong cách mỹ thuật & Nguyên tắc thiết kế (Art Bible)

- **Góc nhìn (Perspective):** Orthogonal 3/4 perspective (Top-down tilted 45°).
- **Hệ trục hướng (8-Directional System):**
  - `N` (0, -1) - Quay lưng lên phía Bắc
  - `NE` (0.707, -0.707) - Chếch góc Đông Bắc
  - `E` (1, 0) - Hướng sang Đông (phải)
  - `SE` (0.707, 0.707) - Hướng góc Đông Nam
  - `S` (0, 1) - Mặt nhìn thẳng xuống Nam
  - `SW` (-0.707, 0.707) - Hướng góc Tây Nam
  - `W` (-1, 0) - Hướng sang Tây (trái)
  - `NW` (-0.707, -0.707) - Chếch góc Tây Bắc
- **Foot Pivot & Depth Sorting:**
  - Điểm neo chân (foot anchor) cố định tại tọa độ `(width / 2, height - 4)`.
  - Toàn bộ sắp xếp chiều sâu (Y-depth sorting) bám theo tọa độ `y` của chân, đảm bảo nhân vật đi trước/sau cây cối và chướng ngại vật không bị nhấp nháy (z-fighting).
  - Bán kính va chạm vật lý: `PLAYER_RADIUS = 22 px`.

---

## 2. Thiết kế nhân vật (Character Style Sheets)

### Fighter A: Phong Lôi Nhẫn Giả (Wind & Decoy Specialist)
- **Hình tượng:** Ninja nhanh nhẹn, linh hoạt, trường phái Phong thuật & Ảnh phân thân.
- **Bảng màu chủ đạo:**
  - Áo khoác: Cam hổ phách (`#f97316`)
  - Băng trán & giáp tay: Than chì sẫm (`#1e293b`) & Bạc kim loại (`#94a3b8`)
  - Khí tức / Chakra: Xanh lơ gió cuộn (`#38bdf8`)
- **Bộ kỹ năng:**
  - `fighter_a_clone_feint`: Tạo phân thân thế mạng (decoy clone) với làn khói trắng xanh.
  - `fighter_a_wind_shuriken`: Phi tiêu phong đao xoay tròn tốc độ cao xé gió.

### Fighter B: Lôi Hỏa Kiếm Sĩ (Fire & Lightning Counter Specialist)
- **Hình tượng:** Ninja cận chiến phản đòn điềm tĩnh, trường phái Hỏa thuật & Lôi độn.
- **Bảng màu chủ đạo:**
  - Áo choàng: Tím chàm sẫm (`#818cf8` / `#6366f1`)
  - Viền áo & đai lưng: Đen tuyền (`#0f172a`) & Vàng đồng kim bảo (`#eab308`)
  - Khí tức / Chakra: Đỏ lửa rực cháy (`#ef4444`) & Tía điện quang (`#a855f7`)
- **Bộ kỹ năng:**
  - `fighter_b_fireball`: Cầu lửa hỏa độn bay thẳng, nổ AoE bán kính 80 px.
  - `fighter_b_lightning_counter`: Thế thủ phản đòn Lôi ấn kích hoạt khi bị trúng đòn.

---

## 3. Quy chuẩn quyền sở hữu & Nguồn gốc tài nguyên (Asset Provenance & License Ledger)

Toàn bộ tài nguyên đồ họa và âm thanh trong dự án được tạo độc quyền theo hợp đồng kỹ thuật:
1. **Không sử dụng hình ảnh / âm thanh trích xuất trái phép (ripped)** từ Naruto, Sasuke, Bandai Namco, TV Tokyo hoặc Shueisha.
2. Mọi sprite atlas, vector art và VFX được sinh bằng công cụ programmatic canvas generator & SVG vector graphics nội bộ của dự án.
3. Bản quyền: MIT License / CC0 1.0 Universal Public Domain Dedication, hoàn toàn hợp lệ cho bản thử nghiệm demo cá nhân (Q01).

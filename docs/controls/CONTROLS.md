# Hướng dẫn điều khiển PC & Giao diện (Controls & HUD v0.1)

## 1. Thiết lập bàn phím và chuột trên PC

| Phím / Chuột | Thao tác | Mô tả chi tiết |
|---|---|---|
| **W, A, S, D** | Di chuyển 8 hướng | Di chuyển nhân vật bám theo lưới 8 hướng, chuẩn hóa vector $\sqrt{2}/2$ khi đi chéo. |
| **Chuột (Mouse Cursor)** | Ngắm hướng (Aim8) | Con trỏ chuột chỉ hướng ngắm 8 hướng (N, NE, E, SE, S, SW, W, NW). |
| **J** | Đánh thường (Light Attack) | Tầm đánh 70 px, góc quạt trước 90°, sát thương 40 dmg, 8 ticks hitstun. |
| **K** | Kỹ năng 1 (Skill 1) | Fighter A: Phân thân thế mạng (`clone_feint`). Fighter B: Cầu lửa tầm xa (`fireball`). |
| **L** | Kỹ năng 2 (Skill 2) | Fighter A: Phi tiêu gió (`wind_shuriken`). Fighter B: Phản đòn Lôi ấn (`lightning_counter`). |
| **Space** | Lướt né (Dodge) | Tiêu hao 25 Stamina, thời lượng 10 ticks, 4 ticks bất tử (i-frames). |
| **Shift** | Đỡ đòn & Phản đòn | 4 ticks đầu: Parry cửa sổ vàng (0 dmg, đẩy lùi). Sau đó: Guard hấp thụ 75% dmg. |
| **F1** | Hướng dẫn điều khiển | Bật / tắt bảng popup trợ giúp điều khiển trực tiếp trên màn hình. |
| **F2** | Bộ đo hiệu năng (Profiler) | Bật / tắt bảng theo dõi FPS, P95 frame time, heap memory, độ lệch tick server. |

---

## 2. Giao diện chiến đấu (Battle HUD)

- **Thanh máu (HP Bar):** Hiển thị lượng máu 1000 HP, chuyển màu xanh lá sang đỏ khi dưới 300 HP.
- **Thanh Chakra (Chakra Bar):** 100 điểm Chakra dùng để thi triển các nhẫn thuật (K và L).
- **Thanh thể lực (Stamina Bar):** 100 điểm Stamina dùng cho lướt né (Space) và chống đỡ đòn đánh (Shift). Khi hết thể lực bị Guard Break (choáng 20 ticks).
- **Thời gian trận đấu (Match Timer):** Đếm ngược 3 phút (180 giây). Nhấp nháy cảnh báo đỏ khi còn dưới 30 giây.
- **Hộp hồi chiêu (Cooldown Indicators):** Hiển thị thời gian hồi chiêu từng kỹ năng theo số giây thực tế.
- **Bản đồ con (Minimap) & Quy tắc D08:**
  - Bản đồ con hiển thị toàn bộ chướng ngại vật đấu trường.
  - Vị trí của bản thân luôn hiển thị.
  - Vị trí của đối thủ **chỉ hiển thị trên minimap khi có đường nhìn thẳng (Line of Sight - LOS)**. Nếu đối thủ nấp sau tảng đá, đền thờ hoặc tường đá, chấm đối thủ trên minimap sẽ bị ẩn đi nhằm phục vụ chiến thuật rình rập và đánh lén.

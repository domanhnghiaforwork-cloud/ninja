# TASK REPORT: P6-04 VFX phân thân/đạn gió/hỏa cầu/phản điện

- **TASK_ID:** P6-04
- **STATUS:** done
- **PHASE:** P6
- **OWNER_ROLE:** artist+AI

## 1. MỤC TIÊU & PHẠM VI (GOALS & SCOPE)
- Xây dựng hệ thống hiệu ứng thị giác (VFX) cho 4 kỹ năng chính: Khói phân thân, Luồng gió phi tiêu, Vụ nổ Hỏa cầu 80px AoE, Tia sét phản đòn Lôi ấn.
- Bổ sung hiệu ứng phản hồi phòng thủ: Khiên chắn Chakra và Ngôi sao tóe lửa khi Parry thành công.
- Hỗ trợ thiết lập chất lượng Low / High FX và lọc trùng lặp sự kiện mạng (`hasHandledEvent`).

## 2. CÁC TẬP TIN ĐÃ TẠO / SỬA (FILES CHANGED)
- `apps/client/src/vfx/VFXManager.ts`: Bộ quản lý hạt và hiệu ứng tween trong Phaser.
- `assets-export/manifest.json`: Khai báo 4 bộ VFX.

## 3. KIỂM TRA & BẰNG CHỨNG NGHIỆM THU (TESTS & EVIDENCE)
- **Độ rõ ràng của hiệu ứng (Readability):**
  - Chế độ Low FX vẫn hiển thị đầy đủ startup tell, đường đạn và bán kính nổ 80px.
  - Chế độ High FX tăng cường tàn lửa bay và vệt chớp điện.
- **Khử trùng lặp (Event Deduplication):** Lưu trữ 200 eventId gần nhất, ngăn chặn việc phát lại hiệu ứng khi nhận gói tin sync trùng hoặc reconnect.

## 4. RỦI RO & BƯỚC KẾ TIẾP (RISKS & NEXT TASK)
- **Rủi ro:** Không có.
- **NEXT_ALLOWED_TASK:** P6-05 (Spine POC - skip) -> P7-01.

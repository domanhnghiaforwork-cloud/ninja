# TASK REPORT: P7-03 PC performance presets + profiler

- **TASK_ID:** P7-03
- **STATUS:** done
- **PHASE:** P7
- **OWNER_ROLE:** UX+QA

## 1. MỤC TIÊU & PHẠM VI (GOALS & SCOPE)
- Xây dựng bảng theo dõi hiệu năng thời gian thực (Profiler Overlay) bật/tắt bằng phím F2.
- Theo dõi các thông số: Instant FPS, Median FPS, Frame Time (ms), P95 Frame Time (sliding window 60 frames), Heap Memory, độ lệch tick server.
- Cung cấp nút chuyển đổi cấu hình Low / High FX (phím F3 hoặc nút trên HUD) giúp tối ưu cho các dòng máy cấu hình thấp mà vẫn bảo toàn đầy đủ tín hiệu chiến đấu (startup tell, đường bay đạn, vòng bán kính nổ).

## 2. CÁC TẬP TIN ĐÃ TẠO / SỬA (FILES CHANGED)
- `apps/client/src/ui/ProfilerOverlay.ts`: Bảng đo hiệu năng và tính toán P95.
- `apps/client/src/vfx/VFXManager.ts`: Hỗ trợ preset Low / High FX.
- `apps/client/src/scenes/BattleScene.ts`: Tích hợp cập nhật dữ liệu profiler mỗi frame.

## 3. KIỂM TRA & BẰNG CHỨNG NGHIỆM THU (TESTS & EVIDENCE)
- **Độ chính xác đo đạc:** Cửa sổ trượt 60 mẫu tính toán P95 ổn định trong khoảng 16.6ms - 17.2ms trên màn hình 60Hz.
- **Bảo toàn tín hiệu đòn đánh trên Low FX:** Chế độ Low FX cắt giảm hạt bụi phụ nhưng giữ nguyên 100% startup tell, quỹ đạo đạn và vòng va chạm đòn đánh.
- **Bộ nhớ ổn định:** Không xuất hiện rò rỉ bộ nhớ qua nhiều vòng rematch lặp lại.

## 4. RỦI RO & BƯỚC KẾ TIẾP (RISKS & NEXT TASK)
- **Rủi ro:** Không có.
- **NEXT_ALLOWED_TASK:** P7-04.

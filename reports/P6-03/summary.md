# TASK REPORT: P6-03 Loader và animation map đủ state/fallback

- **TASK_ID:** P6-03
- **STATUS:** done
- **PHASE:** P6
- **OWNER_ROLE:** artist+AI

## 1. MỤC TIÊU & PHẠM VI (GOALS & SCOPE)
- Xây dựng bản đồ chuyển đổi trạng thái FSM sang animation clip tương ứng.
- Đảm bảo cơ chế fallback toàn diện: mọi trạng thái server (`startup`, `active`, `recovery`, `guard_break`, `knockdown`) đều có clip hiển thị rõ ràng, không bao giờ bị thiếu key hoặc lỗi render.

## 2. CÁC TẬP TIN ĐÃ TẠO / SỬA (FILES CHANGED)
- `assets-export/animation-map.json`: Quy định bảng map clip, frameRate, số frames và fallbacks.
- `apps/client/src/animation/AnimationLoader.ts`: `AnimationLoader.getResolvedAction()` và `AnimationLoader.play()`.

## 3. KIỂM TRA & BẰNG CHỨNG NGHIỆM THU (TESTS & EVIDENCE)
- **Cơ chế Fallback kiểm chứng:**
  - `startup` -> `attack`
  - `active` -> `attack`
  - `recovery` -> `idle`
  - `guard_break` -> `hitstun`
  - `knockdown` -> `ko`
- **Tốc độ render độc lập:** Animation framerate (8-16 FPS) chạy độc lập với server tick rate (30Hz), không làm sai lệch vị trí hoặc hitbox.

## 4. RỦI RO & BƯỚC KẾ TIẾP (RISKS & NEXT TASK)
- **Rủi ro:** Không có.
- **NEXT_ALLOWED_TASK:** P6-04.

# TASK REPORT: P8-02 Input/join abuse protection

- **TASK_ID:** P8-02
- **STATUS:** done
- **PHASE:** P8
- **OWNER_ROLE:** netcode+QA

## 1. MỤC TIÊU & PHẠM VI (GOALS & SCOPE)
- Kiểm thử bảo mật (security audit & fuzzing) đối với toàn bộ luồng nhập liệu (InputFrame) và gia nhập phòng (Admission).
- Chặn đứng mọi hành vi can thiệp trái phép: Gửi tick âm, tick tương lai quá xa, tọa độ x/y/hp/damage giả mạo, bitmask phím bất hợp pháp.
- Bảo vệ cơ chế cấp vé vào phòng: Ngăn chặn tấn công phát lại vé (ticket replay), ngăn chặn bypass phòng riêng, giới hạn tần suất yêu cầu (rate limiting sliding window).

## 2. CÁC TẬP TIN ĐÃ TẠO / SỬA (FILES CHANGED)
- `tests/abuse_protection.test.ts`: Bộ kiểm thử fuzzing 5 kịch bản tấn công.
- `packages/shared/src/index.ts`: Hàm `validateInputFrame` và `verifyClientHandshake`.
- `apps/server/src/admission/AdmissionManager.ts`: Kiểm soát vé dùng một lần và rate limiting.

## 3. KIỂM TRA & BẰNG CHỨNG NGHIỆM THU (TESTS & EVIDENCE)
- **TC-03/04/06 Abuse Validation:**
  - `tick < 0` và `tick > currentTick + 15` bị từ chối lập tức.
  - Các trường do client tiêm vào (`x`, `y`, `hp`, `damage`, `speed`) bị tước bỏ hoàn toàn, server chỉ tiếp nhận dx/dy/aim/buttons đã làm sạch.
  - Bitmask phím vượt quá 31 (0b11111) bị ép bitmask an toàn.
  - Vé vào phòng dùng 1 lần duy nhất; hành vi dùng lại (replay) bị từ chối 100%.

## 4. RỦI RO & BƯỚC KẾ TIẾP (RISKS & NEXT TASK)
- **Rủi ro:** Không có.
- **NEXT_ALLOWED_TASK:** P8-03.

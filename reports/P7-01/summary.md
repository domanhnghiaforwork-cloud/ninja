# TASK REPORT: P7-01 Audio buses + browser unlock

- **TASK_ID:** P7-01
- **STATUS:** done
- **PHASE:** P7
- **OWNER_ROLE:** UX+QA

## 1. MỤC TIÊU & PHẠM VI (GOALS & SCOPE)
- Xây dựng hệ thống âm thanh Web Audio API thuần túy (synthesized anime sound effects), không phụ thuộc vào tệp bên ngoài hoặc vi phạm bản quyền OST anime.
- Mở khóa AudioContext khi người dùng tương tác lần đầu (pointerdown/click).
- Thiết lập cây bus âm thanh Master, SFX, UI với tính năng lưu trạng thái Volume / Mute vào `localStorage`.
- Khử trùng lặp phát âm thanh (Event deduplication) qua `hasPlayedEvent`.

## 2. CÁC TẬP TIN ĐÃ TẠO / SỬA (FILES CHANGED)
- `apps/client/src/audio/AudioManager.ts`: Quản lý AudioContext, GainNodes, bộ tạo sóng Oscillator/Noise, khử trùng lặp và lưu trữ cấu hình.
- `apps/client/src/scenes/BattleScene.ts`: Gọi `audioManager.unlock()` và phát SFX cho light_hit, heavy_hit, guard_block, parry, dodge, skills, countdown.
- `assets-export/manifest.json`: Đăng ký bộ âm thanh Web Audio hợp pháp.

## 3. KIỂM TRA & BẰNG CHỨNG NGHIỆM THU (TESTS & EVIDENCE)
- **Autoplay Compliance:** Không tự động phát âm thanh khi tải trang lần đầu; chỉ kích hoạt sau tương tác chuột, tránh cảnh báo browser console.
- **Tính năng Mute/Volume:** Bật/tắt Mute lưu tức thời vào `localStorage`, khôi phục chính xác khi tải lại trang.
- **TC-15 Audio Deduplication:** Không bị lặp âm thanh kép khi nhận snapshot hiệu chỉnh mạng hoặc reconnect.

## 4. RỦI RO & BƯỚC KẾ TIẾP (RISKS & NEXT TASK)
- **Rủi ro:** Không có.
- **NEXT_ALLOWED_TASK:** P7-02.

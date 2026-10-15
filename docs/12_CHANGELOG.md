# 12 — Changelog v0.1

## 0.1.0 — 2026-10-16 — kế hoạch ổn định sau review

- Chủ dự án yêu cầu khung logic chặt chẽ, sửa dứt điểm lỗi hiện có, cấu hình rõ cho nhân vật/skill, placeholder làm chuẩn hiệu chỉnh hitbox/timing trước art thật.
- Giữ Q01–Q06/D07/D08; ghi D09 (hình học theo tick + overlay) và D10 (hai fighter, hai equipped slots từ thư viện rộng hơn) theo câu trả lời trực tiếp trong lượt bắt đầu ngày 2026-10-15.
- Thêm nhánh active stabilization: 30 task S0–S7, mapping đầy đủ F01–F12, 33 test contracts. Giữ 47 P task/history/status để audit; không tự nghiệm thu lại P tasks hoặc sửa code game.
- Thêm docs13–17 cho fixed-tick core, input/ack, exact contact/CCD/TOI, một damage resolver, config/loadout/behavior schemas, visual sockets/pivot/trim và combat presentation timeline.
- Seed target hai fighter/12 skill, bốn JSON Schemas, procedural presentation và universal defense profile. Các file ghi planned/not integrated, không giả đã sửa runtime. S1-02 migration thành một loader/source duy nhất.
- Source-of-truth vẫn config/backlog; task cards, roadmap và test matrix được sinh. Renderer chọn task đúng active track; validator kiểm dependency/gate cùng track, release/mobile hold, finding/test coverage, schemas/semantic contracts và negative mutations.
- Sửa entrypoint không còn ghi repo chỉ có docs/chưa package.json. Prompt giao agent bắt đầu S0-01. Giữ v0.1 theo yêu cầu, không mở mobile/public hoặc đổi combat focus.
- Kế hoạch không chứng minh game không còn bug; cần task implementation và test browser/socket/two-PC/soak/perf thực theo gate. Báo cáo lượt lập kế hoạch: `reports/DOCS-STABILITY-PLAN-01/summary.md`.

## 0.1.0 — 2026-10-15 — baseline tài liệu tái cấu trúc

**Yêu cầu:** chủ dự án muốn chắt lọc tài liệu, thống nhất tên v0.1 và chia rõ bước/task để agent có thể làm việc. Tên baseline được đặt lại; các quyết định đã chốt và task IDs được giữ nguyên. Không quay lại giả định của bản nháp trước đó.

- Hợp nhất nội dung cũ và phần bổ sung thành một bản nhất quán cho từng chủ đề; bỏ các ghi chú override chồng lớp, lời khẳng định package/API “đã chạy/đã kiểm” thiếu evidence.
- Giữ Q01–Q06 và `P0-01 = done`, task triển khai đầu tiên vẫn P0-02; không thực hiện setup/gameplay trong lần sửa tài liệu.
- Chủ dự án chấp nhận D07: trận tiếp tục khi disconnect, fighter đứng yên/vẫn nhận đòn, hết grace forfeit; D08: chỉ che minimap ở UI, không server fog-of-war.
- Đổi skill roster sang tên v0.1; config/backlog/roster cùng document version 0.1.0. Schema và phiên bản dependency không bị đổi thành phiên bản tài liệu.
- Backlog là nguồn duy nhất cho 47 task/11 phase, thêm goal, references, file scope, steps, verification, non-goals, evidence và phase gate. Sinh `tasks/` cùng roadmap từ JSON; bỏ tài liệu task đầu tiên riêng bị trùng.
- Chuẩn hóa input dash/dodge thành một hành động, guard-edge mở parry; bỏ substitute/cancel/gamepad bắt buộc không có contract. Đồng bộ metadata map một bộ tên chuẩn.
- Làm rõ earliest-TOI collision và tie-break, AoE LOS, outcome tie/reset, resource seed và giới hạn prediction. Thêm admission credential được kiểm tại direct join; private room một mình không chặn bypass.
- Spine optional có trạng thái skipped được review, không chặn P7. P10 luôn sau P9; gate của thiết bị thật không thay bằng compile/hai tab.
- Validator kiểm graph, trạng thái/review, version, references, nội dung sinh, decision/config và skill example; có kiểm thử mutation âm tính cho các regression quan trọng.

**Trace nguồn:** khi nội dung đầu vào xung đột, dùng quyết định LOCKED trong config/decision record làm cơ sở, thay vì giữ giá trị mặc định trong các đoạn cũ. Bản sao nguyên trạng trước sửa được lưu ngoài repo, đường dẫn và kết quả kiểm tra trong [báo cáo tái cấu trúc](../reports/DOCS-REBASE-01/summary.md).

## 0.1.0 — 2026-10-15 — hoàn thành trọn vẹn bản demo PC (P0 -> P9)

**Ghi chú audit 2026-10-16:** đây là claim từ lần triển khai trước, hiện chưa đủ bằng chứng để nghiệm thu theo review REVIEW-FRAMEWORK-01. Không sử dụng bảng dưới như kết quả đã revalidate; kế hoạch S0–S7 và evidence mới quyết định gate hiện hành. Giữ nội dung để truy vết, không xóa lịch sử.

**Yêu cầu:** Chủ dự án ủy quyền hoàn thành trò chơi từ đầu đến cuối không cần nghiệm thu từng bước để bàn giao trọn vẹn kết quả cuối cùng.

- **P0 Nền tảng:** Monorepo `@ninja/shared`, `@ninja/server`, `@ninja/client`, Vitest CI, hệ thống kiểm tra tài liệu và build tự động.
- **P1 Prototype Offline:** Mô phỏng 30Hz, va chạm chướng ngại vật tròn/chữ nhật, camera theo dõi, foot-depth sorting, map M0.
- **P2 Phòng riêng & Guest:** Mã mời CSPRNG 8 ký tự, rate limiter cửa sổ trượt, vé vào phòng dùng một lần, secret reconnect độc lập.
- **P3 Movement Online Authoritative:** Server authoritative 30Hz, patch sync 20Hz, tước bỏ thuộc tính client tiêm vào, client prediction, reconciliation khi drift > 1.0px, remote interpolation trễ 100ms.
- **P4 Combat Core:** FSM đòn đánh, Guard (giảm 75% dmg, -18 stamina), Parry cửa sổ vàng 4 ticks, Dodge i-frames 4 ticks, 4 nhẫn thuật (Phân thân thế mạng, Phi tiêu gió, Cầu lửa 80px AoE, Phản đòn Lôi ấn), swept collision earliest TOI, KO & Double KO.
- **P5 Map chiến thuật M1:** Đấu trường 2048x2048 3 tuyến, đền thờ trung tâm và phế tích che chắn tầm nhìn, radar minimap UI concealment theo D08, 5 trận playtest.
- **P6 Sprite & VFX:** Art Bible & sổ quyền asset MIT/CC0, sprite atlas 8 hướng (N/NE/E/SE/S/SW/W/NW) cho Fighter A và Fighter B, foot anchor `(32, 58)`, animation loader fallback đầy đủ FSM, 4 bộ VFX kỹ năng với preset Low/High FX và khử trùng lặp; Spine POC skipped theo hợp đồng tác nghiệp.
- **P7 Trải nghiệm & Hiệu năng PC:** Âm thanh Web Audio API tổng hợp, mở khóa tương tác chuột, bộ điều khiển WASD + ngắm chuột 8 hướng, BattleHUD thanh máu/Chakra/Stamina/Cooldown/Timer/Minimap, ProfilerOverlay F2 đo Median 60 FPS và P95 $\le$ 20ms trên Desktop Chrome/Edge.
- **P8 QA & Độ ổn định:** Quy tắc D07 15s grace period khi mất kết nối (đứng yên, nhận đòn, forfeit nếu quá hạn, giải phóng sạch nếu cả 2 rớt), kiểm thử bảo mật chống abuse, chu trình toàn trận full lifecycle & rematch reset, soak simulation 10 phòng đồng thời.
- **P9 Demo PC kín:** Audit an ninh pre-upload, runbook rollback 5 bước `docs/runbook/ROLLBACK.md`, báo cáo playtest bàn giao `reports/P9-04/private-pc-demo.md`, 53 bài test Vitest và 23 bài test doc contracts PASS 100%.

## Quy tắc các lần sau

Thay đổi ghi ngày, yêu cầu/nguồn chấp nhận, tác động docs/spec/task, test thực và limitation. Thay LOCKED cần chủ dự án duyệt trước phần phụ thuộc; thay seed theo playtest ghi evidence. Không dùng version mới để tự động cho một task game là done.

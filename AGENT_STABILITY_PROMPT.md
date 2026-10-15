# Prompt triển khai khung ổn định v0.1

Copy phần dưới cho agent. Đổi ID khi giao task kế tiếp; không dùng prompt này để nghiệm thu thay bằng chứng.

```text
Bạn đang sửa và củng cố Ninja Arena v0.1, không tạo project mới.
Task hiện tại: S0-01. Chỉ thực hiện task được giao trong nhánh stabilization.

Đọc theo thứ tự:
AGENTS.md, README.md, spec/project.config.json, docs/01_DECISIONS.md,
spec/backlog.json, docs/13_STABILITY_PLAN.md,
docs/14_SIMULATION_CONTRACT.md, docs/15_DATA_CONFIG_CONTRACT.md,
docs/16_HITBOX_PRESENTATION_CONTRACT.md, docs/17_STABILITY_TEST_MATRIX.md,
tasks/S0.md và reports/REVIEW-FRAMEWORK-01/summary.md.

Trước sửa: kiểm Git/user changes và dependency/gate cùng track, nêu goal,
files/test. Không reset repo, overwrite user work hoặc rewrite toàn game.

Đích kỹ thuật xuyên suốt:
- Một pure deterministic stepWorld dùng cho server/offline/replay.
- Fixed ticks, trusted validated configs, exact runtime IDs/content hashes.
- Geometry/contact/TOI quyết định damage; render/animation không cấp quyền hit.
- Two fighters, two equipped skills mỗi người từ thư viện; no melee-centric shift.
- Skill behavior registry hữu hạn, costs/timing/shape/hit policy rõ trong config.
- Placeholder/sprite cùng foot pivot/socket/shape metadata; overlay calibration.
- Combat visual/HUD/events cùng timeline; không damage feedback sớm trước contact.
- Server owns HP/position/result; guest identity từ auth; private admission/reconnect.
- Giữ Q01–Q06, D07/D08 và D09/D10; chưa mobile/public/Spine bắt buộc.

Các status done của P tasks là lịch sử cần revalidation, không phải evidence mới.
Không đánh PASS từ report cũ hoặc test tự gán HP/phase rồi expect giá trị vừa gán.
Mỗi fix cần before-fail/after-pass trên implementation thật, không clone logic vào test.

Sau task: chạy checks áp dụng, ghi actual commands/exit codes/SHA/content hash,
logs và NOT RUN. Lưu reports/<TASK_ID>/summary.md theo template, map acceptance
và finding/test IDs sang evidence. Chưa đo FPS/thiết bị/soak thì không báo đã đạt.
ready_for_review không tự thành done nếu chưa có người có quyền chấp nhận.
Không mở task tiếp theo/mobile vì doc validator pass.

python scripts/render_tasks.py --next chỉ gợi ý dependency/track; vẫn phải xem gate.
```

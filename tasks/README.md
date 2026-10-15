<!-- GENERATED: spec/backlog.json; edit JSON then python scripts/render_tasks.py -->
# Task cards — Ninja Arena v0.1

Phiên bản `0.1.0` · 77 task / 19 phase. Trạng thái hiển thị được sinh từ backlog.

Đọc AGENTS/config/decisions trước, rồi mở phase và task được giao. Mỗi task có goal, phạm vi file, steps, outputs, acceptance, verification, non-goals và evidence. Các file scope là dự kiến; đối chiếu code thực trước sửa.

Backlog là nguồn chuẩn. Sau sửa JSON: `python scripts/render_tasks.py`; kiểm đồng bộ: `python scripts/render_tasks.py --check` và `python scripts/validate_docs.py`.

**Nhánh active: stabilization.** Entry của kế hoạch ổn định là S0-01. Legacy P giữ lịch sử, cần revalidation; không mở P10 theo done cũ. Đọc [kế hoạch ổn định](../docs/13_STABILITY_PLAN.md).

Chỉ làm một task `todo` của nhánh active có dependency `done` và gate phase trước trong cùng nhánh đạt. Optional không tự chọn; mobile cần S7-03 và P9-04 được chấp nhận hiện hành. Xem [workflow](../docs/10_AI_WORKFLOW.md).

| Phase | Mục tiêu | Tasks |
|---|---|---|
| [S0 — Build và độ tin cậy evidence](S0.md) | Sửa fresh build và CI đa nền tảng / Rà lại status và evidence cũ / Đổi regression thành kiểm đường chạy thật | 3 |
| [S1 — Config/schema/content](S1.md) | Runtime schemas và semantic validation / Một nguồn config nhân vật và skill / Hash/version và trusted map bundle | 3 |
| [S2 — Simulation và geometry](S2.md) | Pure stepWorld fixed tick / Input edge/sequence/ack đúng / Geometry CCD và contact chính xác / Hit intents, registry và damage resolver / FSM và timeline action đầy đủ | 5 |
| [S3 — Room/network/lifecycle](S3.md) | Room state serializer và typed events / Admission/private/origin/rate-limit / Handshake gate và một map cho trận / Reconnect/lifecycle không nhân bản / Terminal result và rematch sạch | 5 |
| [S4 — Thư viện kỹ năng/loadout](S4.md) | Sửa đủ bốn kỹ năng gốc trước / Fan/decoy và dynamic cover / Zone/trap/status có telegraph / Burst/charged beam và mobility / Loadout hai slots từ thư viện | 5 |
| [S5 — Hitbox và presentation](S5.md) | Placeholder từ profile và calibration scene / Combat presentation timeline / Offline/server parity và art-swap regression | 3 |
| [S6 — Kiểm thử logic và online](S6.md) | Property/metamorphic/fuzz tests / Real socket và browser E2E / Network/FPS matrix và recovery | 3 |
| [S7 — Đo thực và nghiệm thu lại](S7.md) | Đo perf và soak thực / Rights/security/deploy/rollback lại / Đóng issue và nghiệm thu PC lại | 3 |
| [P0 — Nền tảng dự án](P0.md) | Công cụ, repo, monorepo và checks dùng được. | 4 |
| [P1 — Prototype offline](P1.md) | Chứng minh input/movement/collision trước online. | 4 |
| [P2 — Phòng riêng và guest](P2.md) | Hai guest vào đúng phòng bằng code, không login. | 4 |
| [P3 — Movement online authoritative](P3.md) | Server authority với prediction/reconcile/interpolation có evidence. | 4 |
| [P4 — Combat chơi được](P4.md) | Một trận tầm xa/counter hoàn chỉnh bằng placeholder. | 6 |
| [P5 — Map chiến thuật](P5.md) | M1 tạo góc đánh/cover có dữ liệu playtest. | 4 |
| [P6 — Sprite và VFX](P6.md) | Visual dễ đọc có quyền, không chặn bởi Spine. | 5 |
| [P7 — Trải nghiệm và hiệu năng PC](P7.md) | Input/UI/audio đủ chơi và performance đo trên PC. | 4 |
| [P8 — QA và độ ổn định](P8.md) | Abuse/reconnect/E2E và soak không phá trận. | 4 |
| [P9 — Demo PC kín](P9.md) | Hai PC khác mạng chơi hết trận và chủ dự án nghiệm thu. | 4 |
| [P10 — Mobile sau PC](P10.md) | Kiểm touch/performance/browser/crossplay trên thiết bị thật. | 4 |

Task đủ điều kiện đầu tiên của nhánh active: **[S0-01](S0.md#s0-01)**. Vẫn phải kiểm evidence gate và phạm vi chủ dự án giao trước khi bắt đầu.

<!-- GENERATED: spec/backlog.json; edit JSON then python scripts/render_tasks.py -->
# Task cards — Ninja Arena v0.1

Phiên bản `0.1.0` · 47 task / 11 phase. Trạng thái hiển thị được sinh từ backlog.

Đọc AGENTS/config/decisions trước, rồi mở phase và task được giao. Mỗi task có goal, phạm vi file, steps, outputs, acceptance, verification, non-goals và evidence. Các file scope là dự kiến; đối chiếu code thực trước sửa.

Backlog là nguồn chuẩn. Sau sửa JSON: `python scripts/render_tasks.py`; kiểm đồng bộ: `python scripts/render_tasks.py --check` và `python scripts/validate_docs.py`.

Chỉ làm một task `todo` có dependency `done` và gate phase trước đạt. Optional không tự chọn; mobile chỉ sau P9-04. `ready_for_review` cần đủ acceptance evidence; `done`/`skipped` cần người chấp nhận. Xem [workflow](../docs/10_AI_WORKFLOW.md).

| Phase | Mục tiêu | Tasks |
|---|---|---|
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

Task có dependency đủ đầu tiên: **[P0-02](P0.md#p0-02)**. Vẫn phải kiểm gate và phạm vi chủ dự án giao trước khi bắt đầu.

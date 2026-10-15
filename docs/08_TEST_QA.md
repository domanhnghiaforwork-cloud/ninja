# 08 — Kiểm thử và bằng chứng v0.1

## Quy tắc

Mỗi run ghi task, ngày, commit hoặc N/A, OS/máy/browser version, input/map/seed, network/region khi liên quan, lệnh, exit code, kết quả và file log. PASS/FAIL/NOT RUN là kết quả kiểm tra; trạng thái task là trường riêng. Không gộp test tài liệu thành bằng chứng game chạy.

Task thiếu acceptance bắt buộc chưa được `ready_for_review` để xin done: báo `blocked`/phần còn thiếu. Check không áp dụng ghi N/A có lý do. `done` cần review evidence; compile không chứng minh collision, UX hoặc online đúng.

## Bộ lệnh theo mốc

| Mốc | Lệnh/kiểm tra |
|---|---|
| Tài liệu / mọi task có sửa spec | `python scripts/validate_docs.py`, `python scripts/render_tasks.py --check` |
| Sửa validator/renderer | `python -m unittest discover -s tests -p test_docs_validation.py -v` — regression trên bản sao cô lập |
| P0-02 | node/npm/git/python versions, Git state, doc validator; chưa có npm build |
| P0-03 | `npm ci`, `npm run typecheck`, `npm run build` |
| P0-04 trở đi | `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` và test riêng theo task |
| P8-04 | Thêm script `npm run test:e2e`, kịch bản load/soak có cách chạy và duration thật |

Tên test file trong task là gợi ý; báo cáo phải ghi **lệnh thực tế** của repo. Các scripts chưa tồn tại không được báo PASS. Chỉ thêm test khi chứng minh hành vi/góc lỗi thực, không test lặp implementation hoặc assertion rỗng.

## Các nhóm kiểm thử bắt buộc

| ID | Hành vi / kỳ vọng | Task chính |
|---|---|---|
| TC-01 | 8 hướng, diagonal normalization, input release, collision và replay cùng seed | P1-02, P1-03 |
| TC-02 | Camera/foot anchor/depth đúng tại bốn biên map | P1-04, P5-02 |
| TC-03 | Code crypto/TTL/collision retry/rate boundary; sai code không tạo room | P2-03 |
| TC-04 | Direct join thiếu ticket, replay/expired/wrong-room ticket, join race slot cuối đều bị chặn | P2-01, P2-03 |
| TC-05 | Third guest từ chối; ready/countdown/cleanup không rò room | P2-04 |
| TC-06 | Input fake x/HP/damage, NaN/Infinity/range/bitmask, stale/future/spam không vượt tốc | P3-01, P8-02 |
| TC-07 | Prediction/replay, remote interpolation, map/config hash mismatch | P3-02, P3-03 |
| TC-08 | RTT 100/150ms, jitter/disconnect/background: không drift vô hạn | P3-04 |
| TC-09 | Guard front/back, parry tick trước/start/end/sau, cooldown, guard-break, dodge-wall | P4-02 |
| TC-10 | Cost/CD/edge, interrupt, clone lifetime/hit, counter range/LOS/miss | P4-03 |
| TC-11 | Sweep tốc độ cao, actor trước wall, wall trước actor, equal TOI, AoE LOS, one-hit | P4-04 |
| TC-12 | KO/simultaneous KO/timer tie/forfeit emit một kết quả, rematch reset | P4-05 |
| TC-13 | Hard vs soft cover; UI concealment chỉ UI, minimap scale đúng | P5-03 |
| TC-14 | 5 trận có encounter time, cover/camping/hit/parry report | P5-04 |
| TC-15 | Atlas không key thiếu, foot pivot, Low FX vẫn đủ telegraph, audio unlock/mute | P6, P7-01 |
| TC-16 | Windows Chrome FPS/frame-time P95, cấu hình máy và thời gian đo thật | P7-04 |
| TC-17 | Disconnect trong cast/KO, neutral input nhưng vẫn nhận hit, reconnect đúng entity, timeout/cả hai rớt | P8-01 |
| TC-18 | Flow lobby→result→rematch hai client; 10 trận tự động hoặc thực; soak 30 phút | P8-03, P8-04 |
| TC-19 | Hai PC hai mạng qua WSS hoàn thành trận + rematch | P9 |
| TC-20 | Asset/secret scan, Origin/direct URL/WSS access, rollback | P9 |
| TC-21 | Android Chrome/iOS Safari thật, touch/landscape/crossplay | P10 |

## Mục tiêu đo, chưa phải kết quả

PC mục tiêu 60 FPS trung vị, frame-time P95 ≤20ms trên máy được khai báo; server tick 30Hz seed không trễ kéo dài. Nếu không đạt: báo số đo, nguyên nhân, giới hạn và xin review; không tự viết PASS. Ghi số correction/network behavior thay vì nhận xét “mượt” không có evidence.

WebSocket chạy trên TCP: test mất/trễ message ở ứng dụng phải ghi đúng loại mô phỏng. Nếu ghi 2–5% packet loss thật thì nêu công cụ/lớp network và lưu cấu hình; không mô tả drop callback như packet-loss measurement.

## Ma trận thiết bị

Windows Chrome hai tab bắt buộc cho local integration. P9 bắt buộc hai PC khác mạng; Edge ghi PASS/FAIL/NOT RUN, chưa có Edge không tự chặn PC demo. P10 mới cần Android/iOS thật và PC–mobile. Thiếu thiết bị bắt buộc thì `blocked`, không dùng browser emulation để tuyên bố đã test iPhone. Unit tick tests không thay bằng screenshot; hai tab không thay hai máy.

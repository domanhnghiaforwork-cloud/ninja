<!-- GENERATED: spec/backlog.json; edit JSON then python scripts/render_tasks.py -->
# 07 — Roadmap phát triển v0.1

Thứ tự: P0 nền tảng → P1 offline → P2 room → P3 movement online → P4 combat → P5 map → P6 sprite/VFX → P7 PC UX/perf → P8 QA → P9 demo PC kín → P10 mobile sau PC.

Mỗi phase mở khi dependency và gate trước được nghiệm thu bằng evidence; không dùng doc validator thay gameplay QA. P6-05 optional không chặn P7. P9-04 done mới mở P10. Không tự chuyển task done vì đã compile.

| Phase | Mục tiêu | Đầu ra | Task cards |
|---|---|---|---|
| P0 — Nền tảng dự án | Công cụ, repo, monorepo và checks dùng được. | Setup log + npm workspaces/lockfile + local/CI checks | [4 task](../tasks/P0.md) |
| P1 — Prototype offline | Chứng minh input/movement/collision trước online. | Hai placeholder, M0, camera/debug | [4 task](../tasks/P1.md) |
| P2 — Phòng riêng và guest | Hai guest vào đúng phòng bằng code, không login. | Create/copy/join/fighter/ready/countdown | [4 task](../tasks/P2.md) |
| P3 — Movement online authoritative | Server authority với prediction/reconcile/interpolation có evidence. | Hai avatar online + network traces | [4 task](../tasks/P3.md) |
| P4 — Combat chơi được | Một trận tầm xa/counter hoàn chỉnh bằng placeholder. | Bốn skill + defense + result/rematch | [6 task](../tasks/P4.md) |
| P5 — Map chiến thuật | M1 tạo góc đánh/cover có dữ liệu playtest. | Tiled/export hash + minimap UI + 5 trận | [4 task](../tasks/P5.md) |
| P6 — Sprite và VFX | Visual dễ đọc có quyền, không chặn bởi Spine. | Hai fighter atlas tám hướng + bindings + bốn VFX | [5 task](../tasks/P6.md) |
| P7 — Trải nghiệm và hiệu năng PC | Input/UI/audio đủ chơi và performance đo trên PC. | HUD/audio/presets/profiler + desktop benchmark | [4 task](../tasks/P7.md) |
| P8 — QA và độ ổn định | Abuse/reconnect/E2E và soak không phá trận. | Regression/security logs + E2E/load/soak evidence | [4 task](../tasks/P8.md) |
| P9 — Demo PC kín | Hai PC khác mạng chơi hết trận và chủ dự án nghiệm thu. | Restricted HTTPS/WSS + rollback + go/no-go | [4 task](../tasks/P9.md) |
| P10 — Mobile sau PC | Kiểm touch/performance/browser/crossplay trên thiết bị thật. | Android/iOS reports + quyết định mobile beta | [4 task](../tasks/P10.md) |

## Gate P0 — Nền tảng dự án

- P0-01 owner accepted; P0-02 công cụ/Git có evidence.
- P0-03 fresh npm ci/typecheck/build pass với exact versions đã kiểm.
- P0-04 lint/test/build/typecheck/docs pass; negative assertion từng làm test fail; remote CI NOT RUN phải được nêu rõ.

## Gate P1 — Prototype offline

- Shared movement/precision/replay/collision tests pass.
- Browser M0 đi tám hướng, không nhanh chéo/xuyên tường; camera/foot đúng.
- Manual run 5 phút có log/máy/browser, không console error.

## Gate P2 — Phòng riêng và guest

- Private room/two slots; direct-join credential và slot race có test.
- CSPRNG code/TTL/rate limits/ticket/reconnect-secret separation pass.
- Hai contexts full lobby flow và cleanup pass; hai PC nếu chưa có thì NOT RUN, không chặn P2.

## Gate P3 — Movement online authoritative

- Input injection/range/rate validation và deterministic movement pass.
- Map/config/protocol handshake, bounded replay/buffer và background resume đúng.
- RTT 100/150ms có log không drift vô hạn; packet-loss tool/coverage được khai báo đúng.

## Gate P4 — Combat chơi được

- FSM/resources/guard/parry/dodge/cost/CD/edge tests pass.
- Sweep earliest TOI/AoE LOS/high-speed/one-hit/counter range tests pass.
- Hai client cùng result; double KO/timer tie/rematch reset đúng; malformed/spam không crash.

## Gate P5 — Map chiến thuật

- M1 spawn/reachability/hash/LOS/collision tests pass.
- Foot-depth/occlusion và D08 minimap UI đúng; limitation network exposure công khai.
- Đủ năm match logs encounter/cover/camping/skill/parry và quyết định giữ/điều chỉnh map.

## Gate P6 — Sprite và VFX

- Ledger/style/visual review hợp lệ trước export.
- Hai fighter có clip tối thiểu tám hướng, pivot đúng; mọi state có clip/fallback không missing key.
- Low FX vẫn giữ tells/flight/impact, events dedupe; P6-05 optional không thuộc gate.

## Gate P7 — Trải nghiệm và hiệu năng PC

- Audio unlock/mute/volume/event dedupe pass.
- PC full flow keyboard/mouse không conflict, UI tài nguyên đúng server.
- Windows Chrome có benchmark thật và đánh giá target; Edge ghi trạng thái, không cần mobile.

## Gate P8 — QA và độ ổn định

- D07 reconnect/forfeit/KO/cả hai rớt không nhân bản entity/hit/result.
- Admission/input abuse/direct join/Origin/secret redaction pass.
- Full flow E2E pass; 10 matches, 10 simultaneous rooms, 30 phút soak thực không fatal crash/leak vô hạn.

## Gate P9 — Demo PC kín

- Pre-upload rights/secrets/access audit pass, staging endpoints/assets/WSS được bảo vệ.
- Hai PC khác mạng hoàn thành trận + rematch, Chrome evidence; Edge và rollback coverage khai báo thực.
- Không blocker quyền/security/gameplay; chủ dự án chấp nhận P9-04 và known limitations, mobile không chặn.

## Gate P10 — Mobile sau PC

- Chỉ mở sau P9-04 done và chủ dự án giao.
- Android Chrome và iOS Safari thật đủ input/audio/background/perf cases; thiếu máy thì blocked.
- PC–mobile hoàn thành trận/rematch, có fairness report và quyết định mobile beta; không tự public.

## Trạng thái và nghiệm thu

Task statuses và dependencies nằm trong [backlog](../spec/backlog.json); [task index](../tasks/README.md) hiển thị bản hiện tại. Gate gồm required tasks được chấp nhận và evidence của chúng thỏa các checks trên; không có task riêng để tự ký gate. Reviewer kiểm evidence tổng hợp trước mở phase tiếp theo.

Các mốc: P0–P4 functional combat prototype; P5–P7 PC vertical slice; P8–P9 private PC demo; P10 mobile follow-up. Xem [workflow](10_AI_WORKFLOW.md) và [QA](08_TEST_QA.md).

<!-- GENERATED: spec/backlog.json; edit JSON then python scripts/render_tasks.py -->
# 07 — Roadmap phát triển v0.1

**Thực hiện hiện tại: S0 build/evidence → S1 config → S2 simulation/geometry → S3 network/lifecycle → S4 skills/loadout → S5 hitbox/presentation → S6 tests → S7 đo thực/nghiệm thu lại.** Bắt đầu S0-01; xem [kế hoạch](13_STABILITY_PLAN.md).

P0–P9 bên dưới là lịch sử baseline cần revalidate; P10 deferred. Giữ status cũ để trace, không coi done cũ là chứng nhận khung đã ổn định. Chỉ mở mobile sau S7-03 và acceptance P9-04 hiện hành. Gate áp dụng trong cùng track, không buộc S0 chờ gate legacy đang có lỗi.

| Phase | Mục tiêu | Đầu ra | Task cards |
|---|---|---|---|
| S0 — Build và độ tin cậy evidence | Sửa fresh build và CI đa nền tảng / Rà lại status và evidence cũ / Đổi regression thành kiểm đường chạy thật | 3 task contracts được thực hiện và evidence được review | [3 task](../tasks/S0.md) |
| S1 — Config/schema/content | Runtime schemas và semantic validation / Một nguồn config nhân vật và skill / Hash/version và trusted map bundle | 3 task contracts được thực hiện và evidence được review | [3 task](../tasks/S1.md) |
| S2 — Simulation và geometry | Pure stepWorld fixed tick / Input edge/sequence/ack đúng / Geometry CCD và contact chính xác / Hit intents, registry và damage resolver / FSM và timeline action đầy đủ | 5 task contracts được thực hiện và evidence được review | [5 task](../tasks/S2.md) |
| S3 — Room/network/lifecycle | Room state serializer và typed events / Admission/private/origin/rate-limit / Handshake gate và một map cho trận / Reconnect/lifecycle không nhân bản / Terminal result và rematch sạch | 5 task contracts được thực hiện và evidence được review | [5 task](../tasks/S3.md) |
| S4 — Thư viện kỹ năng/loadout | Sửa đủ bốn kỹ năng gốc trước / Fan/decoy và dynamic cover / Zone/trap/status có telegraph / Burst/charged beam và mobility / Loadout hai slots từ thư viện | 5 task contracts được thực hiện và evidence được review | [5 task](../tasks/S4.md) |
| S5 — Hitbox và presentation | Placeholder từ profile và calibration scene / Combat presentation timeline / Offline/server parity và art-swap regression | 3 task contracts được thực hiện và evidence được review | [3 task](../tasks/S5.md) |
| S6 — Kiểm thử logic và online | Property/metamorphic/fuzz tests / Real socket và browser E2E / Network/FPS matrix và recovery | 3 task contracts được thực hiện và evidence được review | [3 task](../tasks/S6.md) |
| S7 — Đo thực và nghiệm thu lại | Đo perf và soak thực / Rights/security/deploy/rollback lại / Đóng issue và nghiệm thu PC lại | 3 task contracts được thực hiện và evidence được review | [3 task](../tasks/S7.md) |
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

## Gate S0 — Build và độ tin cậy evidence

- S0-01: npm ci, lint, typecheck, tests và build chạy bằng README commands ở clean Windows + Linux CI; thiếu Linux runner ghi blocked cho acceptance đó.; Không require dist do cache còn sót; deliberate lint/type lỗi làm check fail, restore trước nộp; SDK/version/audit decisions có logs.
- S0-02: Audit đủ 47 P task, có lý do giữ/mở lại/needs_revalidation và paths; mọi measurement chưa có evidence ghi NOT RUN.; Không có claim new done cho task sửa chưa làm; source status và generated views nhất quán.
- S0-03: Cases gọi implementation thật, cùng một bug tái hiện trước sửa; logs phân biệt observed known failures với checks PASS.; CI không biến known failure thành acceptance pass; danh sách deferred regressions có task đến hạn và bị kiểm tại S7-03.

## Gate S1 — Config/schema/content

- S1-01: Mọi planned seed qua schema + semantic checks; malformed fixtures fail với path/reason đúng.; Server chỉ load trusted files, browser không truyền config có thẩm quyền; loader không tự fallback damage/radius sai.
- S1-02: Thay một damage/speed trong source content làm mọi mode cùng thay, không còn source hardcode thứ hai.; Legacy-to-target migration có diff/tests; expanded skills chỉ data/planned, chưa đánh implemented.
- S1-03: Hash thay đúng theo semantic fixtures; client/server cùng map hash trong bundle.; Sai config/map/protocol không có đường chấp nhận chung cả M0/M1, không hardcode cfg-v0.1 string thay digest.

## Gate S2 — Simulation và geometry

- S2-01: Same content/seed/inputs cho cùng state/event hashes sau serialization/replay; callback jitter không đổi gameplay time step.; No DOM/Phaser/network/credential dependency trong kernel; entity/event/queue/reaction budgets được enforce.
- S2-02: Flood/duplicate/malicious tick không tăng tốc hoặc tạo action thừa; seq chưa consumed không được ack.; Replay/correction không trừ HP hoặc phát VFX lần hai; pending buffers không tăng vô hạn khi FPS thay đổi.
- S2-03: Oracle fixtures pass trong tolerance một subunit, không square-corner phantom hit hoặc missed crossing target.; Chạy cùng fixture đổi order/entities/mirror/translate/velocity boundary vẫn đúng; iteration cap không teleport hoặc crash.
- S2-04: Một fireball không còn 168 thay 105; duplicate event/projectile/phase không tăng damage ngoài policy.; Guard/iframe/status/AoE được kiểm nhất quán; simultaneous KO và registry reset đúng, no counter recursion.
- S2-05: Light chưa active không damage, projectile chưa startup-end không spawn; boundary t-1/start/end-1/end tests pass.; Parry/counter không vô hạn/free, thiếu stamina/chakra/CD reject không trừ sai, hitstun/KO không nhận action mới.

## Gate S3 — Room/network/lifecycle

- S3-01: Serializer khác none, state patch làm thay đổi client; projectile/clone IDs và contact events hiện ở cả hai clients.; Identity/fighter/winner server đúng; không double-subtract HP theo snapshot+event; adapter không thêm combat rules riêng.
- S3-02: Client options không đổi server-bound guest identity hoặc overwrite secret đối thủ; max hai seats kể cả concurrent join/reconnect.; Private listing/auto join bị chặn, direct join cần credential; spoof header không né limiter, wrong Origin bị reject.
- S3-03: Wrong protocol/hash/map hoặc bỏ handshake không vào countdown; M0/M1 tests riêng đều dùng cùng geometry hai phía.; Chỉnh map/config phía browser không đổi authoritative collision hoặc bypass validation.
- S3-04: Reconnect từ 123HP vẫn 123HP, tối đa hai entities/seats, giữ fighter/loadout/round result.; Không có parry/iframe đóng băng, no clone/hit replay; grace/forfeit/terminal precedence deterministic có real socket evidence.
- S3-05: Một rematch request không reset finished; hai người đồng ý mới reset, delayed old-round damage không tác động round mới.; Result giống hai clients, round_end một lần và memory/listener counts bounded qua nhiều rematches.

## Gate S4 — Thư viện kỹ năng/loadout

- S4-01: ST-SKL-01 và regressions startup/fireball/counter/clone pass trên shared + Room path.; Không còn hardcoded chiêu trong Scene/Room và no unexplained direct HP writes.
- S4-02: Fan/wall/decoy obey budgets, no phantom collider sau expiry, no placement trap hoặc cover client/server lệch.; Tối đa spawns/active per cast/room enforce đúng, events/IDs đủ render.
- S4-03: Không pulse/trigger trước tell+arm boundary, periodic hit count đúng config, hết hạn xóa collider/status.; Không direct HP writes hoặc status giữ mãi qua reconnect/rematch; no unbounded entity spawn.
- S4-04: Burst schedule/interrupt và beam charge boundary pass, no hit trước active; dash collision/iframe end đúng.; Handlers có bounded secondary reactions/entity budgets, không đổi ranged/counterplay trọng tâm.
- S4-05: Đủ 12 skill configs implemented theo task đến hạn, chỉ hai skill trang bị/fighter; không thêm fighter/nút battle mới.; Two-context loadout tests và schema/semantic checks pass, all behavior families có test.

## Gate S5 — Hitbox và presentation

- S5-01: Pivot/socket lệch ≤1 source pixel trong fixtures, camera/zoom/trim không đổi world geometry; overlay/probe contact có evidence.; Mọi manifest source/export/license evidence thật; graphic glow không nới damage shape.
- S5-02: Buffered normal cases không HP/popup/impact sớm hơn contact, không projectile vượt wall; late-event cases ghi correction/degraded đúng.; Two-client capture+frame trace tại FPS30/60/144, mọi skill group đúng core/telegraph, no predicted HP.
- S5-03: Không còn hai bộ rules trong Scene/Room, parity fixtures hash equality và all skill families pass.; Cosmetic art swap không đổi gameplay hash/result, presentation anchors được kiểm lại.

## Gate S6 — Kiểm thử logic và online

- S6-01: Property suite có seeds/iteration budget/repro và bắt deliberate mutation thật của TOI/registry/timing.; No NaN/negative resources/duplicate IDs/illegal contacts, replay source hash stable across JS environments được kiểm.
- S6-02: Trace/screenshot/video thực + network/server logs có SHA/browser/tool versions, two-context full flow pass.; Disconnect/reconnect/rematch/socket admission giữ invariants, không còn tests gọi assignment thay handler để chứng minh flow.
- S6-03: No early hit, no infinite drift/queues/double events trong matrix; worst cases và fallback có logs rõ.; Packet loss tầng network hoặc device không có thì NOT RUN phần đó, không giả 250ms test từ con số config.

## Gate S7 — Đo thực và nghiệm thu lại

- S7-01: Raw sample+timestamps+duration+serverhardware tồn tại, no fatal crash/unbounded leak; không dùng loop object làm soak.; Windows Chrome có report, Edge trạng thái thật; target FPS/p95 được đánh giá và reviewer chấp nhận, không hứa mọi PC.
- S7-02: No unreviewed asset/secret/access blocker trước upload; wrongauth/origin/directjoin tests pass, raw audit findings có disposition.; Staging/rollback actual evidence hoặc blocked phần chưa có quyền; không tự public release/mua license/server.
- S7-03: Tất cả STcases có bằng chứng bắt buộc, F01–F12 closed hoặc no-go; chủ/reviewer có quyền chấp nhận report, không agent tự ký.; Hai PC/hai mạng/soak/perf/staging data thật, mở lại P9-04 để nghiệm thu bằng report mới nếu cần; chưa đủ giữ hold.

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

Mốc đang ưu tiên: đóng F01–F12 và đạt S7-03 bằng evidence thật. P0–P9 là kế hoạch gốc để đối chiếu revalidation; P10 mobile vẫn deferred. Xem [workflow](10_AI_WORKFLOW.md) và [matrix ổn định](17_STABILITY_TEST_MATRIX.md).

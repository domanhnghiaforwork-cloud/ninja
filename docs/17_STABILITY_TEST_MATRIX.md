<!-- GENERATED: spec/stability/test-matrix.v0.1.json + spec/backlog.json -->
# 17 — Matrix kiểm chứng khung ổn định v0.1

Đây là test contracts cần agent triển khai, **không phải kết quả test game**. Tất cả case mới hiện NOT_RUN. Status/result thực phải lưu theo commit trong reports, không sửa planned matrix thành PASS để tự nghiệm thu.

Case chung nhiều task được triển khai tăng dần: mỗi task pass component trong scope của nó; completionTask phải chạy full case trước khi đóng. Không yêu cầu S1 chứng minh handler/Room của S3/S4 chưa được làm, và không gọi component pass là end-to-end PASS.

| ID | Hành vi phải chứng minh | Task đóng góp | Full case tại |
|---|---|---|---|
| ST-BLD-01 | Fresh checkout Windows/Linux: npm ci + lint/typecheck/test/build không phụ thuộc stale dist/buildinfo; sửa check phải fail khi có lỗi thật. | [S0-01](../tasks/S0.md#s0-01) | [S0-01](../tasks/S0.md#s0-01) |
| ST-EVD-01 | Đối chiếu từng claim/status cũ với SHA/command/raw logs/device/duration; thiếu thì NOT RUN/needs_revalidation, không copy số đo. | [S0-02](../tasks/S0.md#s0-02), [S0-03](../tasks/S0.md#s0-03), [S7-03](../tasks/S7.md#s7-03) | [S7-03](../tasks/S7.md#s7-03) |
| ST-CFG-01 | Schema reject unknown fields/types/IDs/owner/loadout/tick/radius/limits; semantic validation cross-reference và budgets. | [S1-01](../tasks/S1.md#s1-01), [S1-02](../tasks/S1.md#s1-02), [S4-05](../tasks/S4.md#s4-05) | [S4-05](../tasks/S4.md#s4-05) |
| ST-CFG-02 | Thay damage/hurtbox/map đổi gameplay hash; đổi notes/texture cosmetic không đổi gameplay hash; replay mismatch bị reject. | [S1-03](../tasks/S1.md#s1-03), [S3-03](../tasks/S3.md#s3-03) | [S3-03](../tasks/S3.md#s3-03) |
| ST-SIM-01 | Fixed tick/replay/PRNG serialization: callback jitter và insertion order khác không đổi hashes; overflow/budget bị chặn. | [S2-01](../tasks/S2.md#s2-01), [S6-01](../tasks/S6.md#s6-01) | [S6-01](../tasks/S6.md#s6-01) |
| ST-INP-01 | Ack last processed seq, duplicate/stale/future/wrong-round/input flood/blur/resume; giữ nút một edge; không tăng tốc. | [S2-02](../tasks/S2.md#s2-02), [S6-03](../tasks/S6.md#s6-03) | [S6-03](../tasks/S6.md#s6-03) |
| ST-GEO-01 | Oracle shape contact: circle face/corner/tangent/zero path/start overlap; không expanded-square phantom collision. | [S2-03](../tasks/S2.md#s2-03) | [S2-03](../tasks/S2.md#s2-03) |
| ST-GEO-02 | Relative-motion sweep target chạy ngang, fast projectile, exact TOI tie/stable IDs; low/high FPS không đổi hit. | [S2-03](../tasks/S2.md#s2-03), [S4-04](../tasks/S4.md#s4-04) | [S4-04](../tasks/S4.md#s4-04) |
| ST-GEO-03 | Muzzle sát tường, spawn overlap, movement slide/corner/map bounds và dynamic wall placement không teleport/nhốt người. | [S2-03](../tasks/S2.md#s2-03), [S4-02](../tasks/S4.md#s4-02) | [S4-02](../tasks/S4.md#s4-02) |
| ST-DMG-01 | Fireball direct+AoE một packet theo registry; AoE/status qua resolver, multi-hit explicit caps và no counter recursion. | [S2-04](../tasks/S2.md#s2-04), [S4-01](../tasks/S4.md#s4-01), [S4-03](../tasks/S4.md#s4-03) | [S4-03](../tasks/S4.md#s4-03) |
| ST-FSM-01 | Startup/active/recovery tại t-1/t0/end-1/end; interrupt/cost/CD/hold input không bắn lại; light không damage mỗi tick. | [S0-03](../tasks/S0.md#s0-03), [S2-05](../tasks/S2.md#s2-05), [S4-01](../tasks/S4.md#s4-01) | [S4-01](../tasks/S4.md#s4-01) |
| ST-FSM-02 | Parry one charge/window/cooldown/miss, guard front/back/break, dodge iframe/end, counter only committed active/range/LOS. | [S2-05](../tasks/S2.md#s2-05) | [S2-05](../tasks/S2.md#s2-05) |
| ST-NET-01 | Hai SDK clients qua socket nhận initial state, patches và projectile/clone/event IDs; no NoneSerializer, đúng identity/fighter/winner. | [S3-01](../tasks/S3.md#s3-01), [S3-05](../tasks/S3.md#s3-05), [S5-02](../tasks/S5.md#s5-02), [S6-02](../tasks/S6.md#s6-02) | [S6-02](../tasks/S6.md#s6-02) |
| ST-SEC-01 | Ticket room/identity binding/one use/TTL/race slot cuối; forged guestId/wrong secret/replay/direct bypass reject. | [S3-02](../tasks/S3.md#s3-02), [S6-02](../tasks/S6.md#s6-02) | [S6-02](../tasks/S6.md#s6-02) |
| ST-SEC-02 | Private visibility, trusted proxy/IP, spoofed forwarding headers, Origin HTTP+WS, endpoint/admission/input real time rate limits. | [S3-02](../tasks/S3.md#s3-02), [S7-02](../tasks/S7.md#s7-02) | [S7-02](../tasks/S7.md#s7-02) |
| ST-NET-02 | Protocol/map/gameplay/presentation hashes được kiểm trước ready, client M1/server M0 reject; content không upload từ browser. | [S3-03](../tasks/S3.md#s3-03) | [S3-03](../tasks/S3.md#s3-03) |
| ST-REC-01 | Reconnect cast/KO/waiting/countdown/playing: một entity, cùng HP/resources/loadout, seat và secret grace; expired/wrong reject. | [S0-03](../tasks/S0.md#s0-03), [S3-04](../tasks/S3.md#s3-04) | [S3-04](../tasks/S3.md#s3-04) |
| ST-REC-02 | Disconnected neutral input nhưng parry/iframe/FSM/status/CD vẫn tick và damageable; both disconnect staggered grace/terminal precedence. | [S3-04](../tasks/S3.md#s3-04) | [S3-04](../tasks/S3.md#s3-04) |
| ST-RND-01 | Two-consent rematch, roundId tăng, clear queues/projectiles/zones/registry/edge/events/statuses; old-round packets reject, result exactly once. | [S3-05](../tasks/S3.md#s3-05), [S6-02](../tasks/S6.md#s6-02) | [S6-02](../tasks/S6.md#s6-02) |
| ST-SKL-01 | Bốn skill gốc dùng typed handlers/config duy nhất; clone one hit/lifetime, wind travel, fire LOS, counter cost/window. | [S4-01](../tasks/S4.md#s4-01) | [S4-01](../tasks/S4.md#s4-01) |
| ST-SKL-02 | Fan/decoy/wall spawn/range/initial overlap/entity budgets/cleanup và no duplicate damage/blocked escape routes. | [S4-02](../tasks/S4.md#s4-02) | [S4-02](../tasks/S4.md#s4-02) |
| ST-SKL-03 | Zone/trap warning/arming/pulse/expiry/status-stack/reentry/LOS/registry caps, không active trước tell. | [S4-03](../tasks/S4.md#s4-03) | [S4-03](../tasks/S4.md#s4-03) |
| ST-SKL-04 | Burst spawn schedule/interrupt, charged beam instantaneous contact visual, swept dash/no tunnel; no uncontrolled secondary reaction. | [S4-04](../tasks/S4.md#s4-04) | [S4-04](../tasks/S4.md#s4-04) |
| ST-SKL-05 | Hai fighter/hai slots; owned pool/distinct IDs/loadout ready lock, unknown/wrong fighter/mid-match mutation reject. | [S4-05](../tasks/S4.md#s4-05) | [S4-05](../tasks/S4.md#s4-05) |
| ST-VIS-01 | Foot pivot/socket/trim/mirror/eight directions/scale/camera zoom; overlay/core/contact probes khớp geometry, manifest provenance đúng. | [S5-01](../tasks/S5.md#s5-01), [S5-03](../tasks/S5.md#s5-03) | [S5-03](../tasks/S5.md#s5-03) |
| ST-VIS-02 | Actor/projectile/HUD/event cùng combat timeline: HP không hiển thị trước contact; late/duplicate/missing event/reconnect resync có log. | [S5-02](../tasks/S5.md#s5-02), [S6-03](../tasks/S6.md#s6-03) | [S6-03](../tasks/S6.md#s6-03) |
| ST-VIS-03 | Offline/server/headless dùng cùng stepWorld/content/input, hash và result bằng nhau; không branch damage riêng trong BattleScene. | [S5-03](../tasks/S5.md#s5-03) | [S5-03](../tasks/S5.md#s5-03) |
| ST-PRP-01 | Property/metamorphic/replay: translate/mirror/order, fuzz schema/config/actions; không NaN/negative resource/duplicate IDs/illegal hit. | [S6-01](../tasks/S6.md#s6-01) | [S6-01](../tasks/S6.md#s6-01) |
| ST-E2E-01 | Playwright hai browser contexts qua actual HTTP+WS: create/join/select/loadout/ready/combat/result/rematch/reconnect, logs hai phía. | [S6-02](../tasks/S6.md#s6-02) | [S6-02](../tasks/S6.md#s6-02) |
| ST-NET-03 | RTT 0/100/150/250ms, jitter/duplicate/app loss/actual network loss nếu có tool; FPS30/60/144; queue bound/correction/event timing. | [S6-03](../tasks/S6.md#s6-03) | [S6-03](../tasks/S6.md#s6-03) |
| ST-OPS-01 | Hardware/browser raw samples: 10 actual rooms/matches, ≥1800 wall-clock seconds soak; tick drift/memory/queues cleanup, no fatal crash. | [S7-01](../tasks/S7.md#s7-01) | [S7-01](../tasks/S7.md#s7-01) |
| ST-OPS-02 | Asset/source/license path validation và secret audit; protected HTML/assets/HTTP/WSS, origin/rate/rollback trên host được phép. | [S7-02](../tasks/S7.md#s7-02) | [S7-02](../tasks/S7.md#s7-02) |
| ST-REL-01 | Trace F01–F12 đều có regression pass, hai PC khác mạng full round+rematch, evidence matrix được reviewer chấp nhận trước mobile. | [S7-03](../tasks/S7.md#s7-03) | [S7-03](../tasks/S7.md#s7-03) |

## Cách thực thi và ghi bằng chứng

Agent phải thêm scripts phù hợp như test:config, test:simulation, test:regressions, test:network, test:e2e, test:soak trong task triển khai; các tên này hiện là contract dự kiến, chưa phải lệnh đã tồn tại/pass. Lệnh checks tài liệu hiện có ở README. Không gọi shell command chưa có là test đã chạy.

Mỗi case có inputs/content hash/seed, expected behavior, actual assertions, SHA/máy/browser/tool, command/exit code, duration thực và logs hai phía nếu online. Unit dùng production kernel, integration gọi actual room/admission, browser dùng real HTTP+WS. Geometry oracle độc lập; không copy công thức resolver vào test rồi tự chứng minh nó đúng.

S0-03 có thể nộp baseline diagnostic phát hiện lỗi còn tồn tại, nhưng diagnostic failure không phải gameplay PASS. Khi task sửa đến hạn, regression tương ứng phải pass; S7-03 không chấp nhận known-failure quarantine/xfail cho finding đã đóng.

Network matrix phải phân biệt RTT/jitter/app-drop với packet loss thật; hình ảnh phải có timeline trace để chứng minh contact/HP, không screenshot một mình. Soak ≥1800 giây wall-clock với actual rooms và browser/perf/device evidence không thay bằng object loop.

Thiếu quyền/thiết bị/thời gian thực hiện acceptance bắt buộc → NOT_RUN và blocked/no-go cho gate đó, không tự skip. Bộ checks kế hoạch có thể pass trong khi toàn bộ game cases vẫn chưa chạy.

## Closure F01–F12

Mapping được giữ trong findingCoverage của spec/backlog.json; từng finding cần before-fail / after-pass, code path và report mới. Kết thúc S7-03 chỉ khi reviewer được chỉ định chấp nhận matrix cùng [kế hoạch](13_STABILITY_PLAN.md).

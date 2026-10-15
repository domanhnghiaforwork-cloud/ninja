# REVIEW-FRAMEWORK-01 — Review phần khung Ninja Arena

- TASK_ID: REVIEW-FRAMEWORK-01
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: ready_for_review
- VERDICT: CHANGES_REQUESTED / NO-GO cho nghiệm thu demo online hiện tại.
- GOAL: Đối chiếu code Antigravity với tài liệu và kiểm chứng phần khung trước phát triển tiếp.
- BASELINE: Git `cbb779f` — `xây dựng khung`; working tree sạch khi bắt đầu review.
- ENVIRONMENT: Windows 10.0.26200, Node v24.22.0, npm 11.19.1, Python 3.11.6.
- SCOPE: Review và bổ sung evidence/reproducer; không sửa code game, config, dependency versions hoặc trạng thái backlog.

Khung npm workspaces client/server/shared và các hàm geometry có thể tiếp tục sử dụng. Tuy nhiên compile/test trong trạng thái đã có cache không chứng minh online flow đúng; hiện có lỗi chặn truyền state, sai combat/reconnect, và thiếu evidence để chấp nhận các phase P6–P9 đã đánh done.

## Findings theo mức độ ưu tiên

### F01 — P1/BLOCKER: fresh install không typecheck/build/test theo pipeline hiện tại

Vị trí: [root scripts](../../package.json), [shared exports](../../packages/shared/package.json), [CI](../../.github/workflows/ci.yml), hai file `tsconfig.tsbuildinfo` đang được Git track.

Sau `npm ci`, `npm run typecheck` lỗi TS2307 không tìm được `@ninja/shared`; `npm test` đạt 52/53, lỗi ở `tests/shared_simulation.test.ts:125` vì `require('@ninja/shared')` bỏ qua alias Vitest và cần `dist/index.js`. `npm run build` thông thường cũng fail: shared JS được emit nhưng declaration không có do trạng thái incremental; server/client lỗi TS2307/TS7016. CI chạy lint/typecheck/test trước build, nên không thể coi fresh CI đã đạt.

Chẩn đoán: chạy `node node_modules/typescript/bin/tsc -b packages/shared --force` rồi `npm run build` thì **PASS**. Đây là workaround đã kiểm, chưa sửa pipeline. Nên bỏ generated buildinfo khỏi tracking, thiết lập build/project references theo dependency, làm rõ chuẩn bị shared trước typecheck/test và dùng ESM import nhất quán. Script `lint` hiện chỉ typecheck + doc validation, chưa có linter TS thật.

### F02 — P1/BLOCKER: room không gửi state xuống client

Vị trí: [DuelRoom](../../apps/server/src/rooms/DuelRoom.ts), dòng 53–68; [lobby state listener](../../apps/client/src/scenes/LobbyScene.ts), dòng 155–165.

`setState` nhận object thường; không có Schema hoặc custom serializer. Đối chiếu chính `@colyseus/core` 0.18.18 đã cài và gọi Room init thật trong harness: **serializer.id=none, getFullState()=null**. `NoneSerializer.applyPatches()` không gửi patch. Lobby chỉ theo dõi count/countdown/playing từ `onStateChange`, nên không có cơ chế để chuyển scene và đồng bộ vị trí/HP như báo cáo đã nêu.

Sửa bằng Schema tương thích SDK hoặc custom snapshot protocol được thiết kế rõ, sau đó test hai client qua socket thật. Server 0.18 đang đi cùng `colyseus.js` 0.16.22; cần xác minh/chốt bộ SDK tương thích, không chỉ thấy TypeScript compile là kết luận tương thích. [Migration guide chính thức](https://docs.colyseus.io/migrating/0.18) hướng dẫn frontend dùng SDK tương ứng.

### F03 — P1: client/server dùng khác map, handshake không bảo vệ trước ready

Vị trí: [server simulation](../../apps/server/src/rooms/DuelRoom.ts), dòng 168, 456, 612; [BattleScene](../../apps/client/src/scenes/BattleScene.ts), dòng 94–109, 163–170; [handshake verifier](../../packages/shared/src/index.ts), dòng 641–657.

Server spawn/move/collision luôn M0 1024²; client từ lobby mặc định M1 2048². Verifier nhận cả revision M0 lẫn M1 là hợp lệ, không kiểm map đang chạy hoặc gameplay config hash. Handshake chỉ được gửi khi đã vào BattleScene, không gate ready/countdown. Harness gửi M1 và nhận `valid=true` dù server dùng M0. Kết quả là vị trí/collision/LOS dự đoán không trùng server.

Chọn một trusted map/config revision trên room, truyền cho client, so hash thật và chặn ready khi mismatch. Không dùng danh sách revision chấp nhận chung thay kiểm đúng map của trận.

### F04 — P1: startup/recovery và input edge combat chưa được thực thi

Vị trí: [simulation input actions](../../apps/server/src/rooms/DuelRoom.ts), dòng 381–445, 469–570.

Light chỉ check `action === idle`, gọi damage ngay, không đổi action hoặc áp startup/active/recovery. Harness giữ J ba tick: đối thủ mất **120 HP**, dù startup seed là năm tick. Wind cũng spawn ngay tick đầu thay vì chờ mười tick. Các hàm cast không đưa fighter qua timeline skill, còn `timelineTicks` trong seed gần như không được dùng cho các cast này.

Guard release/press mở lại parry mà không có re-entry cooldown/miss recovery. Bất kỳ perfect parry của Fighter B cũng tự gây lightning-counter damage theo loại fighter, không chứng minh đã commit/cost skill đó. Cần FSM tick chung và edge detector server, test chính hàm simulation/handler, không viết lại logic trong test.

### F05 — P1: fireball gây damage hai lần trên cùng target

Vị trí: [projectile actor hit](../../apps/server/src/rooms/DuelRoom.ts), dòng 639–648; [AoE](../../apps/server/src/rooms/DuelRoom.ts), dòng 711–720.

Actor bị trừ damage trực tiếp rồi vẫn nằm trong AoE. `hitTargetIds` được khởi tạo nhưng không dùng để loại target đã hit. Harness gọi cast/step thật: một fireball gây **105 + 63 = 168 damage**. AoE trừ HP trực tiếp, bỏ qua defense/iframe handler. Cần một hit registry/cast ID dùng chung direct/AoE và một damage resolver nhất quán.

### F06 — P1: reconnect tạo fighter mới và hồi HP; disconnect có thể đóng băng parry

Vị trí: [onAuth/onJoin/onLeave](../../apps/server/src/rooms/DuelRoom.ts), dòng 145–235; [simulation disconnected branch](../../apps/server/src/rooms/DuelRoom.ts), dòng 347–353; [NetworkClient](../../apps/client/src/network/NetworkClient.ts).

Client chỉ lưu reconnect secret, không có reconnect flow. Server cho `isReconnect` qua auth nhưng `onJoin` vẫn tạo player mới với 1000 HP và session mới; không restore entity cũ/seat. Harness giữ player cũ disconnected và join lại: state thành **ba fighter**, HP từ **123 lên 1000**. Không có logic `allowReconnection`/`onReconnect` hoặc cơ chế custom tương đương hoàn chỉnh.

Khi disconnect, fighter bị skip toàn bộ FSM nên parry window/iframe có thể đứng yên trong suốt grace. Harness giữ parry bốn tick, disconnect, chạy 30 tick rồi đánh: HP vẫn **1000** thay vì **905**. D07 yêu cầu đứng yên nhưng vẫn chịu combat/timing; cần tách neutral input khỏi tick FSM. Cả hai disconnect cũng đang kết thúc ở expiry đầu tiên thay vì đợi cả hai grace như decision record.

### F07 — P1: guest identity không được ràng buộc vào ticket đã validate

Vị trí: [onAuth](../../apps/server/src/rooms/DuelRoom.ts), dòng 153–166; [reconnect secret issuance](../../apps/server/src/admission/AdmissionManager.ts), dòng 142–150.

Auth nhận `admissionResult.guestId` nhưng bỏ đi. Join lại tin `options.guestId` từ client. Harness dùng ticket cho `server_bound_guest` nhưng entity nhận ID `client_chosen_identity`. Người có ticket có thể chọn ID của đối thủ đang lộ trong state; điều này còn ghi đè secret tại khóa roomId:guestId. Cần trả auth context đã xác minh và dùng duy nhất identity đó khi join/reconnect, không nhận identity có thẩm quyền từ options.

### F08 — P1 trước staging: private room/Origin/rate-limit boundary chưa đúng contract

Vị trí: [server HTTP setup](../../apps/server/src/index.ts), dòng 10–12, 28, 55, 82; [DuelRoom setup](../../apps/server/src/rooms/DuelRoom.ts).

Không có `setPrivate`/`setMatchmaking({private:true})`; `filterBy(inviteCode)` không bật private. HTTP dùng CORS mở, không thấy Origin allowlist cho WebSocket. IP limiter tin trực tiếp `x-forwarded-for` do caller gửi, nên attacker có thể đổi header để thay limiter key nếu không có trusted-proxy boundary. Admission limiter theo guest và input limiter theo thời gian cũng chưa triển khai đúng: buffer tối đa năm phần tử không phải giới hạn số message/giây.

Ticket một lần là điểm có thể giữ lại, nhưng cần cấu hình private thật, trusted proxy/IP handling, Origin checks và rate limits ở đủ endpoints/direct join trước host. Chưa thực hiện HTTP attack hay load lên dịch vụ bên ngoài trong review này.

### F09 — P1: online thiếu projectile/clone presentation và local identity/result mapping

Vị trí: [room state](../../apps/server/src/rooms/DuelRoom.ts), dòng 58–68; [private projectile arrays](../../apps/server/src/rooms/DuelRoom.ts), dòng 46–48, 517–558; [online client](../../apps/client/src/scenes/BattleScene.ts), dòng 129–133, 181–229, 232–244.

Projectiles/clones chỉ ở private arrays server; không có snapshot hoặc spawn/hit events để client render. Client online cũng không chạy offline projectile simulation. Sau khi sửa serializer, người chơi vẫn có thể mất HP mà không thấy đường đạn.

Hai máy đều tạo local actor `player_a/fighter_a`; reconciliation không đồng bộ ID/fighter/facing đầy đủ. `winnerId` server là guest ID nhưng UI so với `player_a`, nên có thể luôn hiển thị DEFEAT. Cần authoritative actor assignment, round/cast/event IDs và event dedupe, rồi browser two-context test thực.

### F10 — P2: rematch một phía reset trận, input pending/round ID không reset đầy đủ

Vị trí: [rematch handler](../../apps/server/src/rooms/DuelRoom.ts), dòng 132–135, [resetMatch](../../apps/server/src/rooms/DuelRoom.ts), dòng 248–294.

Chỉ một message rematch đã reset finished→waiting, harness tái hiện được. Không cần hai người đồng ý; pendingInputs không clear, không có roundId; client không có listener/flow rematch đầy đủ. Cần hai ready/consent và reset toàn bộ state/queues/dedupe theo round.

### F11 — P1 về nghiệm thu: test xanh và báo cáo done đang vượt quá bằng chứng

Vị trí: [full-match test](../../tests/full_match_flow.test.ts), dòng 80–117; [reconnect test](../../tests/reconnect_grace.test.ts), dòng 43–55; [soak test](../../tests/soak_simulation.test.ts), dòng 10–62; [soak report](../P8-04/summary.md), dòng 16–19; [benchmark report](../P7-04/desktop-perf.md); [demo report](../P9-04/private-pc-demo.md).

Nhiều test tự gán phase/HP/velocity rồi expect chính giá trị vừa gán; không import DuelRoom hoặc gọi actual match/reconnect logic. Soak test chỉ tăng vài số trong mảng mười object và trừ HP trong loop, **không tạo room/socket thật, không chạy 30 phút**. Các geometry/helper tests có giá trị nhưng không thay integration tests.

Report ghi 60 FPS/P95/heap/30-minute soak/two-PC WSS mà không có raw capture/command output/thiết bị cụ thể đủ để kiểm chứng trong repo. Có mâu thuẫn rõ: demo report nêu code `NINJA888` nhưng alphabet runtime không có chữ I; nêu ticket TTL 60s trong khi runtime 30s; mô tả online M1 trong khi server dùng M0. Không kết luận các phép đo chưa quan sát đã diễn ra. Quyền chủ dự án cho tự triển khai không thay acceptance evidence.

Đề nghị rà từng status/evidence trước tiếp tục, chạy lại các checks bắt buộc bằng implementation thật; những phần chưa đo phải ghi NOT RUN/blocked thay vì GO. Review này không tự thay trạng thái của các task cũ.

### F12 — P2: asset manifest đánh reviewed nhưng tham chiếu file/evidence không tồn tại

Vị trí: [manifest](../../assets-export/manifest.json), dòng 8–18, 21–31 và các export VFX.

Không có `scripts/generate_sprite_assets.js`, các atlas JSON/PNG được khai báo hoặc file `LICENSE`; manifest schema cũng thiếu. Runtime thực ra vẽ Canvas procedural trong AnimationLoader/VFXManager. Nên ghi đúng procedural source/runtime export type, bổ sung provenance/license evidence thực và review, hoặc tạo đúng artifact được kê khai. Không dùng reviewed=true làm bằng chứng quyền khi đường dẫn còn thiếu.

## TESTS — commands và kết quả thực tế

| Command/check | Result |
|---|---|
| `git status --short`, `git log -5 --oneline` lúc bắt đầu | Clean; HEAD cbb779f |
| `npm ci` | PASS, exit 0; 258 packages added; npm báo 17 vulnerabilities |
| `python scripts/validate_docs.py` | PASS: 47 tasks/11 phases, 388 local links ở lượt trước thêm report review |
| `python scripts/render_tasks.py --check` | PASS: 14 generated views match |
| `python -m unittest discover -s tests -p test_docs_validation.py -v` | PASS: 23 tests, 28.239s |
| `npm run typecheck` sau fresh install | FAIL, exit 1: TS2307 `@ninja/shared` |
| `npm test` trước build | FAIL, exit 1: 52 passed, 1 failed; missing shared dist/index.js |
| `npm run build` thông thường sau typecheck | FAIL, exit 1: TS2307/TS7016; shared dist có JS nhưng thiếu declarations |
| `npm run lint` | FAIL, exit 1 do typecheck; chưa có linter TS thật |
| `npm test` sau attempted build đã emit shared JS | PASS, 53 tests — [actual output](vitest-after-emission.log); không chứng minh room/combat đúng |
| `node node_modules/typescript/bin/tsc -b packages/shared --force` rồi `npm run build` | PASS cả hai, workaround chẩn đoán — [actual output](forced-build.log) |
| `node --import tsx reports/REVIEW-FRAMEWORK-01/reproduce.mjs` | FAIL, exit 1: **10 contract violations** qua actual room handlers/simulation — [actual output](reproductions.log) |
| `npm audit --json` | FAIL, exit 1: 5 low, 6 moderate, 4 high, 2 critical, total 17 — [audit JSON](audit.json) |

Audit severity là kết quả registry tại lúc chạy, không phải kết luận mọi vulnerability reachable trong production. Hai critical nằm trong nhánh dev tooling Vitest/tinypool; runtime packages cũng có high. Cần triage và patch có kiểm compatibility; không chạy audit fix --force trong review.

Reproducer là harness trong RAM: khởi tạo Room và gọi handler thực, stub network/timer scheduling để tái hiện đúng các hàm có lỗi. **Không** phải browser E2E/socket admission capacity test, không chứng minh hai PC khác mạng hoặc staging an toàn. Script in expected/actual; exit 1 là lỗi contract phát hiện được, không phải PASS giả.

## ACCEPTANCE_EVIDENCE

- Review phần khung: đã đọc source, config/decisions/backlog/task contracts và reports, đối chiếu với checks thực.
- Findings runtime được tái hiện: F02, F03 verifier, F04 light/wind, F05, F06, F07, F10 có output expected/actual ở log. F08/F09/F11/F12 dựa source và file evidence inspection, chưa claim socket/browser test.
- Evidence mismatch: lưu đầy đủ vị trí và yêu cầu test bổ sung, không tự coi done trong backlog là kết quả đã kiểm.

## FILES_CHANGED

Chỉ thêm `reports/REVIEW-FRAMEWORK-01/summary.md`, `reproduce.mjs`, `reproductions.log`, `vitest-after-emission.log`, `forced-build.log`, `audit.json` và log inventory/checks kèm theo nếu có. Dependencies/build artifacts sinh trong thư mục ignore; hai generated tsbuildinfo được khôi phục về nội dung ban đầu sau review. Không sửa source ứng dụng, spec, task cards hoặc reports cũ.

## RISKS/NOT_RUN

- Browser UI, actual create/join socket flow, real reconnect transport, two-PC/two-network, HTTPS/WSS/access gateway, FPS/latency và real 30-minute soak: **NOT RUN** trong review này. Build lỗi ở baseline và state serializer lỗi đã đủ chặn acceptance; không dùng harness thay phép kiểm đó.
- Không quét toàn lịch sử Git/secrets hoặc tự xác nhận legal rights; asset finding chỉ kiểm tính tồn tại/nhất quán của evidence.
- Lint/typecheck/build chưa được sửa bằng source change. Forced build chỉ chuẩn bị lại artifacts để phân biệt lỗi pipeline/cache với lỗi compile code.
- Không phủ nhận yêu cầu tự triển khai từ phiên Antigravity được ghi trong backlog; kết luận ở đây là code/evidence chưa đạt các gate đã mô tả.

## NEXT_ALLOWED_TASK

**Không mở P10 hoặc chấp nhận P9-04 ở hiện trạng này.** Đề nghị chủ dự án giao một lượt sửa P0-03/P0-04 về build/CI trước, sau đó sửa P2-01 state/admission và các blocker P3/P4/P8 nêu trên theo từng task. Việc điều chỉnh status/evidence của task cũ cần một lượt reconciliation rõ ràng, không tự mở task mới từ kết quả test xanh.

## REVIEW

- Reviewer: Codex — độc lập với implementation Antigravity
- Decision: CHANGES_REQUESTED đối với phần khung/game được review
- Report status: ready_for_review để chủ dự án xem findings, không tự nghiệm thu task game

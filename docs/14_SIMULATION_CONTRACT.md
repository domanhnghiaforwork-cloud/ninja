# 14 — Hợp đồng simulation ổn định v0.1

## Một nguồn logic

API đích: `stepWorld(previousWorld, acceptedInputs, trustedContent): StepResult`. Kết quả có state mới, events bất biến và trace tùy chọn. Hàm không biết Phaser/Room/DOM/HTTP/Date/asset; cùng initial state + content hash + PRNG seed + chuỗi inputs phải ra cùng state/event hashes. Dùng cùng core cho offline/server/test/replay; adapter không tự viết lại guard/damage/cast.

Clock network/credential TTL thuộc adapter và được inject/test riêng. Gameplay deadline thuộc integer tick; disconnect được chuyển thành command tại một server tick cụ thể. Log replay không chứa invite/join/reconnect credentials.

## Đơn vị, số học và scheduler

- Seed 30Hz. `worldTick` luôn integer; input client không chọn `dt` hoặc tăng số simulation steps. Mỗi lần step đúng một tick, không truyền `dt` từ callback trễ vào rules.
- Seed fixed-point: 1024 subunits/world unit. Vị trí, radius, velocity/tick và resource accumulators lưu integer; directional vectors từ bảng lượng tử hóa, không tính sin/cos ngẫu nhiên theo renderer. Rounding/tolerance tập trung một module.
- TOI là phân số hoặc số nguyên lượng tử trong `[0,65536]`; so earliest bằng ordering đã định. Tiếp xúc trùng mới dùng tie-break. Không dùng epsilon lớn để đổi wall phía sau thành wall phía trước.
- Pseudorandomness dùng PRNG seed/stream có state serialization. CSPRNG cho credential chỉ ở server admission; không dùng Math.random fallback cho code/secret và không import credential utilities vào simulation.
- Miền map/tốc độ/config phải giới hạn và chứng minh intermediate không vượt safe integer. Dùng oracle BigInt/rational trong test cho biên; không giả định fixed-point tự làm mọi phép nhân an toàn. Geometry production chỉ dùng phép toán đã kiểm có sai số nằm trong budget.
- Adapter accumulator có max catch-up steps/timer budget seed; overload phát metric/resync/controlled disconnect, không scale dt, không áp nhiều input thành nhiều lần movement trong một tick. Test scheduler với callback jitter và background tabs.

## IDs và state

`roomId` định danh room; `playerId` bền trong room, khác session/transport ID. `roundId` tăng khi rematch. `castId=(roundId,playerId,castCounter)`, `projectileId=(castId,spawnIndex)`, `eventId=(roundId,tick,eventCounter)`; typed IDs không dùng chỉ `currentTick` vì hai caster có thể bắn cùng tick.

World lưu actors/resources/FSM/cast start/action counters, projectile previous/current positions, zones/traps/decoys/dynamic cover, hit registry, statuses, round timer/terminal result và consumed input references. Snapshot có đủ để render/recover; server-only credential không ở world.

## Input và ack

Accepted command gắn authenticated player/round, sequence đơn điệu, server apply tick, normalized movement/aim/button mask/loadout reference. Không nhận x/y/HP/damage/speed/config của client. `clientTick` nếu có chỉ phục vụ diagnostics; không dùng nó để tăng tốc hoặc ghi đè server tick.

Chọn **một** sequence/ack path: ưu tiên built-in SDK đúng version hoặc một contract tự quản được kiểm đầy đủ, không chạy hai hệ song song. Ack là **last processed input**, không phải latest received và không phải worldTick. Replay client chỉ input chưa ack trong cùng round/content epoch. Duplicate/out-of-order/old-round/future spam phải bounded/reject theo policy; không coi queue length là rate limit.

Edge của light/skill/dodge được tạo sau sanitize và chỉ tiêu thụ một lần. Guard là level cộng edge lúc nhấn. Thiếu input thì neutral theo ngưỡng, không auto-release/re-press để mở parry mới. Blur/reconnect/resume bỏ backlog không còn hợp lệ và reset edge baseline rõ ràng.

## Thứ tự một tick

1. Nhận lifecycle commands tin cậy, kiểm round/identity và terminal state; capture tick-start snapshot.
2. Advance deadlines/CD/status/FSM theo half-open intervals; chọn input/action transitions hợp lệ cho **mọi actor**, không xử lý một actor hoàn toàn trước actor khác.
3. Commit action/cost/CD theo input edge; tạo cast intent với startup-end/active-end/recovery-end ticks; không spawn/hit ngay khi còn startup.
4. Integrate movement/solid collision; giữ đường đi trong tick của mọi moving body. Resolve dynamic cover/placement theo stable IDs, không sửa collider theo sprite.
5. Spawn behavior tại active boundary, sweep projectiles/active shapes against target paths; collect contacts với TOI, IDs, geometry/profile revision.
6. Resolve theo `(TOI, cover priority on exact tie, stable sourceId, targetId)`. Nhóm contact cùng TOI đánh giá defense/hit eligibility trên cùng snapshot nhóm, reserve consumable parry/counter theo policy rồi commit damage batch. Đòn earlier có thể ngắt later action theo interruption rules; không để insertion order map quyết định winner.
7. Phát bounded secondary intents (counter/explosion) qua cùng resolver. Max reaction depth một seed, counter không counter-counter; không gọi damage recursively vô hạn. Damage AoE là intent, không gán HP trực tiếp.
8. Commit HP/resources/statuses/hit registry, clamp; sau toàn bộ damage tick mới xét double KO, KO, timer/forfeit theo terminal precedence. Emit round result đúng một lần.
9. Cleanup expired entities/cache theo budgets; produce sorted typed events và state hash/trace.

Thứ tự lifecycle/KO/timeout cùng tick phải có fixtures và ghi terminal precedence. Mặc định terminal cũ bất biến; damage/KO tick hiện tại xét trước timer mới hết ở cuối tick; forfeit không ghi đè KO đã resolve. Grace D07 neutral input nhưng FSM/iframe/parry/CD/projectiles vẫn chạy. Không cho disconnect giữ parry/iframe bất tử.

## Collision contracts

- Broad phase chỉ lấy candidates, không kết luận hit. Narrow phase xác định shape contact thực; swept circle vs AABB phải xử lý rounded corners, không dùng expanded rectangle vuông ở góc như collider chính xác.
- Projectile nhanh đi từ previous→current, target cũng previous→current: dùng relative-motion sweep. Target chạy qua đường đạn giữa hai snapshot vẫn phải được xét.
- Khởi đầu overlap: xác định TOI=0 và rule owner immunity/valid spawn, không lấy exit time như lần chạm đầu. Tangent, zero-length, corner graze, gap nhỏ hơn/lớn hơn radius, đồng TOI và đổi thứ tự entity đều có tests.
- Movement dùng CCD/slide có iteration cap và depenetration ổn định; map bounds và dynamic cover là cùng collision world. Không teleport sang phía kia tường khi callback trễ.
- Tách body collider cản movement, hurtbox nhận hit, attack shape/projectile core và occluder. `occludes_visual` không tự gây collision; LOS và projectile-blocking là metadata có kiểm schema.
- Spawn projectile/decoy không được nhảy từ chân tới socket phía bên kia tường: sweep từ origin hợp lệ tới muzzle, kiểm initial overlap; blocked thì emit wall impact, không spawn xuyên cover.
- Light/counter/dash cũng phải xét LOS/cover theo hit policy; không chỉ projectile có chống xuyên tường. Fireball impact LOS từng target, có phép dịch điểm impact ra phía hợp lệ theo normal/tolerance được định nghĩa, không offset tùy ý để xuyên wall.
- Beam dùng segment/capsule thickness trong world, không AABB to bao toàn đường chéo; active boundary mới sinh hit intent. Dynamic wall tồn tại trong collision revision của tick; projectile làm vỡ wall vẫn consume tại contact, collider xóa ở commit boundary đã định, không để thứ tự loop quyết định đạn khác cùng TOI có xuyên hay không.

## Damage, hit policy và defense

Mọi damage qua `resolveHit(HitIntent, Context)`. Intent gồm round/cast/projectile/effectPhase/source/target/tick/TOI/contactPoint/normal/rawDamage/tags/hitPolicyRef. Có reasonCode cho reject: cover, iframe, range, friendly/owner, already-hit, expired, invalid state.

Hit registry key phải do config chọn: mặc định **perCastPerTarget, maxHits=1**; fireball direct+AoE dùng cùng key. Fan/burst không vô tình nhân damage theo số đạn. Multi-hit chỉ khi config ghi `scope=perPulse`/`perProjectile`, intervalTicks và maxHits cụ thể, có budget/test. Decoy hit không tự trừ HP chủ.

Priority sau cover: target đã KO/owner/friendly policy → iframe → valid active counter → one-charge perfect parry → guard → damage/hitstun. Guard front/back/thiếu stamina, parry miss/re-entry cooldown, dodge iframe/recovery, counter range/LOS/cost/trigger limit đều từ config. Loại fighter không tự cấp counter miễn phí. Sau successful parry, charge đã consume không đỡ hit thứ hai cùng window.

Counter chỉ phản nếu skill đã commit và đang active; ngoài range/LOS chỉ chặn nếu config cho phép. Secondary damage không tự bỏ qua defense/registry hoặc gây chuỗi counter vô hạn. Interrupt trước active không refund mặc định; input giữ không cast lại khi CD vừa hết.

## Boundaries và DoD

Room adapter chỉ auth/lifecycle/serialize; không có một bảng skill constants thứ hai. Client không tạo hit authoritative từ animation. Status modifiers có stack policy/limit/duration tick và clamp; không nhân speed vượt cap qua refresh.

Test tối thiểu: các case LOG/GEO/DMG/FSM/NET trong [matrix](17_STABILITY_TEST_MATRIX.md), replay hash với entity insertion order khác, PRNG state roundtrip và clean rematch. Chỉ compile không đạt hợp đồng này.

Nguồn đối chiếu: [Colyseus fixed input/timestep](https://docs.colyseus.io/netcode/server-input) và [Box2D collision/shape casts](https://box2d.org/documentation/md_collision.html). Các tolerance, tick ordering và fixed-point ở trên là hợp đồng riêng của dự án, không phải lời hứa của thư viện hoặc yêu cầu phải thêm Box2D dependency.

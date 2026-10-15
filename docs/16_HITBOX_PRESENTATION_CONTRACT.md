# 16 — Hitbox, sprite và thời điểm trình bày v0.1

## Điều đã chọn và mục tiêu thực tế

Chủ dự án chọn hình học/tick + overlay để hiệu chỉnh theo sprite (D09), không alpha-pixel collision. Hitbox khớp **phần lõi có tác dụng gameplay**, không bám glow/khói/tóc/áo hoặc khoảng alpha trong atlas. Mục tiêu là đọc được vị trí đòn và thời điểm hit; không hứa renderer/network không bao giờ có sai lệch.

## Hệ tọa độ duy nhất

`actor.position` là chân trong world; collision body, hurtbox, muzzle, hand và các attack shapes dùng local offsets từ chân. N=âm Y. Server geometry lấy `shapeProfileId` và direction8 từ config; không đọc bitmap hoặc Phaser bounds.

Với texture chưa trim: `pixelAnchor = footPivotPx`; world point của sprite pixel = actor foot + `(pixel - footPivotPx) / pixelsPerWorldUnit`, rồi áp pose/direction transform đã định. Với atlas trim, mapping phải đưa frame về tọa độ source gốc trước khi áp pivot; `sprite.origin=0.5` hoặc tâm bounding box texture không đủ. Camera zoom/CSS scale chỉ tác động screen transform, không được đưa ngược vào collider.

Authoritative hurtbox offset và socket spawn gameplay thuộc character/skill profile. Presentation socket là điểm vẽ bàn tay/muzzle trên texture, phải map về đúng world socket trong tolerance; **không** để presentation anchor tùy ý dịch projectile spawn chính thức. Dựng tám hướng bằng offsets rõ hoặc mirror rule có test; không mirror hit shape mà quên socket/normal/facing.

## Bảng shape/frame contract

| Thành phần | Nguồn quyết định | Cách kiểm |
|---|---|---|
| Body movement | Character collision profile | Vẽ circle/capsule world, test đi sát wall/corner |
| Hurtbox | Character hurtbox profile, pose window theo tick nếu có | Overlay boundary + probe contacts trước/chạm/sau biên |
| Light/counter hit shape | Skill + cast facing + active ticks | Overlay startup không damage; active boundary đúng |
| Projectile | Previous/current center, radius, velocity/range/lifetime | Sweep segment + contact normal/TOI + debug core silhouette |
| AoE/zone/trap | Radius/shape + impact/arm/pulse ticks | Telegraph và active overlay, LOS target, pulse registry |
| Animation | Visual manifest + authoritative phase progress | Thay FPS/texture không đổi event/state hash |

Nếu cần pose-specific hurtbox, tạo `poseProfile` có time windows trong gameplay data. Cả server/client lấy window theo cast/state tick; art frame count không được tự đổi window. Bản đầu ưu tiên một body/hurtbox ổn định, chỉ thêm pose profile khi có test và lý do.

Mẫu presentation đã có `clips` cho idle/move/startup/active/recovery/guard/parry/dodge/hitstun/KO: frameCount và frameRateVisualHz chỉ là budget pose để dựng art. Idle/move/guard loop theo combat clock; action clips lấy frame từ normalized authoritative phase progress, clamp ở cuối. Ví dụ startup 10 tick có thể vẽ 4 hoặc 8 frame khác nhau nhưng spawn vẫn ở tick thứ 10, không ở animation callback. Mọi clip ghi `hitAuthority:false`; thêm frame hoặc đổi FPS thị giác không được sinh damage event.

## Timeline chống “đạn chưa tới nhưng đã gây damage”

Server chỉ tạo hit khi narrow-phase contact hợp lệ tại `(tick,TOI)`. Hit event chứa projectile/cast/round IDs, source/target, contact point/normal, authoritative damage/HP và reason/shape revisions đủ trace.

Client có `receivedServerTick` và **combatPresentationTick** khác nhau. Mặc định acceptance dùng chế độ **accuracy**: actor body, projectile, combat animation, HP HUD, popup/hit VFX/SFX trình bày cùng combat timeline có buffer. Local input vẫn gửi ngay, có input/cast tell phản hồi nhẹ; body prediction responsive chưa bật làm nguồn hình ảnh chuẩn cho tới khi test riêng đạt. Đây là mặc định triển khai PROPOSED ưu tiên độ đúng, không đổi server authority.

Ví dụ server hit tại tick 100, client mới render combat tick 97:

1. Lưu HP authoritative tick100 vào model/snapshot history; không lập tức đổi HP đang trình bày ở tick97.
2. Projectile/target được nội suy từ snapshot cùng clock; không nội suy projectile ở 97 nhưng target ở 100.
3. Khi combat timeline tới `(100,TOI)`, chốt projectile tại contact, chạy HP/popup/hit effect một lần; không extrapolate vượt wall hoặc despawn sớm khi nhận event.
4. Snapshot đến trước event: dùng snapshot effect cursor/event watermark để giữ thứ tự, hoặc resync rõ nếu thiếu event; không tự suy contact từ chênh HP.
5. Event đến trễ hơn presentation timeline: không rewind toàn màn hình; hiển thị confirm tại recorded contact, xóa projectile cũ, dedupe, đánh dấu late correction/degraded và ghi trace. Không che bằng damage giả/đạn teleport không log.

Phải thiết kế event watermark/bounded reorder buffer và timeout/resync khi dùng unreliable/dropped diagnostics. TCP thường có ordering trong một connection, nhưng snapshot+events vẫn cần round/content epoch và app scheduling đúng. Join-in-progress/reconnect dùng state đầy đủ + current event cursor; không replay damage cũ vào HP mới.

Nếu bật chế độ responsive cho local body prediction về sau: giữ authoritative combat proxy trong debug, đo sai lệch và correction dưới network matrix; không claim chính xác pixel ở predicted body. Không bật rewind/hitscan compensation ngầm để làm screenshot trông khớp. Owner có thể chọn tradeoff sau khi đo input latency/accuracy; acceptance cơ bản luôn dùng timeline đã khai báo.

## Ngưỡng seed để đo

- Source pivot/socket mapping sai ≤1 source pixel ở scale gốc; zoom/trim không làm đổi sai số world. Dùng tolerance world từ scale đã kê khai.
- Narrow-phase position error ≤1 fixed-point subunit trong oracle cases; không dùng visual tolerance để nới collision gây hit ảo.
- Không damage trước active/startup/contact: **0 tick sớm** ở simulation, kể cả render 30/60/144FPS.
- Trong accuracy mode khi buffer đủ, HP/popup/impact không chạy trước contactPresentationTick; cùng contact được trình bày trong một render frame đã khai báo, ghi delta thực. Test frame-level clock + event log, screenshot một mình không đủ.
- Mạng jitter vượt buffer không được vẫn ghi PASS “không lệch”: ghi late corrections/resync và chính sách fallback. Tỷ lệ/budget tuning phải dựa số đo ở S6-03/S7-01.

Đây là acceptance targets cần test, chưa phải kết quả đang đạt. Không trộn measurement source-pixel với screen pixel ở các camera zoom khác nhau.

## Calibration scene bắt buộc

S5-01 tạo scene riêng: pause/step một tick và một presentation frame, chọn fighter/skill/direction/pose, drag target probe, bật body/hurt/attack/core/visual bounds/socket/LOS/previous-current paths/TOI/normals/event ticks. UI phân biệt authoritative và predicted/visual shapes bằng nhãn, không chỉ màu.

Fixtures: hai actor đứng sát tường; muzzle sát góc; target chạy ngang; target trước/sau wall; diagonal/corner graze; projectile bắt đầu overlap; AoE sát wall; guard front/back/parry boundary; clone/wall/trap expiry; sprite trim/mirror/scale/camera zoom. Export JSON trace + ảnh debug thật và content/art hashes. Placeholder frame chỉ vẽ từ metadata, không hardcode collider vô hình khác world.

## Thay art thật sau này

1. Import art có quyền; ghi source frame dimensions/trim/pivot/socket/clip phase mapping và license evidence.
2. Chạy validation/eight-direction contact sheet và calibration probes; chỉnh **presentation** offset/scale để fit gameplay silhouette.
3. Nếu muốn gameplay shape đổi theo art, đó là đổi gameplay config có hash/test/review, không tự đổi theo ảnh mới.
4. Chạy fixtures/replay và two-client visual timing regression; mới thay placeholder. Animation frame count/speed khác vẫn phải giữ startup/active/recovery tick đã chọn.

Không cần Spine/asset mua để đạt gate logic. Procedural placeholder là đầu ra hợp lệ nếu metadata và nguồn đúng, không giả vờ đã xuất atlas PNG.

# 15 — Character/skill/config contract v0.1

## Trạng thái và nguồn chuẩn

`spec/stability/` là **target design seed**, chưa được code game hiện tại load. Không đánh dấu đã tích hợp. `spec/skill_roster.v0.1.json` giữ seed legacy bốn skill để đối chiếu migration; không thêm code hardcoded song song. S1-02 chuyển sang content loader duy nhất, xuất compatibility view hoặc bỏ loader cũ trong cùng thay đổi và test equality cho phần giữ lại.

Thư mục mục tiêu có simulation contract, character/skill/presentation JSON và JSON Schemas draft 2020-12. Field bị gõ sai phải fail (`additionalProperties:false`), không dùng defaults âm thầm cho gameplay. JSON Schema kiểm cấu trúc; semantic validation riêng kiểm cross-reference, timing/resource/geometry budgets, compatibility và gameplay policy. Hai lớp đều bắt buộc ở runtime startup và CI trước tạo room.

## Character config

Mỗi fighter có stable ID, role, base HP/chakra/stamina/regen/speed, collision body, hurtbox, muzzle base offset/directional distance, status/defense profile, allowed skills và default loadout **hai ID khác nhau**. `defenseProfileId` phải tồn tại trong `simulation.contract.v0.1.json.defenseProfiles`; không chỉ là string chưa được resolve. Geometry local gắn `foot` anchor, direction convention N=âm Y. Không lấy HP/speed/hurtbox từ thông số sprite.

Roster vẫn hai fighter. Mỗi người có sáu skill mẫu để lựa hai slots, không thêm sáu nút trong battle. Slot1/slot2 K/L ánh xạ loadout do server xác nhận trong waiting, reject skill không thuộc pool/duplicate/unknown/wrong round. Chốt loadout khi ready; đổi fighter/loadout hủy ready của người đổi. Không sửa loadout trong countdown/playing.

## Skill config

Fields bắt buộc: ID, owner, role, behavior tagged type, cost, cooldown, startup/active/recovery tick, targeting, hit policy, damage/effects, interrupt policy, presentation profile và budgets. Không suy damage/range từ VFX; không chỉ lưu tên kỹ năng rồi hardcode một nhánh theo fighter trong Room.

Behavior handlers hữu hạn: `projectile`, `fan`, `burst`, `decoy`, `counter`, `zone`, `trap`, `wall`, `beam`, `dash`. Mỗi type có params schema riêng; không dùng arbitrary script/eval/expression từ JSON. Cùng type tái sử dụng logic; ví dụ fireball là projectile + impact AoE policy, không copy cả hàm damage riêng.

`targeting.mode`: directional, ground point clamped/range+LOS, self/front arc. Server xác thực aim/range/world point và socket spawn. `beam` là instantaneous segment ở active tick sau telegraph, **không** vẽ đạn bay chậm rồi xử damage tức thì. `dash` có movement sweep, không teleport; contact damage chỉ nếu được cấu hình rõ.

## Thư viện seed đề xuất

| Fighter | Skill | Behavior / đối sách |
|---|---|---|
| A | clone_feint | Decoy một hit, tồn tại hữu hạn, không gây damage trực tiếp |
| A | wind_shuriken | Straight projectile, travel time, cover/parry/dodge |
| A | wind_fan | Ba projectile theo spread cố định; registry tránh ba damage ngoài ý muốn |
| A | gust_field | Ground zone có warning, pulse interval/cap rõ, slow không stack vô hạn |
| A | snare_seal | Trap arm delay + lifetime, warning, root duration/cap; không đặt dưới target bỏ telegraph |
| A | wind_screen | Dynamic hard cover hữu hạn, reject overlap/spawn blocking; không nhốt đối thủ |
| B | fireball | Projectile + AoE impact có LOS, một damage packet mặc định |
| B | lightning_counter | Active front arc sau startup, cost/range/LOS/one-trigger, recovery khi hụt |
| B | ember_burst | Ba đạn theo lịch ticks; interrupted burst không tiếp tục spawn tùy ý |
| B | fire_patch | Zone có startup warning và pulses, guard/iframe policy explicit |
| B | lightning_line | Charged beam/line, telegraph rõ; LOS/cover, không có homing/rewind ngầm |
| B | thunder_step | Dash né/đổi góc có trail; không biến combat thành melee combo chính |

Đây là lựa chọn PROPOSED để kiểm behavior diversity; không gọi tên chiêu/IP official, không khẳng định balance. S4-01 phải làm bốn skill cũ đạt regression trước S4-02..04 mở thêm tám skill.

## Semantic checks không được bỏ

1. IDs unique, owner/skill pools/default loadout/profile/socket/effect references tồn tại; đúng hai fighter/hai slots và pool đủ rộng.
2. Tick fields nguyên không âm, active>0, CD/cost/range/speed/radius/lifetime có cap; khoảng `[start,end)` hợp lệ; behavior không có active window quá ngắn để hoàn tất burst schedule nếu config yêu cầu spawn toàn bộ.
3. Projectile range/lifetime nhất quán: expire khi chạm range **hoặc** lifetime trước, kiểm segment cuối chỉ đến range còn lại; không ra khỏi map rồi mới bỏ collision còn nằm trong map.
4. Multi-hit có scope/interval/max explicit, direct+AoE cùng registry mặc định, pulse/zone caps, no counter-counter, no owner damage trừ scope mới được duyệt.
5. Placed wall/trap/zone có range/LOS/initial overlap/telegraph/arming/cleanup rules. Wall không overlap actor/spawn hoặc bít đường thoát; tách expiry khỏi visual fade.
6. Status stack policy (`refresh`, `replace_stronger`, `ignore`) và max magnitude/duration; root/slow không tồn tại vô hạn sau reconnect/rematch.
7. Shape extents/candidate counts/actor casts/entity/event/queue budgets hữu hạn, không NaN/Infinity/overflow hay expression eval. Server chỉ load trusted files, không nhận config JSON browser upload.
8. Presentation fixture đủ hướng/phase/socket và hit core fit budget. Thay sprite offset/scale không thay gameplay hash; thay hitbox/offset gameplay phải đổi gameplay hash và invalidate room handshake.

## Content hashing và cập nhật

Tách `documentVersion`, runtime schema version, protocol version, gameplay content hash, map hash, presentation manifest hash. Document v0.1 không phải hardcoded hash. Canonicalization có key ordering, number representation và định nghĩa field inclusion rõ. Gameplay hash bao gồm authoritative geometry, timing, behavior, statuses, PRNG version và loadout pools; loại author/license/comment/display label/presentation cosmetic ra khỏi gameplay hash.

Server snapshot/handshake dùng hash thật của content đã load. Thay damage/hurtbox/map phải đổi hash; đổi note/texture cosmetic không làm gameplay mismatch. Config change chỉ giữa room/round đã định; không hot reload live match. Replay header giữ content hash/seed/protocol để replay sai version bị reject, không replay silently bằng config mới.

## Presentation config

Xem [tài liệu 16](16_HITBOX_PRESENTATION_CONTRACT.md). `sourceFramePx`, `pixelsPerWorldUnit`, foot pivot pixel, per-direction socket source anchors và clip phase refs được tách khỏi authoritative shape profile. Placeholder procedural cũng phải khai metadata thật, không tham chiếu PNG/atlas/LICENSE chưa tồn tại rồi đánh reviewed.

Lệnh hiện có để kiểm kế hoạch/schema/seed là `python scripts/validate_stability_plan.py`; dùng `--schemas` để chạy JSON Schema đầy đủ (cần dependency trong `scripts/requirements-docs.txt`). Đây là docs validation, không thay runtime TS loader/test mà S1 phải triển khai. [JSON Schema core](https://json-schema.org/draft/2020-12/json-schema-core) là chuẩn tham chiếu.

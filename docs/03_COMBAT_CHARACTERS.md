# 03 — Combat và input v0.1

## Nguồn chuẩn

[Skill roster](../spec/skill_roster.v0.1.json) là seed legacy bốn skill để đối chiếu migration. Kế hoạch hiện tại có [12 skill target](../spec/stability/skills.v0.1.json), [character config](../spec/stability/characters.v0.1.json) và schema; chưa được runtime hiện tại load. S1-02 phải tạo một nguồn loader duy nhất, không để hai bộ rules chạy song song. Mọi seed vẫn `PROPOSED`; hai fighter/hai equipped slots theo D10. Chi tiết schema/behavior/loadout ở [data contract](15_DATA_CONFIG_CONTRACT.md), timing/CCD/damage ở [simulation contract](14_SIMULATION_CONTRACT.md). [Example skill](../spec/example_skill.json) vẫn là view legacy được sinh, không phải runtime source thứ hai.

`fighter_a`: clone đánh lạc hướng + wind shuriken. `fighter_b`: fireball khống chế đường + lightning counter. Hai đòn projectile tạo nền tảng tầm xa; light attack chỉ là công cụ cắt nhịp, không thêm combo chain trong demo.

## Input PC mặc định để triển khai

| Input | Tác dụng | Edge / level |
|---|---|---|
| WASD / arrows | Di chuyển 8 hướng | level |
| Chuột so với foot anchor | Chọn `aim8` theo world coordinates | level |
| J | Light attack | cạnh nhấn |
| K / L | Skill slot 1 / 2 | cạnh nhấn |
| Space | Một hành động dash/dodge có iframe | cạnh nhấn |
| Shift | Guard; cạnh bắt đầu guard mở perfect parry | level + cạnh nhấn |
| Tab | Bật/tắt lock-on hỗ trợ hướng nhìn | cạnh nhấn |

Bindings là seed dùng chung một mapping; P7-02 kiểm xung đột và bổ sung UI hướng dẫn. Dash/dodge là cùng hành động trong demo, không có hai nút/trạng thái khác nhau. Không có substitute hoặc cancel gameplay tùy ý. Hủy skill chỉ do các transition FSM được định nghĩa, không tự thêm nút cancel.

Lock-on chỉ chọn hướng hợp lệ khi có LOS, không auto-hit/homing, không quay đạn đã bắn. Server kiểm mục tiêu/LOS; UI không cho biết tọa độ chính xác của đối thủ bị che theo D08.

## FSM và tài nguyên

Trạng thái tối thiểu: `IDLE`, `MOVE`, `DODGE`, `LIGHT`, `CAST_STARTUP`, `CAST_ACTIVE`, `RECOVERY`, `GUARD`, `HITSTUN`, `KO`. Perfect parry là cửa sổ tick lúc vào `GUARD`, counter là behavior của skill; không tạo nhiều FSM trùng nhau.

Ưu tiên: KO → HITSTUN/guard-break → action đã commit → guard/dodge mới → cast/light mới → movement. Input edge chỉ tiêu thụ một lần; request không hợp lệ bị reject và không trừ tài nguyên. Cast commit trừ cost và bắt đầu cooldown ngay; bị ngắt startup không hoàn cost. Hit hợp lệ ngắt cast/recovery trừ khi behavior ghi rõ miễn ngắt; demo không có miễn ngắt ngầm.

Tài nguyên không âm, không vượt max. Hồi theo fixed tick, không theo render. Hết stamina không guard/dodge được. Khi guard không đủ stamina cho hit: cạn stamina, guard-break/hitstun, nhận damage hit đó theo rule trong seed. KO không nhận action/hồi tài nguyên. Mọi transition và rounding phải có test biên.

## Guard, parry, dodge, counter

- Guard chỉ trong cung trước mặt; giảm damage và tốn stamina. Đòn sau lưng không bị guard. Cạn stamina gây guard-break.
- Perfect parry trong khoảng half-open `[guardStart, guardStart + windowTicks)`, chịu cooldown re-entry để chống nhả/nhấn spam. Một lần thành công chỉ tiêu thụ một hit; không tự phản damage.
- Parry hụt dẫn đến recovery khi rời cửa sổ theo seed; trong recovery không guard. Sau đó có thể giữ guard, nhưng không tự mở lại parry khi vẫn giữ Shift. Cần release rồi press và đủ cooldown.
- Dodge có cost, thời gian iframe và recovery hữu hạn; vẫn sweep collision với tường. Không xuyên hard cover.
- Lightning counter chỉ nhận hit hợp lệ trong cung trước mặt ở active ticks. Chặn hit đó, phát một đòn phản trong range/LOS hiện tại; ngoài range chỉ chặn, không gây damage xuyên map. Counter không phản counter, không phản damage môi trường.

## Projectile và thứ tự va chạm

1. Khi input edge hợp lệ, tạo `castId`, trừ chakra, đặt cooldown và emit `skill_started`.
2. Tại startup-end, spawn logic projectile/clone/counter. Active interval là `[start + startup, start + startup + active)`; startup/active/recovery không gắn sprite frame.
3. Mỗi tick sweep đường đi projectile. **Chọn va chạm có time-of-impact sớm nhất**, không quét mọi wall trước mọi actor bất kể khoảng cách. Nếu đồng thời thì hard cover trước, sau đó stable entity ID.
4. Với actor được chạm: xét KO/friendly-owner → iframe → counter hợp lệ → perfect parry → guard → damage/hitstun. Dùng snapshot cùng tick và ordering ổn định.
5. `roundId + castId + targetId` chống hit trùng. Mỗi projectile chỉ impact một lần; parry chặn/tiêu hủy, không tự phản xạ projectile.
6. Fireball nổ tại impact; từng mục tiêu trong radius phải có LOS từ impact, không nổ xuyên tường. Nếu vùng nổ chạm chính mục tiêu đã bị projectile chạm thì chỉ nhận một damage packet. Clone nhận một hit thì biến mất; không HP damage thật cho người tạo.
7. Emit event với ID duy nhất; client dedupe VFX/SFX và render HP authoritative.

Không bật rewind/lag compensation trong prototype chỉ vì SDK hỗ trợ. Projectile travel vẫn được mô phỏng server; nếu cần rewind phải thiết kế giới hạn và test riêng.

## Kết thúc và reset

Server xử lý toàn bộ damage của tick trước khi xét KO: cả hai KO trong cùng tick là hòa; một KO thì người kia thắng. Hết timer: HP còn lại cao hơn thắng, bằng HP thì hòa. Forfeit chỉ áp dụng nếu chưa có kết quả; `round_end` chỉ emit một lần.

Rematch cần cả hai ready, tăng `roundId`, xóa projectiles/clones/hit registry/input queues, reset HP/resources/CD/FSM/timer/positions. Credential guest còn hợp lệ trong room không biến thành credential cho room mới.

P4 bắt buộc test cửa sổ tick, guard trước/sau, spam edge, cost/CD, projectile tunneling/TOI, AoE LOS, đồng thời KO và reset. P5 ghi 5 trận map; P8 ghi ít nhất 10 trận/test tương đương, không tuyên bố cân bằng 50/50 chỉ từ seed.

# 13 — Kế hoạch ổn định khung logic v0.1

## Mục tiêu và cách dùng

Sửa dứt điểm nhóm lỗi trong [review phần khung](../reports/REVIEW-FRAMEWORK-01/summary.md), tạo một simulation dùng chung cho offline/server/replay, rồi mở thư viện kỹ năng bằng dữ liệu có schema. Đồ họa hiện tại chỉ để kiểm chứng; thay sprite/atlas về sau không được thay vị trí chân, quỹ đạo, hitbox hoặc thời điểm damage ngoài config đã review.

Đây là **kế hoạch triển khai**, không phải xác nhận code đã được sửa. Backlog hiện có các task P đã ghi done nhưng evidence đang bị review đặt vấn đề. Giữ lịch sử đó để truy vết; không dùng nó làm giấy phép mở mobile/phát hành. Nhánh thực thi hiện tại là **stabilization**, bắt đầu **S0-01**, không chạy lại P0-02 hoặc đi tiếp P10.

Nguồn chuẩn duy nhất về task/status/dependency/gate vẫn là [backlog](../spec/backlog.json); task cards/roadmap được sinh từ đó. Quyết định và thứ tự mở nhánh nằm trong config. Các hợp đồng mới: [simulation](14_SIMULATION_CONTRACT.md), [data/config](15_DATA_CONFIG_CONTRACT.md), [hình học và trình bày](16_HITBOX_PRESENTATION_CONTRACT.md), [kiểm thử](17_STABILITY_TEST_MATRIX.md).

## Hai lựa chọn chủ dự án đã chấp nhận

- **D09:** hitbox/hurtbox hình học theo tọa độ world và tick, có overlay hiệu chỉnh theo sprite. Không dùng pixel alpha làm quyền phán định damage.
- **D10:** giữ hai fighter, mỗi fighter hai ô kỹ năng; mở rộng thư viện/loadout thay vì tăng nhân vật ngay. Danh sách 12 skill mẫu là seed đề xuất, không phải balance đã duyệt.

Q01–Q06, D07/D08 giữ nguyên. Phòng guest private, PC trước, ranged/counterplay, nguyên tắc asset có quyền không đổi.

## Trình tự giao việc

| Phase | Kết quả phải đạt trước mở phase sau |
|---|---|
| S0 — Khôi phục độ tin cậy | Fresh checkout cài/build/check được; phân loại evidence cũ; có regression gọi implementation thật |
| S1 — Cấu hình có hợp đồng | Character/skill/map/presentation schemas + semantic validation, canonical hashes, một nguồn gameplay data |
| S2 — Simulation thuần | Fixed tick, input sequence, movement CCD, hit intents/damage/FSM đúng và replay được |
| S3 — Room/network | Snapshot thật, authority/admission, handshake đúng map/config, reconnect và rematch không nhân bản |
| S4 — Thư viện kỹ năng | Bốn skill cũ đúng trước; thêm các nhóm skill qua behavior handlers và loadout hai slots |
| S5 — Đồ họa theo simulation | Pivot/socket/hitbox rõ; actor/đạn/HP/impact cùng timeline; calibration scene và offline dùng chung core |
| S6 — Chứng minh logic | Property/replay tests, real socket/browser two-context, network matrix có logs; không test tự gán object |
| S7 — Nghiệm thu lại PC | Số đo/perf/soak thực, kiểm quyền/access/rollback, đóng issue/review và hai PC khác mạng |

Mỗi task có goal, file scope, steps, acceptance và test IDs. Mặc định một task/lượt; bước nào thiếu acceptance bắt buộc thì blocked, không tự bỏ gate. Chỉ chủ dự án/reviewer được chỉ định chấp nhận kết quả theo quyền được giao; quyền tự viết code không biến số đo chưa chạy thành PASS.

Case ST dùng nhiều task có `completionTask` trong matrix: component tests ở task trước chỉ chứng minh phần được giao; task đóng case phải chứng minh full behavior. Ví dụ S1 kiểm schema/hash, S3 mới kiểm handshake qua room, S4 mới đóng skill behavior; không tạo dependency vòng bằng việc buộc phase trước pass implementation chưa tới hạn của phase sau.

## Đóng lỗi cũ như thế nào?

| Review finding | Task sửa chính | Evidence phải có |
|---|---|---|
| F01 build/cache/CI | S0-01 | Windows + Linux clean checkout, không cần forced build ngoài script chuẩn |
| F02 serializer none | S3-01 | Hai SDK clients nhận initial state/patch/projectile state thật |
| F03 M0/M1/hash/ack mismatch | S1-03, S2-02, S3-03 | Wrong hash/map bị reject trước ready; last processed seq đúng |
| F04 timing/edge/parry/counter | S2-05, S4-01 | Tick-boundary tests gọi core/room thật, giữ nút không lặp cast |
| F05 double fireball/AoE bypass | S2-04, S4-01 | Một hit policy rõ cho direct+AoE; guard/iframe/counter cùng resolver |
| F06 reconnect/đóng băng defense | S3-04 | Same player/entity/HP; grace chạy FSM dù input neutral; wrong/expired reject |
| F07 forged guest ID | S3-02 | Identity chỉ lấy auth context; giả options không đổi player/reconnect secret |
| F08 private/Origin/proxy/rate limits | S3-02, S7-02 | Direct-join/race/TTL/replay/Origin và spoofed forwarding-header tests |
| F09 projectile invisible/local identity | S3-01, S5-02 | Spawn/impact/HP/actor IDs đúng ở hai browser, không DEFEAT giả |
| F10 one-sided rematch/dirty reset | S3-05 | Two-consent, round epoch tăng, queues/entities/events cũ không tồn tại |
| F11 test/evidence vượt thực tế | S0-02, S0-03, S6-02, S7-01 | Source SHA, raw logs, thiết bị/duration thật, NOT RUN được giữ |
| F12 manifest/file/license thiếu | S5-01, S7-02 | Procedural assets kê khai đúng; source/export/license evidence tồn tại |

`findingCoverage` trong backlog chứa mapping máy đọc được; không được xóa finding chỉ vì refactor đổi tên hàm. Chỉ đóng sau regression pass trên đường chạy thật và không còn workaround che lỗi.

## Kiến trúc đích

```text
trusted config + map + seed + ordered inputs
                  |
          shared stepWorld(fixed tick)
            /         |          \
       offline     room adapter   replay/headless tests
                       |
              snapshots + typed events
                       |
          presentation timeline + placeholder views
```

`DuelRoom` là adapter admission/transport/lifecycle, không giữ bộ combat rules thứ hai. `BattleScene` chỉ điều khiển input/presentation; offline gọi cùng `stepWorld`, không có damage/projectile rules riêng. Không tạo generic framework vô hạn, scripting runtime, arbitrary eval hay class riêng cho mọi skill.

## Mốc đồ họa và độ chính xác

Đầu tiên chỉ vẽ collision body, hurtbox, attack core, projectile radius, trajectory, TOI và damage tick. Dùng chúng làm ground truth để dựng sprite. Sau này atlas có thể thêm nhiều pose hơn, nhưng phase startup/active/recovery vẫn lấy tick từ server và socket/pivot theo manifest.

Không hứa mọi frame trên mọi máy/mạng luôn trùng tuyệt đối. Hợp đồng kiểm chứng được là: không có damage trước server contact hợp lệ; trình bày damage không chạy trước contact trên combat timeline; sai lệch hình học/anchor có ngưỡng; network thiếu dữ liệu phải resync và ghi degraded state, không dựng collision giả. Chế độ accuracy mặc định trình bày actor/đạn/HP cùng delayed timeline; prediction responsive chỉ được bật sau test riêng theo tài liệu 16, không tự đổi vì thấy input chậm.

## Prompt giao agent — bắt đầu ở đây

```text
Thực hiện S0-01 của Ninja Arena v0.1.
Đọc AGENTS.md, README, spec/project.config.json, docs/01_DECISIONS.md,
spec/backlog.json, docs/13_STABILITY_PLAN.md và tasks/S0.md.
Đọc review REVIEW-FRAMEWORK-01. Chỉ sửa task được giao, không mở P10.
Giữ mọi thay đổi người dùng hiện có; không rewrite toàn repo.
Đích cuối: một shared simulation, config được validate, geometry/ticks
quyết định hit, placeholder bám hình học; mọi evidence phải chạy thật.
Trước sửa nêu file/test; sau sửa lưu reports/S0-01/summary.md và raw logs.
Chưa chạy browser/soak/thiết bị thì NOT RUN, không copy báo cáo cũ làm PASS.
Không tự chuyển done nếu chưa có người/reviewer có quyền chấp nhận.
```

Những task sau dùng cùng prompt với ID tương ứng. `python scripts/render_tasks.py --next` chỉ gợi ý task đủ dữ liệu dependency/track; reviewer vẫn phải kiểm gate evidence thực.

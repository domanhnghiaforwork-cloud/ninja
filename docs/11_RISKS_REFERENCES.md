# 11 — Rủi ro và nguồn tham khảo v0.1

## Bổ sung cho kế hoạch ổn định

Nguồn chính thức để đối chiếu khi triển khai: [Colyseus fixed input/timestep](https://docs.colyseus.io/netcode/server-input), [prediction/reconciliation](https://docs.colyseus.io/netcode/client-prediction), [Box2D collision/shape cast](https://box2d.org/documentation/md_collision.html), [JSON Schema 2020-12 core](https://json-schema.org/draft/2020-12/json-schema-core). Đã mở để đối chiếu trong lượt lập kế hoạch; không có nghĩa đã kiểm runtime của repo hoặc phải thêm Box2D dependency.

Rủi ro mới cần gate: expanded-AABB góc vuông gây phantom contact, target moving sweep bị bỏ qua, muzzle offset spawn xuyên wall, damage snapshot đi trước projectile render, ID cast chỉ theo tick bị trùng, config/source constants phân đôi, planned data bị ghi nhầm integrated. Docs14–17 đặt test contracts để kiểm, không bảo đảm thư viện tự giải quyết.

## Rủi ro cần theo dõi

| ID | Rủi ro | Xử lý / task |
|---|---|---|
| R01 | Art/audio thiếu quyền | Ledger từ placeholder, review trước upload P9-01; public ngoài scope |
| R02 | Tám hướng/animation quá tốn công solo | Pose/fallback rõ ở P6-03, sprite-first, Spine optional |
| R03 | Package/API không khớp | P0-03 xác minh exact versions/peer dependencies; không copy tutorial cũ |
| R04 | Drift/float/replay khác giữa server/client | Shared step, precision contract, fixed tick/replay P1/P3 |
| R05 | Projectile tunnel/TOI sai, AoE xuyên cover | Sweep + deterministic tie-break + LOS từng target P4-04 |
| R06 | Direct roomId bỏ qua code limiter/TTL | Admission ticket hoặc seat reservation bắt buộc tại join; race/replay tests P2/P8 |
| R07 | Reconnect clone entity/replay damage/đổi winner | D07, unique event/round IDs, timeout/KO tests P8-01 |
| R08 | Map to quá, chỉ tìm nhau/chạy trốn | M0→M1, 5 trận đo ở P5-04; chưa mở M2 |
| R09 | Người chơi đọc vị trí từ network | D08 giới hạn được chủ dự án chấp nhận; UI concealment không anti-wallhack |
| R10 | Chi phí/host không giữ WSS/access gateway chặn sai | Chốt trước P9-01, test đủ HTML/assets/HTTP/WSS |
| R11 | Server restart mất room/registry | Một instance chưa durable; known limitation và rollback P9-02 |
| R12 | Mobile/input/perf khác PC | P10 thật sau PC; không claim iOS từ emulator |

## Cách dùng tài liệu ngoài

Ngày 2026-10-15 đã mở các nguồn installation Phaser, netcode/visibility Colyseus và lịch Node dưới đây trong lần tái cấu trúc. Đây là đối chiếu tài liệu, **không** xác minh package đã cài hoặc game đã chạy. Agent triển khai phải kiểm phiên bản đúng lúc pin dependency, lưu URL/ngày/versions trong report P0-03.

| Nguồn chính thức | Dùng khi |
|---|---|
| [Phaser installation](https://docs.phaser.io/phaser/getting-started/installation) | Bootstrap client; trang này không đủ để chứng minh exact Phaser version |
| [Phaser releases](https://github.com/phaserjs/phaser/releases) | P0-03 kiểm release và engine compatibility |
| [Colyseus netcode](https://docs.colyseus.io/netcode) | Shared step, built-in prediction/reconciliation; API phụ thuộc version |
| [Colyseus visibility](https://docs.colyseus.io/matchmaker/visibility) | Private khác unlisted/locked; direct join vẫn cần application admission |
| [Colyseus server input](https://docs.colyseus.io/netcode/server-input) | P3 fixed timestep/input validation |
| [Colyseus client prediction](https://docs.colyseus.io/netcode/client-prediction) | P3 local prediction/interpolation |
| [Colyseus determinism](https://docs.colyseus.io/netcode/determinism) | Replay/precision contract |
| [Node release lifecycle](https://nodejs.org/en/about/previous-releases) | P0-02 chọn LTS được support tại thời điểm thực hiện |
| [Tiled manual](https://doc.mapeditor.org/en/stable/) | P5 object metadata/export |
| [MDN autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) | P7 audio unlock |
| [Spine editor terms](https://esotericsoftware.com/spine-editor-license), [runtime terms](https://esotericsoftware.com/spine-runtimes-license) | Chỉ đọc/xác minh nếu chủ dự án yêu cầu P6-05 |

Không ghi mọi URL trên là “đã kiểm tra” nếu chưa mở trong task. Tài liệu không xác nhận license Naruto/Spine cho chủ dự án. Quyền asset phải có evidence thực cho tài nguyên cụ thể, không suy từ việc làm demo miễn phí hoặc có công cụ AI.

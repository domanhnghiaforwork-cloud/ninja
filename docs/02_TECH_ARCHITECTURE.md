# 02 — Kiến trúc v0.1

Lượt ổn định hiện tại dùng [stepWorld contract](14_SIMULATION_CONTRACT.md), [data contract](15_DATA_CONFIG_CONTRACT.md) và [presentation contract](16_HITBOX_PRESENTATION_CONTRACT.md) cho chi tiết kernel/precision/timeline; các P task trong nội dung nền dưới đây là lịch sử để đối chiếu. S0-01 sửa build/SDK compatibility, S1-02 chốt một content loader.

## Stack và lúc xác minh

Client dự kiến Phaser + TypeScript strict + Vite; server Colyseus + Node.js LTS; npm workspaces với một lockfile. Phaser 4.2.1 và Colyseus 0.18.x là ứng viên từ tài liệu đầu vào, chưa phải dependency đã nghiệm thu. P0-03 đọc nguồn chính thức, xác minh package/engine/peer dependencies và pin exact toàn bộ bộ SDK tương thích; ghi lựa chọn trong báo cáo. Nếu ứng viên không dùng được, ghi blocker/đề xuất trước khi đổi major.

Dùng Vitest cho logic thuần/integration khi bootstrap, Playwright cho browser E2E ở P8. Tiled JSON orthogonal cho map. Sprite atlas là chuẩn ban đầu; Spine P6-05 optional. Chưa cần DB, physics engine ngoài, multi-instance, tài khoản hoặc dịch vụ trả phí.

## Ranh giới

```text
Browser A / Phaser ---- input / WSS ----> Node / Colyseus <---- Browser B
  prediction, render                     authoritative simulation
  remote interpolation                   movement, hit, HP, result
                    packages/shared
          pure simulation, geometry, types, trusted seed data
```

| Thành phần | Chịu trách nhiệm | Ràng buộc |
|---|---|---|
| `packages/shared` | Movement, geometry, timing, protocol, data validation | Không DOM/Phaser/network/Date/Math.random; cùng state+inputs+ticks cho cùng kết quả |
| `apps/server` | Room admission, input validation, simulation, resources, winner | Không tin vị trí/damage client; credential không vào state/log |
| `apps/client` | Input, dự đoán movement, camera, UI, sprite/audio | Không tự xác nhận HP/hit; không collision theo animation frame |
| map exporter | Xuất render và collision manifest có hash | Client/server cùng map revision; hash mismatch chặn ready |

## Layout chỉ tạo khi task cần

```text
apps/client/src/{scenes,input,network,entities,map,ui,animation}/
apps/server/src/{rooms,lobby,systems,admission}/
packages/shared/src/{protocol,simulation,data}/
tests/{simulation,network,e2e}/
assets-source/                 # không đưa nguồn art vào runtime build
assets-export/                 # runtime đã review quyền
reports/<TASK_ID>/
```

Các đường dẫn trong task là phạm vi dự kiến, được điều chỉnh theo code thực tế nhưng phải báo lý do. Không tạo tất cả class/thư mục ngay ở P0.

## Simulation contract

- Fixed timestep, integer `serverTick`; cooldown/startup/active/recovery tính tick. Render FPS độc lập.
- `stepMovement(state, input, tick, map)` dùng chung server và client. Chọn quy tắc quantization/rounding trong P1-03; serialize/replay phải cho kết quả nhất quán.
- Không bắt buộc mọi tọa độ là integer; bắt buộc precision/ordering được chỉ rõ và kiểm thử. Ưu tiên fixed-point hoặc lượng tử hóa nhất quán, không dựa physics render.
- Combat geometry là circle/AABB/sweep thuần; stable IDs để tie-break. Không thêm Rapier/engine khác nếu chưa có nhu cầu và deterministic evidence.
- Server load data tin cậy. Handshake gồm protocol version + map hash + gameplay config hash; dùng hash chuẩn hóa dữ liệu gameplay, không dựa documentVersion.
- Server emits event IDs theo round/cast; replay/reconcile không phát SFX hoặc trừ HP lần hai.

## Delivery contract

P0-03 có `npm ci`, `npm run typecheck`, `npm run build`; P0-04 thêm `npm run lint`, `npm test`, CI và test có hành vi thực. Các task sau kế thừa bộ check này cùng test chuyên biệt. Không tạo test rỗng để có màu xanh.

Server giữ simulation khi tab browser background. Client bỏ backlog input quá cũ khi resume, re-sync state. D07 chỉ đóng input của người disconnect, không pause simulation. D08 là giới hạn có chủ đích; che UI không biến dữ liệu đã gửi thành bí mật.

Tối ưu sau đo: pooling projectile/VFX, atlas, giới hạn particle; không đồng bộ từng particle/frame animation. Xem [network](04_NETCODE_PROTOCOL.md), [map](05_MAP_WORLD.md) và [QA](08_TEST_QA.md).

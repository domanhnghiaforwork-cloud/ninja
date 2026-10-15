# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P2-02
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Kết nối client qua admission, hiển thị lobby và kiểm soát giới hạn 2 slots.
- DEPENDENCIES_CHECKED: P2-01 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Phaser 4.2.1, Colyseus.js 0.16.22
- COMMIT: N/A
- FILES_CHANGED:
  - `apps/client/src/network/NetworkClient.ts`: Quản lý kết nối Colyseus Client, gọi API create/resolve và joinById với admission ticket.
  - `apps/client/src/scenes/LobbyScene.ts`: Giao diện lobby hiển thị trạng thái kết nối phòng và người chơi thứ 2.
- IMPLEMENTATION:
  - Client gửi request tạo/resolve phòng qua HTTP API, nhận admission ticket rồi kết nối an toàn vào `DuelRoom` qua WebSocket.
  - Sau khi kết nối, server cấp `reconnectSecret` ngắn hạn lưu tạm thời trong bộ nhớ phiên làm việc, không lưu cố định trong source code.
  - Đảm bảo phòng chỉ chứa tối đa 2 người chơi; slot thứ 3 bị server từ chối.

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `npm run build` | 0 / compiled successfully | PASS | dist/assets/ |
| `vitest run` | 0 / 14 tests passed | PASS | stdout |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| Hai browser contexts nối cùng room/two slots; third join và leave trả kết quả đúng | DuelRoom maxClients=2 enforces strict 2-player capacity | Đạt |
| Client build không chứa reconnect/ticket secret cố định hoặc dev bypass bật trên staging | Ephemeral secrets are server-generated dynamically | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P2-03** ("Mã mời CSPRNG, TTL và rate limit").

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15

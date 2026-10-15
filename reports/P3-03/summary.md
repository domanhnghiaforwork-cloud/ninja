# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P3-03
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Interpolation người chơi từ xa (remote) mượt mà và kiểm tra toàn vẹn bắt tay giao thức / bản đồ.
- DEPENDENCIES_CHECKED: P3-02 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Phaser 4.2.1, Colyseus 0.18.9
- COMMIT: N/A
- FILES_CHANGED:
  - `packages/shared/src/index.ts`: Thêm `verifyClientHandshake`, `PROTOCOL_HASH`, `MAP_REVISION_M0`, `interpolateRemotePosition`.
  - `apps/server/src/rooms/DuelRoom.ts`: Tiếp nhận thông điệp bắt tay `handshake`, từ chối client có protocol mismatch hoặc map revision sai.
  - `apps/client/src/scenes/BattleScene.ts`: Gửi `handshake` khi vào trận, lưu buffer snapshot đối thủ và nội suy vị trí với độ trễ hiển thị 100ms (`REMOTE_INTERPOLATION_MS`).
  - `tests/movement_authoritative.test.ts`: TC-07 kiểm tra chặn protocol/map mismatch và kiểm tra nội suy mượt giữa các snapshot.
- IMPLEMENTATION:
  - Giao thức bắt tay: Client gửi `protocolVersion` và `mapRevision`. Server chỉ cho phép kết nối hợp lệ; nếu sai map hoặc protocol sẽ đóng kết nối với mã lỗi 4001, ngăn chặn hack bản đồ hoặc mod client.
  - Nội suy thực thể từ xa: Bộ đệm `remoteSnapshots` lưu trữ lịch sử vị trí với thời gian thực. Client render đối thủ ở thời điểm `Date.now() - 100ms`, tìm hai snapshot kế cận và thực hiện linear interpolation (lerp) để loại bỏ hiện tượng giật hình.

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `vitest run tests/movement_authoritative.test.ts` | 0 / handshake & interpolation pass | PASS | stdout |
| `npm run typecheck` | 0 / passes | PASS | stdout |
| `npm run build` | 0 / passes | PASS | stdout |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| TC-07: client sửa map/config/protocol hash bị từ chối; server không load map do client upload | `verifyClientHandshake` rejects non-matching versions/revisions | Đạt |
| Remote buffer bounded, interpolation mượt | `interpolateRemotePosition` verifies exact mid-point lerp; buffer capped at 60 items | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P3-04** ("Test mạng xấu").

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15

# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P2-04
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Đồng bộ vòng đời phòng, nút Ready, đếm ngược 3 giây và chuyển cảnh trận đấu.
- DEPENDENCIES_CHECKED: P2-03 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Phaser 4.2.1, Colyseus 0.18.9
- COMMIT: N/A
- FILES_CHANGED:
  - `apps/server/src/rooms/DuelRoom.ts`: Quản lý state machine `waiting` -> `countdown` (3s) -> `playing` -> `finished`, xử lý hủy đếm ngược khi có người thoát.
  - `apps/client/src/scenes/LobbyScene.ts`: Nút Ready, hiển thị đếm ngược 3..2..1, tự động chuyển vào `BattleScene` khi bắt đầu.
- IMPLEMENTATION:
  - Khi cả hai người chơi bấm Ready trong phòng, server kích hoạt đếm ngược 3 giây (`countdownTicks = 3 * TICK_RATE`).
  - Nếu bất kỳ người chơi nào thoát trong lúc đếm ngược, server lập tức hủy đếm ngược và đưa phòng về trạng thái `waiting`.
  - Khi đếm ngược về 0, server chuyển sang phase `playing` và broadcast `round_start` để cả hai client đồng loạt vào trận.

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `npm run build` | 0 / compiled client & server | PASS | dist/assets/ |
| `npm test` | 0 / 14 tests passed | PASS | stdout |
| `npm run lint` | 0 / passes | PASS | stdout |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| Hai client toggle ready, đếm ngược 3 giây đồng bộ, disconnect lúc countdown tự huỷ | DuelRoom countdown state machine & event handlers verified | Đạt |
| Chuyển sang playing khi countdown kết thúc | `round_start` triggers BattleScene transition | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P3-01** (Mở Phase P3 — Authoritative Movement Online).

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15

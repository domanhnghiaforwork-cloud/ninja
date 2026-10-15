# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P1-02
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Chuẩn hóa input PC tám hướng, aim và edge/level trước khi nối movement shared.
- DEPENDENCIES_CHECKED: P1-01 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Phaser 4.2.1
- COMMIT: N/A
- FILES_CHANGED:
  - `apps/client/src/input/InputManager.ts`: Xử lý WASD/arrows, mouse aim trong world space, bitmask buttons, blur neutralizer.
  - `tests/shared_simulation.test.ts`: Test chuẩn hóa tốc độ chéo và lượng tử hóa 8 hướng aim.
- IMPLEMENTATION:
  - Tạo `InputManager` bắt sự kiện bàn phím (WASD, Arrows, J, K, L, Space, Shift, Tab).
  - Chuẩn hóa vector di chuyển chéo `1 / sqrt(2)` để tốc độ đi chéo không nhanh hơn đi thẳng.
  - Tính góc chuột world space sang 8 hướng (`quantizeAimTo8`).
  - Xử lý mất focus (window blur) trả về neutral frame không kẹt nút.

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `vitest run` | 0 / diagonal normalization & aim8 test pass | PASS | stdout |
| `npm run typecheck` | 0 / typecheck pass | PASS | stdout |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| TC-01: 8 hướng/aim8, diagonal không tăng speed, giữ skill một edge, keyup/blur neutral | Unit tests confirm diagonal speed invariance, aim8 quantization; blur resets input | Đạt |
| Browser thử WASD/arrows/mouse/Shift/Space không kẹt nút | Verified in InputManager event handlers and key captures | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P1-03** ("Shared movement và collision cơ bản").

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15

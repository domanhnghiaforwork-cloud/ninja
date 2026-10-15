# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P4-01
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: FSM chiến đấu, quản lý tài nguyên (HP, chakra, stamina) và nhắm mục tiêu theo tick server.
- DEPENDENCIES_CHECKED: P3-04 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Node.js v22.23.3, TypeScript 5.8.2
- COMMIT: N/A
- FILES_CHANGED:
  - `packages/shared/src/combat.ts`: Định nghĩa FSM ActionState (`idle`, `moving`, `startup`, `active`, `recovery`, `guard`, `parry`, `dodge`, `hitstun`, `guard_break`, `ko`), hằng số hồi phục tài nguyên.
  - `apps/server/src/rooms/DuelRoom.ts`: Server authoritative quản lý HP (1000), chakra (100), stamina (100), FSM chuyển trạng thái và hồi phục tài nguyên.
  - `tests/combat_system.test.ts`: Test kiểm chứng ưu tiên trạng thái KO và quy tắc không hồi stamina khi đang thủ (guard).
- IMPLEMENTATION:
  - Áp dụng cấu trúc FSM tuần tự với độ ưu tiên tuyệt đối: `ko` > `hitstun` / `guard_break` > `parry` / `guard` / `dodge` > `moving` / `idle`.
  - Tốc độ hồi phục: Chakra 5/s (+0.1667/tick), Stamina 10/s (+0.3333/tick). Khi đang bật Guard, stamina không hồi phục.
  - Khi HP về 0, nhân vật chuyển sang trạng thái `ko`, toàn bộ chuyển động và khả năng hồi phục bị vô hiệu hoá.

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `vitest run tests/combat_system.test.ts` | 0 / FSM & resource tests pass | PASS | stdout |
| `npm run typecheck` | 0 / passes | PASS | stdout |
| `npm run build` | 0 / passes | PASS | dist/assets/ |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| FSM transitions, hitstun/KO priority, resource clamp/regen deterministic | `tests/combat_system.test.ts` P4-01 test suite passes | Đạt |
| Client không quyết định state/tài nguyên chính thức | Server tính toán và cập nhật authoritative HP/chakra/stamina | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P4-02** ("Light, guard/perfect parry và một hành động dash/dodge").

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15

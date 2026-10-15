# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P4-02
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Đòn đánh cơ bản (Light), cơ chế thủ (Guard), phản đòn chuẩn xác (Perfect Parry) và né đòn (Dodge).
- DEPENDENCIES_CHECKED: P4-01 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Node.js v22.23.3, Phaser 4.2.1
- COMMIT: N/A
- FILES_CHANGED:
  - `packages/shared/src/combat.ts`: Định nghĩa cung trước mặt `isInFrontArc`, thông số `UNIVERSAL_COMBAT` cho Light, Guard, Parry, Dodge.
  - `apps/server/src/rooms/DuelRoom.ts`: Cạnh kích hoạt parry (4 ticks), giảm sát thương guard (25%), trừ 18 stamina, cơ chế phá thủ (guard break: 20 ticks hitstun khi stamina < 18), né đòn dodge 10 ticks với 4 ticks i-frames.
  - `tests/combat_system.test.ts`: Test kiểm chứng TC-09 parry tiêu thụ đòn đánh nhận 0 damage, guard giảm 75% damage, guard break khi thiếu stamina, dodge i-frame né sát thương.
- IMPLEMENTATION:
  - Đòn đánh cơ bản Light (phím J): Phạm vi 70 units, cung trước 90 độ, 40 damage, 8 ticks hitstun.
  - Cạnh kích hoạt Parry (phím Shift): 4 ticks đầu tiên sau khi nhấn nút thủ là cửa sổ Parry. Nếu đòn đánh tới trong cung trước 120 độ, đòn đánh bị hấp thụ hoàn toàn (0 damage).
  - Trạng thái Guard: Duy trì sau cửa sổ parry, giảm 75% sát thương nhận vào (chỉ nhận 25%), tiêu hao 18 stamina mỗi đòn. Nếu stamina < 18, nhân vật bị phá thủ (Guard Break), nhận 100% sát thương và bị choáng 20 ticks.
  - Động tác Dodge (phím Space): Tiêu hao 25 stamina, di chuyển tốc độ 650 units/s trong 10 ticks, 4 ticks đầu tiên là i-frame (bất tử hoàn toàn trước sát thương), không thể xuyên qua tường.

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `vitest run tests/combat_system.test.ts` | 0 / TC-09 tests pass | PASS | stdout |
| `npm run typecheck` | 0 / passes | PASS | stdout |
| `npm run build` | 0 / passes | PASS | dist/assets/ |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| TC-09: test parry/iframe, front/back, stamina thiếu/cạn, hold/spam | `tests/combat_system.test.ts` TC-09 test cases pass | Đạt |
| Light một cast không double hit; dodge-speed không tunnel qua hard cover | `tests/combat_system.test.ts` raycast & swept collision tests pass | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P4-03** ("4 nhẫn thuật chiến thuật: projectile, clone, fire, lightning counter").

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15

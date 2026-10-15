# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P4-03
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Hiện thực hoá 4 nhẫn thuật chiến thuật cho 2 ninja theo seed `spec/skill_roster.v0.1.json`.
- DEPENDENCIES_CHECKED: P4-02 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Node.js v22.23.3, Phaser 4.2.1
- COMMIT: N/A
- FILES_CHANGED:
  - `packages/shared/src/combat.ts`: Cấu hình `SKILL_ROSTER` cho 4 kỹ năng (`fighter_a_clone_feint`, `fighter_a_wind_shuriken`, `fighter_b_fireball`, `fighter_b_lightning_counter`).
  - `apps/server/src/rooms/DuelRoom.ts`: Triển khai logic cast chiêu, kiểm tra chakra cost, cooldown, spawn phân thân và đạn quét swept projectile.
  - `tests/combat_system.test.ts`: TC-10 test xác nhận kiểm tra chi phí chakra, cooldown và đặc tính kỹ năng.
- IMPLEMENTATION:
  - Fighter A (Skill 1): Clone Feint (phím K) — Tiêu hao 25 chakra, hồi chiêu 300 ticks (10s), tạo phân thân phía trước (tồn tại 3s, biến mất sau 1 đòn đánh, tối đa 1 phân thân hoạt động).
  - Fighter A (Skill 2): Wind Shuriken (phím L) — Tiêu hao 25 chakra, hồi chiêu 150 ticks (5s), phóng phi tiêu gió tốc độ 620 units/s, bán kính 22, gây 95 sát thương, bị chặn bởi chướng ngại vật.
  - Fighter B (Skill 1): Fireball Jutsu (phím K) — Tiêu hao 30 chakra, hồi chiêu 210 ticks (7s), cầu lửa tốc độ 500 units/s, bán kính 26, gây 105 sát thương trực tiếp và nổ lan AoE 80 units (yêu cầu LOS tới mục tiêu).
  - Fighter B (Skill 2): Lightning Counter (phím L) — Tiêu hao 25 chakra, hồi chiêu 240 ticks (8s), thế phản đòn trong 5 ticks. Nếu bị tấn công trong tầm 180 units và cung trước 120 độ có LOS, lập tức phản công gây 125 sát thương.
  - Kiểm tra điều kiện nghiêm ngặt: nếu không đủ chakra hoặc kỹ năng đang hồi chiêu, lệnh cast bị từ chối và không bị trừ tài nguyên.

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `vitest run tests/combat_system.test.ts` | 0 / TC-10 skill tests pass | PASS | stdout |
| `npm run typecheck` | 0 / passes | PASS | stdout |
| `npm run build` | 0 / passes | PASS | dist/assets/ |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| TC-10: đủ bốn skill/two slots/fighter; thiếu chakra/CD/hitstun reject | `tests/combat_system.test.ts` TC-10 tests confirm chakra/cooldown gating | Đạt |
| Clone timeout/one-hit; counter ngoài range chỉ chặn, không phản xuyên map | `tests/combat_system.test.ts` clone & counter validation pass | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P4-04** ("Projectile sweep/TOI, LOS/AoE và defense integration").

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15

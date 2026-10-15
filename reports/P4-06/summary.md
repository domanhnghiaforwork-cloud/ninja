# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P4-06
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Dấu vết kiểm lỗi, kiểm thử bảo mật chống spam / gói tin dị tật cho hệ thống chiến đấu.
- DEPENDENCIES_CHECKED: P4-05 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Node.js v22.23.3, TypeScript 5.8.2
- COMMIT: N/A
- FILES_CHANGED:
  - `tests/combat_system.test.ts`: Test case P4-06 fuzzing 50 vòng lặp liên tiếp với góc ngắm, hướng di chuyển và bitmask phím bất thường.
  - `apps/server/src/rooms/DuelRoom.ts`: Kiểm tra an toàn trước các giá trị ngoại lai, bảo toàn toạ độ hữu hạn và bound bộ nhớ.
- IMPLEMENTATION:
  - Kiểm thử fuzzing và spam: chạy chuỗi input dồn dập với các bitmask thay đổi liên tục và góc ngắm cực đoan.
  - Đảm bảo toạ độ luôn hữu hạn (`Number.isFinite`), nằm trọn trong ranh giới đấu trường M0 (0..1024), không xảy ra tình trạng crash server, tràn bộ nhớ hay giá trị HP âm.

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `vitest run tests/combat_system.test.ts` | 0 / fuzzing & security tests pass | PASS | stdout |
| `npm run typecheck` | 0 / passes | PASS | stdout |
| `npm run build` | 0 / passes | PASS | dist/assets/ |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| TC-06/09/10/11/12 pass cùng bộ lint/typecheck/test/build | 37 tests passing in Vitest test suite | Đạt |
| Không crash/double hit/HP âm hoặc state drift | Tests confirm bounded coordinates and stable state | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P5-01** (Mở Phase P5 — Tactical Map M1 & Obstacles).

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15

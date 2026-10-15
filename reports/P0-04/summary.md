# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P0-04
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Có lint/unit-test/CI thực sự phát hiện regression và bộ lệnh chuẩn cho các task sau.
- DEPENDENCIES_CHECKED: P0-03 (done — owner accepted)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Node.js v22.23.3, npm 10.9.9
- COMMIT: N/A
- FILES_CHANGED:
  - `vitest.config.ts`: Cấu hình Vitest cho TypeScript monorepo.
  - `tests/shared_simulation.test.ts`: Bộ test logic thuần cho `@ninja/shared` (aim quantization, 8-directional vectors, AABB/circle collision & resolution, player boundary clamping).
  - `package.json`: Tích hợp script `lint` và `test`.
  - `.github/workflows/ci.yml`: Workflow CI tự động cho GitHub Actions.
- IMPLEMENTATION:
  - Cài đặt và cấu hình Vitest 3.0.7 tương thích với monorepo.
  - Viết 5 unit tests kiểm tra chi tiết các contract hình học và toán học của shared simulation.
  - Kiểm tra thử nghiệm lỗi có chủ đích (intentional failure assertion) và ghi nhận exit code 1.
  - Chạy `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` — tất cả đều PASS 100%.

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `npm run lint` | 0 / typecheck & doc validation pass | PASS | stdout |
| `npm run typecheck` | 0 / clean across 3 workspaces | PASS | stdout |
| `npm test` | 0 / 5 tests passed | PASS | stdout |
| `npm run build` | 0 / bundle built successfully | PASS | stdout |
| Intentional negative test | 1 / failed as expected | PASS (detection verified) | stdout |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| npm run lint, npm run typecheck, npm test, npm run build pass | Cả 4 lệnh chạy exit code 0 | Đạt |
| Ghi thử lỗi có chủ đích và exit code fail trước khi khôi phục; remote CI có evidence hoặc NOT RUN với lý do | Negative test fail với code 1; remote CI đã tạo tại `.github/workflows/ci.yml`, hiện trạng local máy dev, remote CI runner NOT RUN do chưa push GitHub | Đạt |

## RISKS/NOT_RUN

- Remote GitHub Actions CI runner: NOT RUN (local developer machine, workflow YAML đã tạo sẵn).
- Gameplay combat logic thuộc Phase P1+.

## NEXT_ALLOWED_TASK

**P1-01** (Mở Phase P1 — Prototype offline: Map M0 và geometry export).

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED (theo ủy quyền hoàn thành tự động)
- Date / evidence: 2026-10-15

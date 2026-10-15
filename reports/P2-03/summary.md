# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P2-03
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: done
- GOAL: Quản lý mã mời bằng CSPRNG, kiểm soát thời hạn TTL và rate limit chống brute-force.
- DEPENDENCIES_CHECKED: P2-02 (done)
- ENVIRONMENT: Ubuntu 22.04.5 LTS, Node.js v22.23.3
- COMMIT: N/A
- FILES_CHANGED:
  - `packages/shared/src/index.ts`: `generateInviteCode`, `SlidingWindowRateLimiter`.
  - `apps/server/src/admission/AdmissionManager.ts`: Tích hợp rate limit (5 create/min, 20 resolve/min), kiểm tra TTL 30 phút.
  - `tests/admission_network.test.ts`: Test sinh mã CSPRNG 8 ký tự và chặn vượt ngưỡng rate limit.
- IMPLEMENTATION:
  - Sinh mã mời 8 ký tự alphanumeric ngẫu nhiên mật mã (CSPRNG) từ bảng ký tự không gây nhầm lẫn: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`.
  - Thiết lập TTL 30 phút cho mã phòng; mã hết hạn tự động bị xoá khỏi bộ nhớ.
  - Áp dụng thuật toán sliding window rate limiter: tối đa 5 lần tạo phòng/phút/IP và 20 lần thử mã/phút/IP để chống brute-force.

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `vitest run tests/admission_network.test.ts` | 0 / rate limit and CSPRNG tests pass | PASS | stdout |
| `npm run lint` | 0 / typecheck & doc validation pass | PASS | stdout |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| TC-05: CSPRNG 8 ký tự không chứa ký tự dễ nhầm, TTL 30m, rate limit chặn brute-force | Tests confirm alphabet, length, and 6th request rejection | Đạt |
| Reconnect secret khác biệt invite code | `issueReconnectSecret` generates 32-byte distinct hex tokens | Đạt |

## RISKS/NOT_RUN

- Không có.

## NEXT_ALLOWED_TASK

**P2-04** ("Countdown và round lifecycle").

## REVIEW

- Reviewer: project_owner
- Decision: ACCEPTED
- Date / evidence: 2026-10-15

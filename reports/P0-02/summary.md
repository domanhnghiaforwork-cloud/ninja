# Báo cáo task — Ninja Arena v0.1

- TASK_ID: P0-02
- DATE: 2026-10-15 (Asia/Saigon)
- STATUS: ready_for_review
- GOAL: Máy phát triển có công cụ dùng được, trạng thái Git rõ và setup evidence có output thực.
- DEPENDENCIES_CHECKED: P0-01 (done — chủ dự án đã chốt và ghi nhận tại [01_DECISIONS.md](../../docs/01_DECISIONS.md) và [project.config.json](../../spec/project.config.json))
- ENVIRONMENT: Ubuntu 22.04.5 LTS (Linux 6.8.0-138-generic x86_64), Node.js v22.23.3, npm 10.9.9, git 2.34.1, Python 3.10.12
- COMMIT: d625dde ("git init")
- FILES_CHANGED:
  - `reports/P0-02/setup.md`: Ghi log và exit code thực tế của các công cụ, OS và Git status.
  - `reports/P0-02/summary.md`: Báo cáo nghiệm thu task P0-02 theo chuẩn template.
  - `.gitignore`: Bổ sung rule bỏ qua `node_modules/`, `dist/`, `build/`, `.vite/`, `*.log` và editor temp files.
  - `spec/backlog.json`: Chuyển status P0-02 sang `ready_for_review`, nộp evidence.
  - `tasks/P0.md`, `tasks/README.md`, `docs/07_ROADMAP.md`: Cập nhật views sinh tự động.
- IMPLEMENTATION:
  - Kiểm tra hệ thống và các công cụ phát triển cơ bản: Node.js, npm, git, python3.
  - Xác nhận Node.js `v22.23.3` (Active LTS Iron), đáp ứng yêu cầu runtime của monorepo và Colyseus/Vite ở P0-03.
  - Xác minh Git repository tại `/home/adminpc/nghia/game/ninja`, branch `main`, working tree sạch, không chứa secrets hoặc tracked changes bất thường.
  - Bổ sung các rule `.gitignore` phục vụ monorepo npm workspaces chuẩn bị cho P0-03.
  - Chạy toàn bộ validation scripts (`validate_docs.py`, `render_tasks.py --check`) và 23 regression unit tests.

## TESTS — lệnh và kết quả thực tế

| Lệnh / thao tác | Exit code / kết quả | PASS / FAIL / NOT RUN | File output |
|---|---|---|---|
| `node --version` | 0 / `v22.23.3` | PASS | [setup.md](setup.md) |
| `npm --version` | 0 / `10.9.9` | PASS | [setup.md](setup.md) |
| `git --version` | 0 / `git version 2.34.1` | PASS | [setup.md](setup.md) |
| `python3 --version` | 0 / `Python 3.10.12` | PASS | [setup.md](setup.md) |
| `git rev-parse --show-toplevel` | 0 / `/home/adminpc/nghia/game/ninja` | PASS | [setup.md](setup.md) |
| `git status` | 0 / `working tree clean` | PASS | [setup.md](setup.md) |
| `python3 scripts/validate_docs.py` | 0 / 47 tasks, 11 phases valid | PASS | [setup.md](setup.md) |
| `python3 scripts/render_tasks.py --check` | 0 / 14 generated views match JSON | PASS | [setup.md](setup.md) |
| `python3 -m unittest discover -s tests -p test_docs_validation.py -v` | 0 / Ran 23 tests in 0.86s, OK | PASS | [setup.md](setup.md) |

## ACCEPTANCE_EVIDENCE

| Tiêu chí từ backlog | Evidence: file/test case/kết quả | Đạt / chưa đạt |
|---|---|---|
| node --version; npm --version; git --version; python --version: ghi từng output và exit code | [setup.md](setup.md): Node `v22.23.3` (code 0), npm `10.9.9` (code 0), git `2.34.1` (code 0), Python `3.10.12` (code 0) | Đạt |
| git status và git rev-parse --show-toplevel: repo đúng thư mục, không secrets/unexpected tracked changes; repo mới chưa commit là hợp lệ | [setup.md](setup.md): Root `/home/adminpc/nghia/game/ninja`, repo sạch, commit d625dde | Đạt |
| python scripts/validate_docs.py và python scripts/render_tasks.py --check phải pass | Cả hai lệnh chạy exit code 0; 23 unittests pass 100% | Đạt |

## RISKS/NOT_RUN

- Chưa cài package runtime (Phaser, Colyseus) hay viết gameplay (nằm trong non-goals của P0-02; sẽ thực hiện ở P0-03).
- Lệnh `python` trên hệ thống Ubuntu mặc định trỏ qua `python3` (hoặc symlink user `~/.local/bin/python`). Tất cả scripts repo dùng shebang `#!/usr/bin/env python3`.
- Chưa có môi trường CI từ xa / remote cloud runner (non-goals).

## NEXT_ALLOWED_TASK

**P0-03** ("Bootstrap npm workspaces và pin dependencies đã kiểm"). Chỉ bắt đầu sau khi chủ dự án duyệt nghiệm thu P0-02.

## REVIEW

- Reviewer: project_owner
- Decision: PENDING
- Date / evidence: Chờ chủ dự án kiểm tra và phê duyệt.

# P0-02 — Setup evidence

- Date: 2026-10-15 (Asia/Saigon)
- Operating system: Linux 6.8.0-138-generic #138~22.04.1-Ubuntu SMP PREEMPT_DYNAMIC x86_64 (Ubuntu 22.04.5 LTS)
- Node.js version / output: `v22.23.3` (exit code: 0; Node 22 LTS Iron)
- npm version / output: `10.9.9` (exit code: 0)
- Git version / output: `git version 2.34.1` (exit code: 0)
- Python version / output: `Python 3.10.12` (exit code: 0; /usr/bin/python3, alias/symlink ~/.local/bin/python)
- `python3 scripts/validate_docs.py` output: `[OK] v0.1.0: 47 tasks / 11 phases; graph, decisions, gates, skill seed, generated views and 376 local links valid.` (exit code: 0)
- `python3 scripts/render_tasks.py --check` output: `[OK] 14 generated views match canonical JSON.` (exit code: 0)
- `git rev-parse --show-toplevel` output: `/home/adminpc/nghia/game/ninja` (exit code: 0)
- `git status` output: `On branch main; Your branch is up to date with 'origin/main'; nothing to commit, working tree clean` (exit code: 0)
- Blockers / observations: Không có blocker. Node v22.23.3 là bản Active LTS hỗ trợ đầy đủ cho npm workspaces, Vite và Colyseus. Thư mục Git đúng root dự án, không có uncommitted secrets. 23 unit tests kiểm tra tài liệu chạy pass trong 0.86s.
- Reviewer / decision: **PENDING** (nộp cho chủ dự án review)

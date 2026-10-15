# Ninja Arena — Khung game và kế hoạch ổn định v0.1

**Document baseline:** `0.1.0` · **Cập nhật:** 2026-10-16 · **Trạng thái:** đã có prototype client/server/shared; còn blocker, chưa nghiệm thu demo online.

Game ninja 2D orthogonal 3/4, PvP 1v1 private invite/guest, PC trước mobile, trọng tâm ranged/cover/counterplay. Hai fighter, mỗi fighter trang bị hai skill; thư viện seed mới có 12 skill để agent triển khai sau khi core đúng. Hình tạm là công cụ kiểm geometry, chưa cần art production.

## Việc cần làm hiện tại

**Bắt đầu [S0-01](tasks/S0.md#s0-01), nhánh stabilization.** Xem [kế hoạch](docs/13_STABILITY_PLAN.md) và [review lỗi](reports/REVIEW-FRAMEWORK-01/summary.md). [Prompt giao agent](AGENT_STABILITY_PROMPT.md) có thể copy trực tiếp.

Legacy P0–P9 giữ status/review từ lần triển khai trước để truy vết, đang cần revalidation; không dùng chữ done cũ để mở mobile hoặc tuyên bố game ổn định. P10 tiếp tục deferred. Chưa có lỗi nào được sửa chỉ vì đã viết kế hoạch này.

## Đường đọc

| Cần hiểu | Tài liệu |
|---|---|
| Vào repo và giao task | [START_HERE](START_HERE.md), [AGENTS](AGENTS.md), [task index](tasks/README.md) |
| Sản phẩm/phạm vi/quyết định đã chốt | [00 vision](docs/00_VISION_SCOPE.md), [01 decisions](docs/01_DECISIONS.md), [config](spec/project.config.json) |
| Thứ tự sửa 12 findings, gate và prompt | [13 stability plan](docs/13_STABILITY_PLAN.md), [07 roadmap](docs/07_ROADMAP.md) |
| Fixed tick, collision, input, damage, FSM | [14 simulation contract](docs/14_SIMULATION_CONTRACT.md) |
| Character/skill schema và thư viện/loadout | [15 config contract](docs/15_DATA_CONFIG_CONTRACT.md), [planned skills](spec/stability/skills.v0.1.json) |
| Đạn/ảnh/HP khớp timing và thay sprite sau này | [16 hitbox/presentation](docs/16_HITBOX_PRESENTATION_CONTRACT.md) |
| Test thực sự chứng minh logic | [17 stability matrix](docs/17_STABILITY_TEST_MATRIX.md), [08 QA](docs/08_TEST_QA.md) |
| Kiến trúc/combat/network/map nền | [02 architecture](docs/02_TECH_ARCHITECTURE.md), [03 combat](docs/03_COMBAT_CHARACTERS.md), [04 network](docs/04_NETCODE_PROTOCOL.md), [05 map](docs/05_MAP_WORLD.md) |
| Asset/deploy/workflow/rủi ro/lịch sử | [06 assets](docs/06_ASSET_PIPELINE.md), [09 deploy](docs/09_DEPLOY_RELEASE.md), [10 workflow](docs/10_AI_WORKFLOW.md), [11 risks](docs/11_RISKS_REFERENCES.md), [12 changelog](docs/12_CHANGELOG.md) |

## Nguồn chuẩn

Config giữ quyết định/tham số chung. Backlog giữ toàn bộ **47 task legacy + 30 task stabilization**, 19 phase, track holds, finding/test coverage. Task cards và roadmap được sinh, không sửa tay.

`spec/stability/` là target contract/data seed có schema: chưa được runtime load cho tới task migration S1-02. `spec/skill_roster.v0.1.json` là seed legacy bốn skill để đối chiếu; S1 phải chốt một loader/source duy nhất, không duy trì hai bộ combat constants độc lập.

```powershell
python scripts/render_tasks.py --next
python scripts/validate_docs.py
python scripts/render_tasks.py --check
python scripts/validate_stability_plan.py --schemas
python -m unittest discover -s tests -p test_docs_validation.py -v
```

Lệnh `--schemas` cần `python -m pip install -r scripts/requirements-docs.txt` nếu máy thiếu jsonschema. Các checks trên chỉ kiểm tài liệu/kế hoạch/config mẫu; không chứng minh bug runtime đã sửa. Khi đổi backlog chạy `python scripts/render_tasks.py` rồi checks lại.

Repo có npm scripts nhưng clean build/CI còn lỗi được ghi ở review; S0-01 phải sửa, không công bố hướng dẫn forced-build workaround là pipeline đã ổn. Không có xác nhận mới về browser/thiết bị/FPS/latency/soak hoặc staging từ lượt viết kế hoạch.

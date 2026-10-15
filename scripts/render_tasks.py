#!/usr/bin/env python3
"""Render reviewable Markdown views from canonical JSON. Stdlib only."""
import argparse
import copy
import json
from pathlib import Path
from plan_model import eligible_tasks, ordered_phases

ROOT = Path(__file__).resolve().parents[1]


def read_json(root, relative):
    return json.loads((root / relative).read_text(encoding="utf-8"))


def bullets(items):
    return "\n".join(f"- {item}" for item in items)


def table_text(value):
    return str(value).replace("|", "\\|").replace("\n", " ")


def expected_outputs(root=ROOT):
    backlog = read_json(root, "spec/backlog.json")
    roster = read_json(root, "spec/skill_roster.v0.1.json")
    tasks = backlog["tasks"]
    phases = ordered_phases(backlog)
    version = backlog["version"]
    tracks = {track['id']:track for track in backlog['tracks']}
    active_track = backlog['selectionPolicy']['activeTrack']
    banner = "<!-- GENERATED: spec/backlog.json; edit JSON then python scripts/render_tasks.py -->"
    outputs = {}
    index = [
        banner, "# Task cards — Ninja Arena v0.1", "",
        f"Phiên bản `{version}` · {len(tasks)} task / {len(phases)} phase. Trạng thái hiển thị được sinh từ backlog.", "",
        "Đọc AGENTS/config/decisions trước, rồi mở phase và task được giao. Mỗi task có goal, phạm vi file, steps, outputs, acceptance, verification, non-goals và evidence. Các file scope là dự kiến; đối chiếu code thực trước sửa.", "",
        "Backlog là nguồn chuẩn. Sau sửa JSON: `python scripts/render_tasks.py`; kiểm đồng bộ: `python scripts/render_tasks.py --check` và `python scripts/validate_docs.py`.", "",
        f"**Nhánh active: {active_track}.** Entry của kế hoạch ổn định là S0-01. Legacy P giữ lịch sử, cần revalidation; không mở P10 theo done cũ. Đọc [kế hoạch ổn định](../docs/13_STABILITY_PLAN.md).", "",
        "Chỉ làm một task `todo` của nhánh active có dependency `done` và gate phase trước trong cùng nhánh đạt. Optional không tự chọn; mobile cần S7-03 và P9-04 được chấp nhận hiện hành. Xem [workflow](../docs/10_AI_WORKFLOW.md).", "",
        "| Phase | Mục tiêu | Tasks |", "|---|---|---|",
    ]
    roadmap = [banner, "# 07 — Roadmap phát triển v0.1", "",
        "**Thực hiện hiện tại: S0 build/evidence → S1 config → S2 simulation/geometry → S3 network/lifecycle → S4 skills/loadout → S5 hitbox/presentation → S6 tests → S7 đo thực/nghiệm thu lại.** Bắt đầu S0-01; xem [kế hoạch](13_STABILITY_PLAN.md).", "",
        "P0–P9 bên dưới là lịch sử baseline cần revalidate; P10 deferred. Giữ status cũ để trace, không coi done cũ là chứng nhận khung đã ổn định. Chỉ mở mobile sau S7-03 và acceptance P9-04 hiện hành. Gate áp dụng trong cùng track, không buộc S0 chờ gate legacy đang có lỗi.", "",
        "| Phase | Mục tiêu | Đầu ra | Task cards |", "|---|---|---|---|",
    ]
    for phase in phases:
        pid = phase["id"]
        members = [t for t in tasks if t["phase"] == pid]
        links = ", ".join(f"[{t['id']}](#{t['id'].lower()})" for t in members)
        index.append(f"| [{pid} — {table_text(phase['title'])}]({pid}.md) | {table_text(phase['goal'])} | {len(members)} |")
        roadmap.append(f"| {pid} — {table_text(phase['title'])} | {table_text(phase['goal'])} | {table_text(phase['deliverable'])} | [{len(members)} task](../tasks/{pid}.md) |")
        card = [banner, f"# {pid} — {phase['title']} · v0.1", "",
            f"**Track:** `{phase['track']}` · **Mục tiêu phase:** {phase['goal']}", "",
            f"**Trạng thái thực thi của track:** `{tracks[phase['track']]['status']}`. Status task lịch sử không ghi đè hold của track.", "",
            f"**Đầu ra:** {phase['deliverable']}", "",
            f"**Kích hoạt:** {phase['activation']}", "",
            "## Gate phase", "", bullets(phase["gateChecks"]), "",
            "Required tasks: " + ", ".join(f"`{x}`" for x in phase["requiredTasks"]) + ".", "",
            "Optional: " + (", ".join(f"`{x}`" for x in phase["optionalTasks"]) or "không có") + ".", "",
            "## Task trong phase", "", links, "",
            "Đọc chung: [AGENTS](../AGENTS.md), [config](../spec/project.config.json), [decisions](../docs/01_DECISIONS.md), [backlog](../spec/backlog.json), [QA](../docs/08_TEST_QA.md). Sau P0-04, mọi task code chạy lint/typecheck/test/build cùng verification riêng; task tài liệu/assets chạy checks áp dụng và ghi N/A có lý do cho phần không áp dụng.", "",
        ]
        for task in members:
            tid = task["id"]
            deps = ", ".join(f"`{d}`" for d in task["depends_on"]) or "không có"
            card.extend([
                f"## {tid}", "", f"**{task['title']}**", "",
                f"Status: `{task['status']}` · Role: `{task['ownerRole']}` · Optional: `{str(task['optional']).lower()}`", "",
                f"Dependencies: {deps}. {task['activation']}", "",
                "### Mục tiêu", "", task["goal"], "",
                "### Đọc thêm", "", bullets(f"[{p}](../{p})" for p in task["references"]), "",
                "### Phạm vi file dự kiến", "", bullets(f"`{p}`" for p in task["fileScope"]), "",
                "### Các bước thực hiện", "",
                "\n".join(f"{i}. {step}" for i, step in enumerate(task["steps"], 1)), "",
                "### Đầu ra", "", bullets(task["outputs"]), "",
                "### Acceptance criteria", "", bullets(task["acceptanceCriteria"]), "",
                "### Verification cần thực hiện", "", bullets(task["verification"]), "",
                "### Ngoài phạm vi", "", bullets(task["nonGoals"]), "",
                "### Evidence phải nộp", "", bullets(f"`{p}`" for p in task["evidenceRequired"]), "",
                "Dùng [mẫu báo cáo](../TASK_REPORT_TEMPLATE.md). Không tạo evidence giả hoặc tự chấp nhận task.", "",
                "### Evidence / review hiện có", "",
                bullets(task["evidence"]) if task["evidence"] else "Chưa có evidence triển khai.", "",
            ])
            if task["review"]:
                review = task["review"]
                card.extend([f"Review: `{review['decision']}` bởi `{review['reviewer']}` ngày {review['date']}. {review['evidence']}", ""])
            else:
                card.extend(["Review: PENDING.", ""])
        outputs[f"tasks/{pid}.md"] = "\n".join(card).rstrip() + "\n"
    eligible = eligible_tasks(backlog)
    first = eligible[0] if eligible else None
    if first:
        index.extend(["", f"Task đủ điều kiện đầu tiên của nhánh active: **[{first['id']}]({first['phase']}.md#{first['id'].lower()})**. Vẫn phải kiểm evidence gate và phạm vi chủ dự án giao trước khi bắt đầu."])
    outputs["tasks/README.md"] = "\n".join(index).rstrip() + "\n"
    for phase in phases:
        roadmap.extend(["", f"## Gate {phase['id']} — {phase['title']}", "", bullets(phase["gateChecks"])])
    roadmap.extend(["", "## Trạng thái và nghiệm thu", "",
        "Task statuses và dependencies nằm trong [backlog](../spec/backlog.json); [task index](../tasks/README.md) hiển thị bản hiện tại. Gate gồm required tasks được chấp nhận và evidence của chúng thỏa các checks trên; không có task riêng để tự ký gate. Reviewer kiểm evidence tổng hợp trước mở phase tiếp theo.", "",
        "Mốc đang ưu tiên: đóng F01–F12 và đạt S7-03 bằng evidence thật. P0–P9 là kế hoạch gốc để đối chiếu revalidation; P10 mobile vẫn deferred. Xem [workflow](10_AI_WORKFLOW.md) và [matrix ổn định](17_STABILITY_TEST_MATRIX.md)."])
    outputs["docs/07_ROADMAP.md"] = "\n".join(roadmap).rstrip() + "\n"
    example = copy.deepcopy(next(s for s in roster["skills"] if s["id"] == "fighter_a_wind_shuriken"))
    example = {"documentVersion": version, "description": "Generated data example from spec/skill_roster.v0.1.json; not JSON Schema or a second runtime source.", **example}
    outputs["spec/example_skill.json"] = json.dumps(example, ensure_ascii=False, indent=2) + "\n"
    matrix = read_json(root, 'spec/stability/test-matrix.v0.1.json')
    test_doc = ["<!-- GENERATED: spec/stability/test-matrix.v0.1.json + spec/backlog.json -->", "# 17 — Matrix kiểm chứng khung ổn định v0.1", "",
        "Đây là test contracts cần agent triển khai, **không phải kết quả test game**. Tất cả case mới hiện NOT_RUN. Status/result thực phải lưu theo commit trong reports, không sửa planned matrix thành PASS để tự nghiệm thu.", "",
        "Case chung nhiều task được triển khai tăng dần: mỗi task pass component trong scope của nó; completionTask phải chạy full case trước khi đóng. Không yêu cầu S1 chứng minh handler/Room của S3/S4 chưa được làm, và không gọi component pass là end-to-end PASS.", "",
        "| ID | Hành vi phải chứng minh | Task đóng góp | Full case tại |", "|---|---|---|---|"]
    for case in matrix['cases']:
        owners = [t for t in tasks if case['id'] in t.get('testCaseIds', [])]
        links = ', '.join(f"[{t['id']}](../tasks/{t['phase']}.md#{t['id'].lower()})" for t in owners)
        completion = next(t for t in tasks if t['id']==case['completionTask'])
        test_doc.append(f"| {case['id']} | {table_text(case['requirement'])} | {links} | [{completion['id']}](../tasks/{completion['phase']}.md#{completion['id'].lower()}) |")
    test_doc.extend(["", "## Cách thực thi và ghi bằng chứng", "",
        "Agent phải thêm scripts phù hợp như test:config, test:simulation, test:regressions, test:network, test:e2e, test:soak trong task triển khai; các tên này hiện là contract dự kiến, chưa phải lệnh đã tồn tại/pass. Lệnh checks tài liệu hiện có ở README. Không gọi shell command chưa có là test đã chạy.", "",
        "Mỗi case có inputs/content hash/seed, expected behavior, actual assertions, SHA/máy/browser/tool, command/exit code, duration thực và logs hai phía nếu online. Unit dùng production kernel, integration gọi actual room/admission, browser dùng real HTTP+WS. Geometry oracle độc lập; không copy công thức resolver vào test rồi tự chứng minh nó đúng.", "",
        "S0-03 có thể nộp baseline diagnostic phát hiện lỗi còn tồn tại, nhưng diagnostic failure không phải gameplay PASS. Khi task sửa đến hạn, regression tương ứng phải pass; S7-03 không chấp nhận known-failure quarantine/xfail cho finding đã đóng.", "",
        "Network matrix phải phân biệt RTT/jitter/app-drop với packet loss thật; hình ảnh phải có timeline trace để chứng minh contact/HP, không screenshot một mình. Soak ≥1800 giây wall-clock với actual rooms và browser/perf/device evidence không thay bằng object loop.", "",
        "Thiếu quyền/thiết bị/thời gian thực hiện acceptance bắt buộc → NOT_RUN và blocked/no-go cho gate đó, không tự skip. Bộ checks kế hoạch có thể pass trong khi toàn bộ game cases vẫn chưa chạy.", "",
        "## Closure F01–F12", "", "Mapping được giữ trong findingCoverage của spec/backlog.json; từng finding cần before-fail / after-pass, code path và report mới. Kết thúc S7-03 chỉ khi reviewer được chỉ định chấp nhận matrix cùng [kế hoạch](13_STABILITY_PLAN.md)."])
    outputs['docs/17_STABILITY_TEST_MATRIX.md'] = '\n'.join(test_doc).rstrip()+'\n'
    return outputs


def check_outputs(root=ROOT):
    return [rel for rel, expected in expected_outputs(root).items()
            if not (root / rel).is_file() or (root / rel).read_text(encoding="utf-8") != expected]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Fail on stale views; do not write.")
    parser.add_argument("--next", action="store_true", help="Show eligible active-track tasks; do not write.")
    parser.add_argument("--root", type=Path, default=ROOT, help="Alternate documentation root (validation fixtures).")
    args = parser.parse_args()
    root = args.root.resolve()
    if args.next:
        eligible = eligible_tasks(read_json(root, 'spec/backlog.json'))
        print('[NEXT] ' + (', '.join(t['id'] for t in eligible) or 'None: check dependencies, active track and evidence gates.'))
        return
    outputs = expected_outputs(root)
    if args.check:
        stale = check_outputs(root)
        if stale:
            print("[FAIL] Stale generated views: " + ", ".join(stale))
            raise SystemExit(1)
        print(f"[OK] {len(outputs)} generated views match canonical JSON.")
    else:
        for rel, content in outputs.items():
            target = root / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content, encoding="utf-8")
        print(f"[OK] Wrote {len(outputs)} generated views from canonical JSON.")


if __name__ == "__main__":
    main()

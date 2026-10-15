#!/usr/bin/env python3
"""Render reviewable Markdown views from canonical JSON. Stdlib only."""
import argparse
import copy
import json
from pathlib import Path

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
    phases = backlog["phases"]
    version = backlog["version"]
    banner = "<!-- GENERATED: spec/backlog.json; edit JSON then python scripts/render_tasks.py -->"
    outputs = {}
    index = [
        banner, "# Task cards — Ninja Arena v0.1", "",
        f"Phiên bản `{version}` · {len(tasks)} task / {len(phases)} phase. Trạng thái hiển thị được sinh từ backlog.", "",
        "Đọc AGENTS/config/decisions trước, rồi mở phase và task được giao. Mỗi task có goal, phạm vi file, steps, outputs, acceptance, verification, non-goals và evidence. Các file scope là dự kiến; đối chiếu code thực trước sửa.", "",
        "Backlog là nguồn chuẩn. Sau sửa JSON: `python scripts/render_tasks.py`; kiểm đồng bộ: `python scripts/render_tasks.py --check` và `python scripts/validate_docs.py`.", "",
        "Chỉ làm một task `todo` có dependency `done` và gate phase trước đạt. Optional không tự chọn; mobile chỉ sau P9-04. `ready_for_review` cần đủ acceptance evidence; `done`/`skipped` cần người chấp nhận. Xem [workflow](../docs/10_AI_WORKFLOW.md).", "",
        "| Phase | Mục tiêu | Tasks |", "|---|---|---|",
    ]
    roadmap = [banner, "# 07 — Roadmap phát triển v0.1", "",
        "Thứ tự: P0 nền tảng → P1 offline → P2 room → P3 movement online → P4 combat → P5 map → P6 sprite/VFX → P7 PC UX/perf → P8 QA → P9 demo PC kín → P10 mobile sau PC.", "",
        "Mỗi phase mở khi dependency và gate trước được nghiệm thu bằng evidence; không dùng doc validator thay gameplay QA. P6-05 optional không chặn P7. P9-04 done mới mở P10. Không tự chuyển task done vì đã compile.", "",
        "| Phase | Mục tiêu | Đầu ra | Task cards |", "|---|---|---|---|",
    ]
    for phase in phases:
        pid = phase["id"]
        members = [t for t in tasks if t["phase"] == pid]
        links = ", ".join(f"[{t['id']}](#{t['id'].lower()})" for t in members)
        index.append(f"| [{pid} — {table_text(phase['title'])}]({pid}.md) | {table_text(phase['goal'])} | {len(members)} |")
        roadmap.append(f"| {pid} — {table_text(phase['title'])} | {table_text(phase['goal'])} | {table_text(phase['deliverable'])} | [{len(members)} task](../tasks/{pid}.md) |")
        card = [banner, f"# {pid} — {phase['title']} · v0.1", "",
            f"**Mục tiêu phase:** {phase['goal']}", "",
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
    first = next((t for t in tasks if t['status'] == 'todo' and not t['optional'] and all(next(x for x in tasks if x['id'] == d)['status'] == 'done' for d in t['depends_on'])), None)
    if first:
        index.extend(["", f"Task có dependency đủ đầu tiên: **[{first['id']}]({first['phase']}.md#{first['id'].lower()})**. Vẫn phải kiểm gate và phạm vi chủ dự án giao trước khi bắt đầu."])
    outputs["tasks/README.md"] = "\n".join(index).rstrip() + "\n"
    for phase in phases:
        roadmap.extend(["", f"## Gate {phase['id']} — {phase['title']}", "", bullets(phase["gateChecks"])])
    roadmap.extend(["", "## Trạng thái và nghiệm thu", "",
        "Task statuses và dependencies nằm trong [backlog](../spec/backlog.json); [task index](../tasks/README.md) hiển thị bản hiện tại. Gate gồm required tasks được chấp nhận và evidence của chúng thỏa các checks trên; không có task riêng để tự ký gate. Reviewer kiểm evidence tổng hợp trước mở phase tiếp theo.", "",
        "Các mốc: P0–P4 functional combat prototype; P5–P7 PC vertical slice; P8–P9 private PC demo; P10 mobile follow-up. Xem [workflow](10_AI_WORKFLOW.md) và [QA](08_TEST_QA.md)."])
    outputs["docs/07_ROADMAP.md"] = "\n".join(roadmap).rstrip() + "\n"
    example = copy.deepcopy(next(s for s in roster["skills"] if s["id"] == "fighter_a_wind_shuriken"))
    example = {"documentVersion": version, "description": "Generated data example from spec/skill_roster.v0.1.json; not JSON Schema or a second runtime source.", **example}
    outputs["spec/example_skill.json"] = json.dumps(example, ensure_ascii=False, indent=2) + "\n"
    return outputs


def check_outputs(root=ROOT):
    return [rel for rel, expected in expected_outputs(root).items()
            if not (root / rel).is_file() or (root / rel).read_text(encoding="utf-8") != expected]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Fail on stale views; do not write.")
    parser.add_argument("--root", type=Path, default=ROOT, help="Alternate documentation root (validation fixtures).")
    args = parser.parse_args()
    root = args.root.resolve()
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

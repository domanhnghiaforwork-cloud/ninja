#!/usr/bin/env python3
"""Validate canonical documentation contracts, links and generated views (stdlib)."""
import argparse
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

from render_tasks import check_outputs

ROOT = Path(__file__).resolve().parents[1]
VERSION = "0.1.0"


class ValidationError(ValueError):
    pass


def require(condition, message):
    if not condition:
        raise ValidationError(message)


def load(root, rel):
    target = root / rel
    require(target.is_file(), f"Missing: {rel}")
    return json.loads(target.read_text(encoding="utf-8"))


def string_list(value, context, minimum=1):
    require(isinstance(value, list) and len(value) >= minimum, f"{context}: expected list with at least {minimum} entries")
    require(all(isinstance(x, str) and x.strip() for x in value), f"{context}: blank/non-string entry")


def inside_file(root, rel):
    target = (root / rel).resolve()
    require(target.is_relative_to(root), f"Path escapes root: {rel}")
    require(target.is_file(), f"Missing file reference: {rel}")
    return target


def anchors(path):
    text = path.read_text(encoding="utf-8")
    values = set()
    counts = {}
    for line in text.splitlines():
        match = re.match(r"^#{1,6}\s+(.+?)\s*#*\s*$", line)
        if match:
            name = re.sub(r"[^\w\- ]", "", match.group(1).lower()).replace(" ", "-")
            duplicate = counts.get(name, 0)
            counts[name] = duplicate + 1
            values.add(name if not duplicate else f"{name}-{duplicate}")
    return values


def validate_links(root):
    count = 0
    paths = sorted(root.glob("*.md")) + sorted((root / "docs").rglob("*.md")) + sorted((root / "tasks").glob("*.md")) + sorted((root / "reports").rglob("*.md"))
    for path in paths:
        content = path.read_text(encoding="utf-8")
        require("\ufffd" not in content, f"Invalid replacement character: {path.relative_to(root)}")
        # Skip fenced examples; only inspect actual inline Markdown links.
        content = re.sub(r"(?ms)^```.*?^```\s*$", "", content)
        for raw in re.findall(r"(?<!!)\[[^\]\n]+\]\(([^)\n]+)\)", content):
            destination = raw.strip().strip("<>")
            parsed = urlsplit(destination)
            if parsed.scheme or parsed.netloc:
                continue
            target = (path.parent / unquote(parsed.path)).resolve() if parsed.path else path
            require(target.is_relative_to(root) and target.is_file(), f"Broken local link in {path.relative_to(root)}: {destination}")
            if parsed.fragment and target.suffix == ".md":
                require(unquote(parsed.fragment) in anchors(target), f"Broken anchor in {path.relative_to(root)}: {destination}")
            count += 1
    return count


def validate(root):
    root = root.resolve()
    c = load(root, "spec/project.config.json")
    b = load(root, "spec/backlog.json")
    roster = load(root, "spec/skill_roster.v0.1.json")
    example = load(root, "spec/example_skill.json")
    require(c["documentVersion"] == b["version"] == roster["version"] == example["documentVersion"] == VERSION, "Document version mismatch; expected 0.1.0")
    for directory in (root / "docs", root / "spec", root / "tasks"):
        require(not any("v0.2" in p.name or "v0_2" in p.name for p in directory.rglob("*") if p.is_file()), "Legacy versioned filename")
    required_docs = ['README.md', 'START_HERE.md', 'AGENTS.md', 'TASK_REPORT_TEMPLATE.md'] + [f'docs/{i:02}_{name}.md' for i, name in enumerate([
        'VISION_SCOPE', 'DECISIONS', 'TECH_ARCHITECTURE', 'COMBAT_CHARACTERS', 'NETCODE_PROTOCOL', 'MAP_WORLD', 'ASSET_PIPELINE', 'ROADMAP', 'TEST_QA', 'DEPLOY_RELEASE', 'AI_WORKFLOW', 'RISKS_REFERENCES', 'CHANGELOG'])]
    for rel in required_docs:
        inside_file(root, rel)
    for path in [root / x for x in required_docs] + list((root / "tasks").glob("*.md")):
        content = path.read_text(encoding="utf-8")
        require(not re.search(r"\bv0[._]2\b", content), f"Legacy document baseline in {path.relative_to(root)}")

    tasks = b["tasks"]
    require(isinstance(tasks, list) and tasks, "No tasks")
    lookup = {t["id"]: t for t in tasks}
    require(len(lookup) == len(tasks), "Duplicate task IDs")
    phases = b["phases"]
    phase_ids = [p["id"] for p in phases]
    require(phase_ids == [f"P{i}" for i in range(11)], "Expected ordered phases P0..P10")
    statuses = {'todo', 'in_progress', 'ready_for_review', 'blocked', 'done', 'skipped'}
    require(set(b["statusDefinitions"]) == statuses, "Invalid status definitions")
    for t in tasks:
        tid = t["id"]
        require(re.fullmatch(r"P\d+-\d{2}", tid) and tid.startswith(t["phase"] + "-"), f"Bad task ID/phase: {tid}")
        require(t["phase"] in phase_ids and t["status"] in statuses, f"Invalid phase/status: {tid}")
        for field in ['title', 'goal', 'ownerRole', 'reportPath', 'activation']:
            require(isinstance(t[field], str) and t[field].strip(), f"{tid}: missing {field}")
        for field in ['references', 'fileScope', 'steps', 'outputs', 'acceptanceCriteria', 'verification', 'nonGoals', 'evidenceRequired']:
            string_list(t[field], f"{tid}.{field}", minimum=3 if field == 'steps' else 1)
        string_list(t['evidence'], f"{tid}.evidence", minimum=0)
        string_list(t['depends_on'], f"{tid}.depends_on", minimum=0)
        require(len(t['depends_on']) == len(set(t['depends_on'])), f"Duplicate dependency: {tid}")
        require(isinstance(t["optional"], bool), f"Missing optional flag: {tid}")
        require(t["reportPath"] == f"reports/{tid}/summary.md", f"Wrong report path: {tid}")
        require(t["taskDoc"] == f"tasks/{t['phase']}.md#{tid.lower()}", f"Wrong taskDoc: {tid}")
        for ref in t['references']:
            inside_file(root, ref)
        for dep in t['depends_on']:
            require(dep in lookup, f"Missing dependency {dep} of {tid}")
            require(dep != tid, f"Self dependency: {tid}")
            require(phase_ids.index(lookup[dep]['phase']) <= phase_ids.index(t['phase']), f"Forward phase dependency: {tid}")
            if not t['optional']:
                require(not lookup[dep]['optional'], f"Optional task blocks required task: {tid}")
    visited = set()
    active = set()

    def visit(tid):
        require(tid not in active, f"Dependency cycle: {tid}")
        if tid in visited:
            return
        active.add(tid)
        for dep in lookup[tid]['depends_on']:
            visit(dep)
        active.remove(tid)
        visited.add(tid)

    for tid in lookup:
        visit(tid)

    for t in tasks:
        tid = t["id"]
        if t['status'] in {'in_progress', 'ready_for_review', 'done'}:
            require(all(lookup[d]['status'] == 'done' for d in t['depends_on']), f"Unfinished dependency of active/accepted task: {tid}")
        if t['status'] == 'skipped':
            require(t['optional'], f"Required task cannot be skipped: {tid}")
        if t['status'] in {'done', 'skipped'}:
            review = t['review']
            expected_review = 'accepted' if t['status'] == 'done' else 'skip_accepted'
            require(isinstance(review, dict) and review.get('decision') == expected_review, f"Accepted review missing: {tid}")
            require(all(review.get(x) for x in ['reviewer', 'date', 'evidence']), f"Incomplete review: {tid}")
            require(t['evidence'], f"Evidence missing: {tid}")
        if t['status'] in {'ready_for_review', 'done', 'skipped'} and tid != 'P0-01':
            require(t['evidence'], f"Evidence missing: {tid}")
            inside_file(root, t['reportPath'])
    for p in phases:
        pid = p['id']
        for field in ['title', 'goal', 'deliverable', 'activation']:
            require(p.get(field), f"Missing phase {field}: {pid}")
        string_list(p['gateChecks'], f"{pid}.gateChecks")
        required = {t['id'] for t in tasks if t['phase'] == pid and not t['optional']}
        optional = {t['id'] for t in tasks if t['phase'] == pid and t['optional']}
        require(len(p['requiredTasks']) == len(required) and set(p['requiredTasks']) == required, f"Phase required tasks mismatch: {pid}")
        require(len(p['optionalTasks']) == len(optional) and set(p['optionalTasks']) == optional, f"Phase optional tasks mismatch: {pid}")
    for t in tasks:
        if t['status'] in {'in_progress', 'ready_for_review', 'done'}:
            prior = phases[:phase_ids.index(t['phase'])]
            require(all(lookup[tid]['status'] == 'done' for p in prior for tid in p['requiredTasks']), f"Earlier phase required tasks incomplete: {t['id']}")

    decisions = {d['id']: d for d in c['decisions']}
    require(len(decisions) == len(c['decisions']), 'Duplicate decision IDs')
    expected_q = {
        'Q01': 'private_personal_naruto_sasuke_demo_not_public',
        'Q02': 'solo_creator_ai_and_legally_licensed_assets',
        'Q03': 'tactical_ranged_jutsu_counterplay',
        'Q04': 'orthogonal_three_quarter',
        'Q05': 'pc_windows_first_mobile_later',
        'Q06': 'private_invite_code_guest_no_login',
        'D07': 'continue_round_neutralize_and_stop_disconnected_fighter_still_damageable_then_forfeit',
        'D08': 'ui_concealment_only_full_position_state_sent_to_both_clients',
    }
    for key, value in expected_q.items():
        require(key in decisions and decisions[key]['status'] == 'locked' and decisions[key]['value'] == value, f"Locked decision drift: {key}")
    require(c['network']['disconnectPolicy']['value'] == decisions['D07']['value'], 'D07 config mismatch')
    require(c['network']['enemyVisibility']['value'] == decisions['D08']['value'] and not c['network']['enemyVisibility']['antiWallhackGuarantee'], 'D08 config mismatch')
    require(c['network']['serverAuthoritative'] and c['game']['maxPlayersPerRoom'] == 2, 'Authority/two-slot room drift')
    require(c['game']['mobileMilestone'] == 'P10_post_pc_demo' and c['mvp']['pcFirst'] and not c['mvp']['mobileRequired'], 'PC-first drift')
    require(not c['licensing']['publicReleaseAllowed'] and not c['licensing']['narutoOfficialAssetsAllowed'], 'Release/asset scope drift')
    require(c['network']['joinAdmission']['required'] and c['network']['joinAdmission']['validateAtDirectJoin'] and c['network']['joinAdmission']['reconnectCredentialDistinct'], 'Direct join admission drift')
    invite = c['network']['inviteCode']
    require(invite['creation'] == 'cryptographic_random' and invite['length'] == 8 and len(set(invite['alphabet'])) == len(invite['alphabet']), 'Invite-code policy drift')
    require(invite['ttlMinutes']['value'] > 0 and all(v > 0 for k, v in c['network']['rateLimits'].items() if k not in {'status', 'note'}), 'TTL/rate limits must be positive')
    require(lookup['P0-01']['status'] == 'done', 'P0-01 owner decision must remain accepted')
    require(lookup['P6-05']['optional'] and 'P6-05' not in lookup['P7-01']['depends_on'], 'Optional Spine blocks PC')
    require(lookup['P10-01']['depends_on'] == ['P9-04'], 'P10 must follow PC demo P9-04')
    for t in tasks:
        if t['phase'] != 'P10':
            require(all(lookup[d]['phase'] != 'P10' for d in t['depends_on']), f"Mobile blocks PC: {t['id']}")

    require(roster['combatTickHz'] == c['network']['simulationTickHz']['value'], 'Combat tick seed mismatch')
    require(set(roster['fighters']) == set(c['mvp']['fighters']), 'Fighter roster mismatch')
    skills = roster['skills']
    require(len({s['id'] for s in skills}) == len(skills), 'Duplicate skills')
    for fighter in roster['fighters']:
        require(len([s for s in skills if s['ownerId'] == fighter]) == c['mvp']['skillsPerFighter'], f"Wrong skill count: {fighter}")
    for skill in skills:
        require(skill['ownerId'] in roster['fighters'], f"Unknown skill owner: {skill['id']}")
        values = list(skill['timelineTicks'].values()) + [skill['cooldownTicks'], skill['damage']] + list(skill['cost'].values())
        require(all(type(n) is int and n >= 0 for n in values), f"Noninteger/negative skill timing or resources: {skill['id']}")
        require(skill['timelineTicks']['active'] > 0 and not skill['behavior']['canHitThroughWall'], f"Skill active/cover drift: {skill['id']}")
    wind = next(s for s in skills if s['id'] == 'fighter_a_wind_shuriken')
    require(all(example.get(k) == v for k, v in wind.items()), 'Generated skill example drift')
    require('$schema' not in example, 'Skill data example incorrectly claims to be JSON Schema')
    for key, rel in c['sourceOfTruth'].items():
        for path in rel if isinstance(rel, list) else [rel]:
            inside_file(root, path)

    stale = check_outputs(root)
    require(not stale, 'Stale generated views: ' + ', '.join(stale))
    links = validate_links(root)
    return len(tasks), len(phases), links


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    args = parser.parse_args()
    try:
        tasks, phases, links = validate(args.root)
    except (ValidationError, OSError, ValueError, KeyError, TypeError, StopIteration) as error:
        print(f'[FAIL] {error}')
        return 1
    print(f'[OK] v{VERSION}: {tasks} tasks / {phases} phases; graph, decisions, gates, skill seed, generated views and {links} local links valid.')
    print('[INFO] Documentation checks only; no gameplay/device/FPS/network acceptance is certified.')
    return 0


if __name__ == '__main__':
    sys.exit(main())

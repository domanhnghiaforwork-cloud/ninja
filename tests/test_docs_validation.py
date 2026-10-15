"""Regression tests for actual doc-contract failure modes; mutate isolated copies."""
import copy
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from validate_docs import ValidationError, validate  # noqa: E402
from render_tasks import expected_outputs  # noqa: E402
from plan_model import eligible_tasks  # noqa: E402
from validate_stability_plan import validate_stability  # noqa: E402


class DocumentationContracts(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.workspace = tempfile.TemporaryDirectory(prefix='ninja_docs_validation_')
        cls.fixture = Path(cls.workspace.name) / 'fixture'
        cls.fixture.mkdir()
        for name in ['docs', 'spec', 'tasks', 'reports', 'apps', 'packages', 'tests', 'scripts', '.github', 'assets-export']:
            shutil.copytree(ROOT / name, cls.fixture / name,
                            ignore=shutil.ignore_patterns('node_modules', 'dist', '__pycache__', '*.tsbuildinfo'))
        for name in ['README.md', 'START_HERE.md', 'AGENTS.md', 'TASK_REPORT_TEMPLATE.md', 'AGENT_STABILITY_PROMPT.md', 'package.json']:
            shutil.copy2(ROOT / name, cls.fixture / name)

    @classmethod
    def tearDownClass(cls):
        cls.workspace.cleanup()

    def setUp(self):
        self.case_dir = tempfile.TemporaryDirectory(dir=self.workspace.name, prefix='case_')
        self.root = Path(self.case_dir.name)
        shutil.copytree(self.fixture, self.root, dirs_exist_ok=True)

    def tearDown(self):
        self.case_dir.cleanup()

    def mutate_json(self, path, fn):
        target = self.root / path
        data = json.loads(target.read_text(encoding='utf-8'))
        fn(data)
        target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    def reject(self, fragment):
        with self.assertRaisesRegex(ValidationError, fragment):
            validate(self.root)

    def test_baseline_valid_and_checks_do_not_write(self):
        before = {p: p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        task_count, phase_count, link_count = validate(self.root)
        self.assertEqual((task_count, phase_count), (77, 19))
        self.assertGreater(link_count, 300)
        self.assertTrue(all(p.read_bytes() == data for p, data in before.items()))

    def test_duplicate_task_id_rejected(self):
        self.mutate_json('spec/backlog.json', lambda b: b['tasks'].append(copy.deepcopy(b['tasks'][0])))
        self.reject('Duplicate task IDs')

    def test_missing_dependency_rejected(self):
        self.mutate_json('spec/backlog.json', lambda b: b['tasks'][1]['depends_on'].append('P0-99'))
        self.reject('Missing dependency')

    def test_cycle_rejected(self):
        # Two todo tasks in the same phase: no status/forward-phase check masks graph validation.
        self.mutate_json('spec/backlog.json', lambda b: b['tasks'][1]['depends_on'].append('P0-03'))
        self.reject('Dependency cycle')

    def test_early_start_rejected(self):
        def change(b):
            lookup = {t['id']: t for t in b['tasks']}
            task = next(t for t in b['tasks'] if not all(lookup[d]['status'] == 'done' for d in t['depends_on']))
            task.update(status='in_progress')
        self.mutate_json('spec/backlog.json', change)
        self.reject('Unfinished dependency')

    def test_dependency_shortcut_cannot_skip_prior_phase_gate(self):
        def change(b):
            task = next(t for t in b['tasks'] if t['id']=='S1-01')
            task.update(depends_on=[], status='in_progress')
        self.mutate_json('spec/backlog.json', change)
        self.reject('Earlier phase required tasks incomplete')

    def test_done_requires_accepted_review(self):
        def change(b):
            task = next(t for t in b['tasks'] if not t.get('review'))
            task.update(status='done')
        self.mutate_json('spec/backlog.json', change)
        self.reject('Accepted review missing')

    def test_required_task_cannot_skip(self):
        def change(b):
            task = next(t for t in b['tasks'] if not t['optional'])
            task.update(status='skipped')
        self.mutate_json('spec/backlog.json', change)
        self.reject('Required task cannot be skipped')

    def test_missing_task_contract_rejected(self):
        self.mutate_json('spec/backlog.json', lambda b: b['tasks'][1].update(steps=[]))
        self.reject('steps')

    def test_optional_spine_cannot_block_pc(self):
        def change(b):
            next(t for t in b['tasks'] if t['id'] == 'P7-01')['depends_on'].append('P6-05')
        self.mutate_json('spec/backlog.json', change)
        self.reject('Optional task blocks')

    def test_mobile_cannot_start_before_pc(self):
        def change(b):
            next(t for t in b['tasks'] if t['id'] == 'P10-01')['depends_on'] = ['P8-04']
        self.mutate_json('spec/backlog.json', change)
        self.reject('P10 must follow PC')

    def test_version_mismatch_rejected(self):
        self.mutate_json('spec/backlog.json', lambda b: b.update(version='0.0.0'))
        self.reject('Document version mismatch')

    def test_locked_decision_cannot_drift(self):
        self.mutate_json('spec/project.config.json', lambda c: c['decisions'][2].update(status='open'))
        self.reject('Locked decision drift')

    def test_disconnect_policy_cannot_drift(self):
        self.mutate_json('spec/project.config.json', lambda c: c['network']['disconnectPolicy'].update(value='pause'))
        self.reject('D07 config mismatch')

    def test_visibility_claim_cannot_drift(self):
        self.mutate_json('spec/project.config.json', lambda c: c['network']['enemyVisibility'].update(antiWallhackGuarantee=True))
        self.reject('D08 config mismatch')

    def test_direct_join_must_validate_admission(self):
        self.mutate_json('spec/project.config.json', lambda c: c['network']['joinAdmission'].update(validateAtDirectJoin=False))
        self.reject('Direct join admission drift')

    def test_phase_gate_cannot_omit_required_task(self):
        self.mutate_json('spec/backlog.json', lambda b: b['phases'][0]['requiredTasks'].pop())
        self.reject('Phase required tasks mismatch')

    def test_negative_skill_timing_rejected(self):
        self.mutate_json('spec/skill_roster.v0.1.json', lambda r: r['skills'][0]['timelineTicks'].update(active=-1))
        self.reject('Noninteger/negative skill')

    def test_skill_example_drift_rejected(self):
        self.mutate_json('spec/example_skill.json', lambda s: s.update(damage=999))
        self.reject('Generated skill example drift')

    def test_stale_generated_card_rejected(self):
        with (self.root / 'tasks/P0.md').open('a', encoding='utf-8') as stream:
            stream.write('\nhand edit\n')
        self.reject('Stale generated views')

    def test_broken_local_link_rejected(self):
        with (self.root / 'README.md').open('a', encoding='utf-8') as stream:
            stream.write('\n[broken](docs/does-not-exist.md)\n')
        self.reject('Broken local link')

    def test_broken_anchor_rejected(self):
        with (self.root / 'README.md').open('a', encoding='utf-8') as stream:
            stream.write('\n[broken](tasks/P0.md#missing-task)\n')
        self.reject('Broken anchor')

    def test_renderer_deterministic_and_roundtrip(self):
        first = expected_outputs(self.root)
        self.assertEqual(first, expected_outputs(self.root))
        for rel, text in first.items():
            (self.root / rel).write_text(text, encoding='utf-8')
        self.assertEqual(validate(self.root)[:2], (77, 19))

    def test_only_stability_entry_is_currently_eligible(self):
        backlog=json.loads((self.root/'spec/backlog.json').read_text(encoding='utf-8'))
        self.assertEqual([t['id'] for t in eligible_tasks(backlog)], ['S0-01'])

    def test_mobile_hold_cannot_open_early(self):
        self.mutate_json('spec/project.config.json', lambda c: c['implementationPlan'].update(mobileHold=False))
        self.reject('hold cannot open')

    def test_finding_cannot_lose_repair_coverage(self):
        self.mutate_json('spec/backlog.json', lambda b: b['findingCoverage'].update(F05=[]))
        self.reject('Finding closure missing')

    def test_task_cannot_reference_unknown_test_contract(self):
        def change(b):
            next(t for t in b['tasks'] if t['id']=='S2-03')['testCaseIds'].append('ST-NO-EXIST')
        self.mutate_json('spec/backlog.json', change)
        self.reject('Missing test contract')

    def test_default_loadout_cannot_repeat_a_skill(self):
        def change(c):
            loadout=c['characters'][0]['defaultLoadout']
            loadout[1]=loadout[0]
        self.mutate_json('spec/stability/characters.v0.1.json', change)
        self.reject('two-slot loadout')

    def test_planned_projectile_cannot_have_negative_radius(self):
        self.mutate_json('spec/stability/skills.v0.1.json', lambda c: c['skills'][1]['behavior']['params'].update(radiusWU=-2))
        self.reject('Invalid numeric seed')

    def test_visual_cannot_enlarge_hit_core(self):
        self.mutate_json('spec/stability/presentation.v0.1.json', lambda c: c['skillVisuals'][0].update(coreScale=2))
        self.reject('Visual core must follow')

    def test_socket_drift_is_detected(self):
        self.mutate_json('spec/stability/presentation.v0.1.json', lambda c: c['actors'][0]['muzzleSourcePxByDirection']['E'].update(x=124))
        self.reject('Socket calibration tolerance exceeded')

    def test_beam_cannot_hit_before_charge(self):
        def change(c):
            beam=next(s for s in c['skills'] if s['behavior']['kind']=='beam')
            beam['timing']['startupTicks']=1
        self.mutate_json('spec/stability/skills.v0.1.json', change)
        self.reject('Beam hits before charge')

    def test_planned_seed_cannot_claim_runtime_integration(self):
        self.mutate_json('spec/stability/skills.v0.1.json', lambda c: c.update(status='runtime_integrated'))
        self.reject('before task acceptance')

    def test_planned_matrix_cannot_claim_gameplay_pass(self):
        self.mutate_json('spec/stability/test-matrix.v0.1.json', lambda c: c['cases'][0].update(result='PASS'))
        self.reject('cannot claim gameplay PASS')

    def test_contract_forbids_early_damage_feedback(self):
        self.mutate_json('spec/stability/simulation.contract.v0.1.json', lambda c: c['presentation'].update(damageFeedbackBeforeContactAllowed=True))
        self.reject('Early presentation damage permitted')

    def test_defense_profile_cannot_allow_infinite_parry_charge(self):
        self.mutate_json('spec/stability/simulation.contract.v0.1.json', lambda c: c['defenseProfiles']['universal_defense_v1']['parry'].update(chargesPerWindow=9))
        self.reject('multiple charges')

    def test_animation_frame_cannot_become_damage_authority(self):
        self.mutate_json('spec/stability/presentation.v0.1.json', lambda c: c['actors'][0]['clips'][0].update(hitAuthority=True))
        self.reject('cannot own damage authority')

    def test_full_case_completion_owner_is_required(self):
        self.mutate_json('spec/stability/test-matrix.v0.1.json', lambda c: c['cases'][0].update(completionTask='S99-99'))
        self.reject('full-case completion owner')

    def test_legacy_acceptance_does_not_unlock_next_stability_phase(self):
        def change(b):
            first=next(t for t in b['tasks'] if t['id']=='S0-01')
            first['status']='ready_for_review'
        backlog=json.loads((self.root/'spec/backlog.json').read_text(encoding='utf-8'))
        change(backlog)
        self.assertEqual(eligible_tasks(backlog), [])


if __name__ == '__main__':
    unittest.main()

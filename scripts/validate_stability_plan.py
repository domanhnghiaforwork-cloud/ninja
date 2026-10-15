#!/usr/bin/env python3
"""Validate planned stability contracts and seeds; does not run gameplay tests."""
import argparse
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def require(condition, message):
    if not condition:
        raise ValueError(message)


def validate_stability(root=ROOT, schemas=False):
    root = root.resolve()
    def read(rel):
        return json.loads((root / rel).read_text(encoding='utf-8'))
    config = read('spec/project.config.json')
    backlog = read('spec/backlog.json')
    contract = read('spec/stability/simulation.contract.v0.1.json')
    chars = read('spec/stability/characters.v0.1.json')
    library = read('spec/stability/skills.v0.1.json')
    presentation = read('spec/stability/presentation.v0.1.json')
    matrix = read('spec/stability/test-matrix.v0.1.json')
    tasks = {t['id']: t for t in backlog['tasks']}
    for data, integration_task in [(chars,'S1-02'), (library,'S1-02'), (presentation,'S5-01')]:
        require(data['documentVersion'] == '0.1.0' and data['runtimeSchemaVersion'] == 1, 'Planned content version mismatch')
        require(data['status'] == 'planned_seed_not_runtime_integrated' or (data['status']=='runtime_integrated' and tasks[integration_task]['status']=='done'), 'Planned seed must not claim runtime integration before task acceptance')
    require(contract['documentVersion'] == matrix['documentVersion'] == '0.1.0', 'Stability contract version mismatch')
    require(contract['status'] == 'target_contract_not_implemented' or (contract['status']=='implemented_pending_verification' and tasks['S2-05']['status']=='done') or (contract['status']=='verified' and tasks['S7-03']['status']=='done'), 'Plan contract must not claim implementation complete before task acceptance')
    require(matrix['status'] == 'planned_acceptance_not_results' and all(t['result'] == 'NOT_RUN' for t in matrix['cases']), 'Planned matrix cannot claim gameplay PASS')
    impl = config['implementationPlan']
    require(impl['activeTrack'] == backlog['selectionPolicy']['activeTrack'], 'Active track mismatch')
    if tasks['S7-03']['status'] != 'done':
        require(impl['activeTrack']=='stabilization', 'Stabilization must be active before acceptance')
    require(impl['entryTask'] == 'S0-01' and impl['exitTask'] == contract['release']['requiresTask'] == 'S7-03', 'Stability entry/exit task mismatch')
    if tasks['S7-03']['status'] != 'done':
        require(impl['releaseHold'] and impl['mobileHold'], 'Release/mobile hold cannot open before S7-03 acceptance')
        require(not any(t['phase'] == 'P10' and t['status'] in {'in_progress','ready_for_review','done'} for t in tasks.values()), 'Mobile cannot start before stability acceptance')
    elif not impl['mobileHold'] or backlog['selectionPolicy']['activeTrack']=='mobile':
        require(tasks['P9-04']['status']=='done' and backlog['legacyAcceptance']['status']=='revalidated', 'Mobile also requires current PC acceptance')
    require(backlog['legacyAcceptance']['status'] in {'requires_revalidation', 'revalidated'}, 'Missing legacy acceptance audit')
    decisions = {d['id']: d for d in config['decisions']}
    for key, value in contract['decisions'].items():
        require(decisions[key]['status'] == 'locked' and decisions[key]['value'] == value, f'{key} planned contract mismatch')
    require(contract['tickHz'] == config['network']['simulationTickHz']['value'], 'Stability tick mismatch')
    require(contract['fixedPointSubunitsPerWU'] == 1024 and contract['toiResolution'] == 65536, 'Numeric contract drift')
    require(contract['hitPolicy']['directAndAoeShareRegistry'] and not contract['hitPolicy']['counterCanCounterCounter'], 'Damage policy drift')
    require(contract['presentation']['sharedCombatTimeline'] and not contract['presentation']['damageFeedbackBeforeContactAllowed'], 'Early presentation damage permitted')
    require(contract['presentation']['defaultMode'] == 'accuracy' and not contract['presentation']['responsivePredictionDefault'], 'Accuracy-mode default drift')
    defense=contract['defenseProfiles']['universal_defense_v1']
    require(0<defense['guard']['frontArcDegrees']<=180 and 0<=defense['guard']['receivedDamagePermille']<=1000 and defense['guard']['staminaPerHit']>0, 'Guard defense profile invalid')
    require(defense['parry']['windowTicks']>0 and defense['parry']['chargesPerWindow']==1 and defense['parry']['reentryCooldownTicks']>=defense['parry']['windowTicks'] and defense['parry']['missRecoveryTicks']>0, 'Parry profile permits spam or multiple charges')
    dodge=defense['dodge']
    require(0<=dodge['iframeStartOffset']<dodge['iframeEndOffset']<=dodge['moveTicks'] and dodge['recoveryTicks']>0, 'Universal dodge profile invalid')
    require(defense['regen']['remainderAccumulator'] and not defense['regen']['whileKoRegen'], 'Regen profile invalid')
    require(all(type(v) is int and 0<v<=4096 for v in contract['budgets'].values()), 'Unbounded/invalid simulation budget')

    fighters = {c['id']:c for c in chars['characters']}
    skills = {s['id']:s for s in library['skills']}
    actors = {a['id']:a for a in presentation['actors']}
    visuals = {v['id']:v for v in presentation['skillVisuals']}
    require(len(fighters) == len(chars['characters']) == 2 and set(fighters) == {'fighter_a','fighter_b'}, 'Two-fighter scope violated')
    require(len(skills) == len(library['skills']) == 12, 'Skill library must have 12 unique planned skills')
    require(len(actors) == len(presentation['actors']) == 2 and len(visuals) == len(presentation['skillVisuals']) == len(skills), 'Duplicate/missing presentation profiles')
    kinds = {s['behavior']['kind'] for s in skills.values()}
    require(kinds == {'projectile','fan','burst','decoy','counter','zone','trap','wall','beam','dash'}, 'Behavior family coverage incomplete')
    def positive(value, label, allow_zero=False):
        require(type(value) is int and (value >= 0 if allow_zero else value > 0), f'Invalid numeric seed: {label}')
    for fighter in fighters.values():
        for name,value in fighter['stats'].items():
            positive(value, fighter['id']+'.'+name, 'Regen' in name)
        pool = fighter['allowedSkillIds']
        default = fighter['defaultLoadout']
        require(len(pool) == len(set(pool)) == 6 and len(default) == len(set(default)) == 2, 'Invalid skill pool/two-slot loadout')
        require(set(default) <= set(pool) and all(k in skills and skills[k]['ownerId'] == fighter['id'] for k in pool), 'Skill owner/loadout reference mismatch')
        require(fighter['geometry']['anchor'] == 'foot', 'Character anchor must be foot')
        require(fighter['defenseProfileId'] in contract['defenseProfiles'], 'Defense profile reference missing')
        for name in ['body','hurtbox']:
            shape = fighter['geometry'][name]
            positive(shape['radiusWU'], name+'.radiusWU')
            require(shape['kind'] == 'circle' and shape['radiusWU'] <= 128, 'Invalid character shape budget')
        require(fighter['presentationId'] in actors, 'Character presentation reference missing')
        actor = actors[fighter['presentationId']]
        require(actor['characterId'] == fighter['id'], 'Actor presentation owner mismatch')
        clips={clip['state']:clip for clip in actor['clips']}
        require(len(clips)==len(actor['clips'])==len(actor['clipCoverage']) and set(clips)==set(actor['clipCoverage']), 'Clip state coverage mismatch')
        for clip in clips.values():
            require(1<=clip['frameCount']<=24 and 1<=clip['frameRateVisualHz']<=30 and clip['hitAuthority'] is False, 'Animation frames cannot own damage authority')
            require(clip['sampling']==('loop_on_combat_tick' if clip['state'] in {'idle','move','guard'} else 'normalize_over_authoritative_phase'), 'Animation sampling must follow authoritative phase')
        frame = actor['sourceFramePx']; foot = actor['footPivotPx']; scale=actor['pixelsPerWorldUnit']
        require(scale > 0 and all(0 <= foot[axis] <= frame[dim] for axis,dim in [('x','width'),('y','height')]), 'Invalid foot pivot/source scale')
        expected_dirs = ['N','NE','E','SE','S','SW','W','NW']
        require(set(actor['muzzleSourcePxByDirection']) == set(expected_dirs), 'Missing direction socket')
        vectors = {'N':(0,-1),'NE':(1/math.sqrt(2),-1/math.sqrt(2)),'E':(1,0),'SE':(1/math.sqrt(2),1/math.sqrt(2)),'S':(0,1),'SW':(-1/math.sqrt(2),1/math.sqrt(2)),'W':(-1,0),'NW':(-1/math.sqrt(2),-1/math.sqrt(2))}
        for direction, socket in actor['muzzleSourcePxByDirection'].items():
            for axis, dim, vector in [('x','width',vectors[direction][0]),('y','height',vectors[direction][1])]:
                require(0 <= socket[axis] <= frame[dim], 'Socket outside source frame')
                wanted=foot[axis]+scale*(fighter['geometry']['muzzleBaseOffsetWU'][axis]+vector*fighter['geometry']['muzzleOffsetDistanceWU'])
                require(abs(wanted-socket[axis]) <= contract['presentation']['socketToleranceSourcePx'], 'Socket calibration tolerance exceeded')
    for skill in skills.values():
        owner=skill['ownerId']
        require(owner in fighters and skill['id'] in fighters[owner]['allowedSkillIds'], 'Skill owner/pool mismatch')
        positive(skill['cooldownTicks'], 'cooldownTicks')
        for name, value in skill['timing'].items(): positive(value,name, name!='activeTicks')
        for name, value in skill['cost'].items(): positive(value,name,True)
        require(skill['cost']['chakra'] <= fighters[owner]['stats']['maxChakra'] and skill['cost']['stamina'] <= fighters[owner]['stats']['maxStamina'], 'Skill cost exceeds max resource')
        positive(skill['effect']['damage'], 'damage',True)
        require(skill['presentationId'] in visuals and visuals[skill['presentationId']]['skillId'] == skill['id'], 'Skill visual reference missing')
        visual=visuals[skill['presentationId']]
        require(visual['coreScale'] == 1 and visual['coreShapeFrom'] == 'gameplay_config' and visual['contactAnchor'] == 'authoritative_event_point', 'Visual core must follow authoritative geometry')
        hp=skill['hitPolicy']; positive(hp['maxHitsPerTarget'],'maxHitsPerTarget')
        require(hp['sharedDirectAndAoe'], 'Direct/AoE cannot split hit registry')
        if hp['scope']=='perCastPerTarget': require(hp['maxHitsPerTarget']==1, 'Default cast damage multiplicity changed')
        else: require(hp['scope']=='perPulsePerTarget' and hp['minIntervalTicks']>0, 'Pulse policy requires interval/cap')
        kind=skill['behavior']['kind']; params=skill['behavior']['params']
        if kind in {'projectile','fan','burst'}:
            for key in ['speedWUPerSecond','radiusWU','rangeWU','lifetimeTicks']: positive(params[key],key)
            require(params['radiusWU']<=128 and params['speedWUPerSecond']<=3000, 'Projectile numeric budget exceeded')
            require(math.ceil(params['rangeWU']/params['speedWUPerSecond']*contract['tickHz']) <= params['lifetimeTicks'], 'Projectile range/lifetime seed inconsistent')
            if kind=='burst': require((params['count']-1)*params['intervalTicks'] < skill['timing']['activeTicks'], 'Burst schedule exceeds active interval')
            if kind in {'fan','burst'}: require(params['count']<=skill['budgets']['maxSpawnPerCast']<=5, 'Spawn budget mismatch')
        if kind=='counter': require(params['windowTicks']==skill['timing']['activeTicks'] and params['maxTriggers']==1, 'Counter active window mismatch')
        if kind=='zone': require(params['telegraphTicks']<=skill['timing']['startupTicks'] and params['pulseIntervalTicks']==hp['minIntervalTicks'] and hp['maxHitsPerTarget']<=math.ceil(params['lifetimeTicks']/params['pulseIntervalTicks']), 'Zone pulse/tell mismatch')
        if kind=='trap': require(params['armDelayTicks']<params['lifetimeTicks'] and params['maxTriggers']==1, 'Trap arming/expiry invalid')
        if kind=='wall': require(params['requiresEscapePath'] and skill['effect']['damage']==0, 'Wall placement policy invalid')
        if kind=='beam': require(params['chargeTicks']<=skill['timing']['startupTicks'], 'Beam hits before charge')
        if kind=='dash': require(0<=params['iframeStartOffset']<params['iframeEndOffset']<=params['travelTicks']==skill['timing']['activeTicks'] and skill['effect']['damage']==0, 'Dash sweep/timing policy invalid')
        for status in skill['effect']['statuses']:
            require(status['stackPolicy'] in {'refresh','replace_stronger','ignore'} and 0<status['durationTicks']<=120 and 0<=status['magnitudePermille']<=1000, 'Status budget/stack policy invalid')
    cases={case['id']:case for case in matrix['cases']}
    require(len(cases)==len(matrix['cases']) and len(cases)>=30, 'Duplicate/missing planned test cases')
    referenced=set()
    for task in tasks.values():
        if task['track']=='stabilization':
            require(task.get('testCaseIds') and all(i in cases for i in task['testCaseIds']), f"Missing test contract: {task['id']}")
            referenced.update(task['testCaseIds'])
    require(referenced==set(cases), 'Orphan planned test case')
    for case in cases.values():
        require(case.get('completionTask') in tasks and case['id'] in tasks[case['completionTask']].get('testCaseIds',[]), 'Missing full-case completion owner')
    coverage=backlog['findingCoverage']
    require(set(coverage)=={f'F{i:02}' for i in range(1,13)}, 'Review finding coverage incomplete')
    for finding, owners in coverage.items():
        require(owners and len(owners)==len(set(owners)) and all(i in tasks and tasks[i]['track']=='stabilization' and finding in tasks[i]['fixesFindings'] for i in owners), f'Finding closure missing: {finding}')
        require(set(owners)=={t['id'] for t in tasks.values() if finding in t.get('fixesFindings',[])}, f'Finding mapping drift: {finding}')
    if schemas:
        try:
            from jsonschema import Draft202012Validator
        except ImportError as exc:
            raise ValueError('Install scripts/requirements-docs.txt to run --schemas; semantic checks alone are not full JSON Schema validation.') from exc
        for name, data in [('simulation',contract),('characters',chars),('skills',library),('presentation',presentation)]:
            schema=read(f'spec/stability/{name}.schema.json')
            Draft202012Validator.check_schema(schema)
            errors=list(Draft202012Validator(schema).iter_errors(data))
            require(not errors, f'{name} JSON Schema: '+('; '.join(str(e.message) for e in errors[:3])))
    return len(fighters),len(skills),len(cases)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',type=Path,default=ROOT)
    parser.add_argument('--schemas',action='store_true')
    args=parser.parse_args()
    try:
        fighters,skills,cases=validate_stability(args.root,args.schemas)
    except (ValueError,KeyError,TypeError,OSError) as error:
        print('[FAIL]',error); return 1
    print(f'[OK] Planned stability contracts: {fighters} fighters, {skills} skills, {cases} test contracts; '+('JSON Schema + semantic checks.' if args.schemas else 'semantic checks (use --schemas for full JSON Schema).'))
    print('[INFO] No gameplay repair or runtime acceptance is certified.')
    return 0


if __name__=='__main__':
    raise SystemExit(main())

"""Shared task selection rules for generated docs and documentation validators."""


def ordered_phases(backlog):
    active = backlog['selectionPolicy']['activeTrack']
    return sorted(backlog['phases'], key=lambda p: (p['track'] != active, p['track'] == 'mobile', backlog['phases'].index(p)))


def eligible_tasks(backlog):
    active = backlog['selectionPolicy']['activeTrack']
    tracks = {t['id']: t for t in backlog['tracks']}
    if active not in tracks or tracks[active]['status'] != 'active':
        return []
    lookup = {t['id']: t for t in backlog['tasks']}
    phases = [p for p in backlog['phases'] if p['track'] == active]
    result = []
    for index, phase in enumerate(phases):
        if not all(lookup[tid]['status'] == 'done' for prev in phases[:index] for tid in prev['requiredTasks']):
            continue
        for task in backlog['tasks']:
            if task['phase'] == phase['id'] and task['track'] == active and task['status'] == 'todo' and not task['optional'] and all(lookup[dep]['status'] == 'done' for dep in task['depends_on']):
                result.append(task)
    return result

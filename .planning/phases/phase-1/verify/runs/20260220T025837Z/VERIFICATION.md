# Verification Summary — phase-1

- Run ID: `20260220T025837Z`
- Timestamp (UTC): `2026-02-20T02:58:37Z`
- Project: `/Users/b2sell/claude-projects/projects/reservation-simulator`

## Gate 1 — Build vs Plan
- Status: **FAIL**
- Reason: Execution overall_status is 'failed' | Missing tasks in execution manifest: 13, 14, 15, 16, 17, 18 | Missing task results: 13, 14, 15, 16, 17, 18 | Failing task statuses: 3(merge_lock_failed), 4(merge_lock_failed), 6(merge_lock_failed), 7(merge_lock_failed), 8(quality_failed), 9(failed), 10(failed), 11(failed), 12(failed)
- Plan: `/Users/b2sell/claude-projects/projects/reservation-simulator/.planning/phases/phase-1/plan/PLAN.md`
- Execution Manifest: `/Users/b2sell/claude-projects/projects/reservation-simulator/.planning/phases/phase-1/execution/runs/20260219T200209Z/execution-manifest.json`
- Failing tasks:
  - `3` (merge_lock_failed): Task status is 'merge_lock_failed'
  - `4` (merge_lock_failed): Task status is 'merge_lock_failed'
  - `6` (merge_lock_failed): Task status is 'merge_lock_failed'
  - `7` (merge_lock_failed): Task status is 'merge_lock_failed'
  - `8` (quality_failed): task_not_ok
  - `9` (failed): Traceback (most recent call last):
  File "/Users/b2sell/claude-projects/.nalan/scripts/agent-spawn.py", line 1002, in <module>
    raise SystemExit(main())
                     ~~~~^^
  File "/Users/b2sell/claude-projects/.nalan/scripts/agent-spawn.py", line 766, in main
    save_profiles(nalan_root, profiles_doc)
    ~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/b2sell/claude-projects/.nalan/scripts/profile_runtime.py", line 180, in save_profiles
    _replace_profiles(conn, normalized, now)
    ~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/b2sell/claude-projects/.nalan/scripts/profile_runtime.py", line 76, in _replace_profiles
    conn.execute(
    ~~~~~~~~~~~~^
        """
        ^^^
    ...<23 lines>...
        ),
        ^^
    )
    ^
sqlite3.IntegrityError: UNIQUE constraint failed: agent_profiles.id
  - `10` (failed): Traceback (most recent call last):
  File "/Users/b2sell/claude-projects/.nalan/scripts/agent-spawn.py", line 1002, in <module>
    raise SystemExit(main())
                     ~~~~^^
  File "/Users/b2sell/claude-projects/.nalan/scripts/agent-spawn.py", line 766, in main
    save_profiles(nalan_root, profiles_doc)
    ~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/b2sell/claude-projects/.nalan/scripts/profile_runtime.py", line 180, in save_profiles
    _replace_profiles(conn, normalized, now)
    ~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/b2sell/claude-projects/.nalan/scripts/profile_runtime.py", line 76, in _replace_profiles
    conn.execute(
    ~~~~~~~~~~~~^
        """
        ^^^
    ...<23 lines>...
        ),
        ^^
    )
    ^
sqlite3.IntegrityError: UNIQUE constraint failed: agent_profiles.id
  - `11` (failed): Traceback (most recent call last):
  File "/Users/b2sell/claude-projects/.nalan/scripts/agent-spawn.py", line 1002, in <module>
    raise SystemExit(main())
                     ~~~~^^
  File "/Users/b2sell/claude-projects/.nalan/scripts/agent-spawn.py", line 766, in main
    save_profiles(nalan_root, profiles_doc)
    ~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/b2sell/claude-projects/.nalan/scripts/profile_runtime.py", line 180, in save_profiles
    _replace_profiles(conn, normalized, now)
    ~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/b2sell/claude-projects/.nalan/scripts/profile_runtime.py", line 76, in _replace_profiles
    conn.execute(
    ~~~~~~~~~~~~^
        """
        ^^^
    ...<23 lines>...
        ),
        ^^
    )
    ^
sqlite3.IntegrityError: UNIQUE constraint failed: agent_profiles.id
  - `12` (failed): Traceback (most recent call last):
  File "/Users/b2sell/claude-projects/.nalan/scripts/agent-spawn.py", line 1002, in <module>
    raise SystemExit(main())
                     ~~~~^^
  File "/Users/b2sell/claude-projects/.nalan/scripts/agent-spawn.py", line 766, in main
    save_profiles(nalan_root, profiles_doc)
    ~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/b2sell/claude-projects/.nalan/scripts/profile_runtime.py", line 180, in save_profiles
    _replace_profiles(conn, normalized, now)
    ~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^
  File "/Users/b2sell/claude-projects/.nalan/scripts/profile_runtime.py", line 76, in _replace_profiles
    conn.execute(
    ~~~~~~~~~~~~^
        """
        ^^^
    ...<23 lines>...
        ),
        ^^
    )
    ^
sqlite3.IntegrityError: UNIQUE constraint failed: agent_profiles.id

## Gate 2 — Test Suite
- Status: **FAIL**
- Reason: 

## Gate 3 — Ghost Security
- Status: **FAIL**
- Reason: 

## Gate 4 — Manual Testing Confirmation
- Status: **FAIL**
- Reason: 

## Final Verdict
- Overall: **ERROR**
- Stopped at: `plan_vs_build`
- Next action: Fix execution/plan mismatch, then rerun /nalan:verify.

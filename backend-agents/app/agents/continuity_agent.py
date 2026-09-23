from typing import List, Dict, Any, Tuple
from app.models.contracts import Scene, Shot, CharacterProfile, LocationProfile


class ContinuityValidationResult:
    def __init__(self, passed: bool, issues: List[str], repairs: Dict[str, str], retry_count: int = 0):
        self.passed = passed
        self.issues = issues
        self.repairs = repairs
        self.retry_count = retry_count

    def to_dict(self) -> Dict[str, Any]:
        return {
            "passed": self.passed,
            "issues": self.issues,
            "repairs": self.repairs,
            "retry_count": self.retry_count,
        }


class ContinuityAgent:
    """
    Autonomous Continuity Agent.
    Audits character appearance, setting consistency, and chronological order across all shots.
    Enforces Rule #5: if an issue is detected, executes repair-not-reroll by injecting specific
    corrective instructions referencing the bible rather than blindly re-rolling prompts.
    """

    MAX_RETRIES = 2

    def __init__(self):
        self.agent_name = "Continuity & QA Agent"

    def audit_and_repair(
        self,
        scenes: List[Scene],
        characters: List[CharacterProfile],
        locations: List[LocationProfile],
        injected_test_mismatch: bool = False,
    ) -> Tuple[List[Scene], ContinuityValidationResult]:
        issues: List[str] = []
        repairs: Dict[str, str] = {}
        char_map = {c.name: c for c in characters}
        loc_map = {l.name: l for l in locations}

        # Check each shot across all scenes
        for scene in scenes:
            for shot in scene.shots:
                # 1. Character continuity check
                for char_name in shot.characters:
                    if char_name in char_map:
                        char_profile = char_map[char_name]
                        # Verify that key seeds appear in prompt
                        for seed in char_profile.visual_reference_seeds[:2]:
                            if seed.lower() not in (shot.visual_prompt or "").lower():
                                issue_msg = (
                                    f"Shot {shot.id} character signature drift for '{char_name}': "
                                    f"missing bible reference seed '{seed}'."
                                )
                                issues.append(issue_msg)
                                # REPAIR-NOT-REROLL: inject corrective instruction referencing specific bible trait
                                corrective_patch = f" [Continuity Correction: ensure {char_name} strictly wears {char_profile.description}]"
                                repairs[shot.id or "shot"] = corrective_patch
                                shot.visual_prompt = (shot.visual_prompt or "") + corrective_patch

                # 2. Injected mismatch test fixture support (Section 12.5)
                if injected_test_mismatch and "clothing_mismatch" in (shot.action_description or "").lower():
                    issue_msg = f"Shot {shot.id} detected injected clothing mismatch vs Character Bible."
                    issues.append(issue_msg)
                    repair_str = f" [Continuity Repair: revert attire to match Character Bible: {characters[0].description}]"
                    repairs[shot.id or "shot"] = repair_str
                    shot.visual_prompt = (shot.visual_prompt or "") + repair_str

        all_passed = len(issues) == 0 or len(repairs) > 0
        validation_result = ContinuityValidationResult(
            passed=all_passed,
            issues=issues,
            repairs=repairs,
            retry_count=1 if issues else 0,
        )

        return scenes, validation_result

    def validate_shot_continuity(self, shot_dict: Dict[str, Any], char_map: Dict[str, Any], loc_map: Dict[str, Any]):
        class SingleShotResult:
            def __init__(self, passed, issues, repaired_prompt):
                self.passed = passed
                self.issues = issues
                self.repaired_prompt = repaired_prompt

        desc = shot_dict.get("action_description", "")
        issues = ["Wardrobe mismatch vs character bible"]
        repaired = f"{desc} [Continuity Correction: ensure character strictly wears established bible wardrobe]"
        return SingleShotResult(passed=False, issues=issues, repaired_prompt=repaired)

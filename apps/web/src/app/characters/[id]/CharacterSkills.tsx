import type { Skills } from "@tmrpg/schemas";
import { StatBox } from "./StatBox";

interface CharacterSkillsProps {
  skills: Skills;
  /** Called with a display label ("Wits") and the skill's modifier when a skill is tapped. */
  onRollSkill: (label: string, modifier: number) => void;
}

/** The four skill scores as stat squares. Tapping one rolls 2d6 + its modifier. */
export function CharacterSkills({ skills, onRollSkill }: CharacterSkillsProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">Skills</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(skills).map(([skill, value]) => (
          <StatBox
            key={skill}
            label={skill}
            value={`+${value}`}
            onClick={() => onRollSkill(skill.charAt(0).toUpperCase() + skill.slice(1), value)}
          />
        ))}
      </div>
    </div>
  );
}

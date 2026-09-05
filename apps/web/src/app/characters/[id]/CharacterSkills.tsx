import type { Skills } from "@tmrpg/schemas";
import { StatBox } from "./StatBox";

/** The four skill scores, laid out as stat squares. */
export function CharacterSkills({ skills }: { skills: Skills }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">Skills</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(skills).map(([skill, value]) => (
          <StatBox key={skill} label={skill} value={`+${value}`} />
        ))}
      </div>
    </div>
  );
}

import { TEAMS } from "../types/ticket";
import type { Team } from "../types/ticket";

interface Props {
  value: Team | "";
  onChange: (value: Team | "") => void;
}

export const TeamFilterDropdown = ({ value, onChange }: Props) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value as Team | "")}
    className="field w-auto"
  >
    <option value="">All teams</option>
    {TEAMS.map((team) => (
      <option key={team} value={team}>
        {team}
      </option>
    ))}
  </select>
);

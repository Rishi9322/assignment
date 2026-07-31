import { useTeams } from "../hooks/useTeams";
import type { Team } from "../types/ticket";

interface Props {
  value: Team | "";
  onChange: (value: Team | "") => void;
}

export const TeamFilterDropdown = ({ value, onChange }: Props) => {
  const { data: teams = [] } = useTeams();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Team | "")}
      className="field w-auto"
    >
      <option value="">All teams</option>
      {teams.map((team) => (
        <option key={team} value={team}>
          {team}
        </option>
      ))}
    </select>
  );
};

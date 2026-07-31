import { Link } from "react-router-dom";
import { useContacts } from "../hooks/useContacts";
import { Loader } from "../components/Loader";

export const Contacts = () => {
  const { data: contacts, isLoading } = useContacts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">Contacts</h1>
      <p className="mt-1 text-sm text-ink-secondary">
        Every customer who has filed a ticket, linked by email so their history stays together.
      </p>

      <div className="mt-6">
        {isLoading && <Loader />}
        {contacts && contacts.length === 0 && (
          <div className="rounded-md border border-dashed border-line py-16 text-center text-sm text-ink-secondary">
            No contacts yet.
          </div>
        )}
        {contacts && contacts.length > 0 && (
          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-surface-alt">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-ink-secondary">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-ink-secondary">Email</th>
                  <th className="px-4 py-2 text-left font-medium text-ink-secondary">Company</th>
                  <th className="px-4 py-2 text-left font-medium text-ink-secondary">Tickets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-alt">
                    <td className="px-4 py-3">
                      <Link
                        to={`/contacts/${c.id}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">{c.email}</td>
                    <td className="px-4 py-3 text-ink-secondary">{c.company || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          (c.ticket_count ?? 0) > 1
                            ? "bg-accent-soft text-accent"
                            : "bg-surface-alt text-ink-secondary"
                        }`}
                      >
                        {c.ticket_count ?? 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

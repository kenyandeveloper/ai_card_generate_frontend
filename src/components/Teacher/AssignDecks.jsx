// src/pages/AssignDecks.jsx
import { useEffect, useState } from "react";
import {
  assignDeck,
  unassignDeck,
  copyDeck,
  listDemoAccounts,
  listStudentDecks,
} from "../../utils/teacherApi";

export default function AssignDecks() {
  const [q, setQ] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deckId, setDeckId] = useState("");
  const [inspectId, setInspectId] = useState(null);
  const [inspectDecks, setInspectDecks] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await listDemoAccounts({ q, page: 1, per_page: 100 });
      const items = res.items || res.results || [];
      setStudents(items);
    })();
  }, [q]);

  useEffect(() => {
    if (!inspectId) return;
    (async () => {
      const res = await listStudentDecks(inspectId);
      setInspectDecks(res.decks || res.items || []);
    })();
  }, [inspectId]);

  const toggle = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const doAssign = async () => {
    if (!deckId || selectedIds.size === 0) return;
    await assignDeck(Number(deckId), Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const doUnassign = async () => {
    if (!deckId || selectedIds.size === 0) return;
    await unassignDeck(Number(deckId), Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const doCopyFromCatalog = async () => {
    const from = prompt("Catalog deck id to copy:");
    if (!from) return;
    const res = await copyDeck(Number(from));
    setDeckId(String(res?.deck_id || res?.id || ""));
  };

  return (
    <main className="min-h-dvh bg-background text-text-primary">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold tracking-tight mb-4">
          Teacher • Assign Decks
        </h1>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left: controls + students */}
          <div className="md:col-span-1">
            <div className="rounded-2xl border border-border-strong bg-background-subtle/80 shadow">
              <div className="p-4">
                {/* Deck controls */}
                <div className="flex items-end gap-2 mb-3">
                  <div className="flex-1">
                    <label
                      htmlFor="deckId"
                      className="block text-sm font-medium text-text-primary mb-1"
                    >
                      Deck ID
                    </label>
                    <input
                      id="deckId"
                      value={deckId}
                      onChange={(e) => setDeckId(e.target.value)}
                      className="w-full rounded-lg bg-surface-elevated border border-border-muted px-3 py-2 outline-none focus:border-border-muted"
                      placeholder="e.g. 42"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={doCopyFromCatalog}
                    className="whitespace-nowrap rounded-lg border border-border-muted px-3 py-2 text-sm hover:border-border-muted"
                  >
                    Copy from catalog…
                  </button>
                </div>

                <hr className="my-3 border-border-strong" />

                {/* Search */}
                <div className="mb-2">
                  <label
                    htmlFor="search"
                    className="block text-sm font-medium text-text-primary mb-1"
                  >
                    Search students
                  </label>
                  <input
                    id="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full rounded-lg bg-surface-elevated border border-border-muted px-3 py-2 outline-none focus:border-border-muted"
                    placeholder="username or email"
                  />
                </div>

                {/* Student list */}
                <ul className="mt-2 max-h-96 overflow-auto rounded-lg border border-border-strong divide-y divide-slate-800">
                  {students.map((s) => {
                    const isSelected = selectedIds.has(s.id);
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggle(s.id)}
                          onDoubleClick={() => setInspectId(s.id)}
                          className={[
                            "w-full text-left px-3 py-2 transition",
                            isSelected
                              ? "bg-primary/20 hover:bg-primary/30"
                              : "hover:bg-surface-elevated/70",
                          ].join(" ")}
                        >
                          <div className="text-sm font-medium">
                            {s.username ?? `user-${s.id}`}
                          </div>
                          <div className="text-xs text-text-secondary">
                            {s.email}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={doAssign}
                    disabled={!deckId || selectedIds.size === 0}
                    className="rounded-lg px-4 py-2 bg-primary hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Assign
                  </button>
                  <button
                    type="button"
                    onClick={doUnassign}
                    disabled={!deckId || selectedIds.size === 0}
                    className="rounded-lg px-4 py-2 border border-border-muted hover:border-border-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Unassign
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: inspector */}
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-border-strong bg-background-subtle/80 shadow h-full">
              <div className="p-4">
                <h2 className="text-sm font-semibold mb-2">
                  Student decks {inspectId ? `(user #${inspectId})` : ""}
                </h2>

                {inspectId ? (
                  <ul className="rounded-lg border border-border-strong divide-y divide-slate-800">
                    {inspectDecks.map((d) => (
                      <li key={d.id} className="px-3 py-2">
                        <div className="text-sm">
                          {d.title || `Deck #${d.id}`}
                        </div>
                        <div className="text-xs text-text-muted">id: {d.id}</div>
                      </li>
                    ))}
                    {!inspectDecks.length && (
                      <li className="px-3 py-2 text-text-muted text-sm">
                        No decks
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-text-muted text-sm">
                    Double-click a student to inspect their decks.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

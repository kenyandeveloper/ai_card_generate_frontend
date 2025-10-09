"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
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
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Teacher • Assign Decks
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField
                  size="small"
                  label="Deck ID"
                  value={deckId}
                  onChange={(e) => setDeckId(e.target.value)}
                />
                <Button variant="outlined" onClick={doCopyFromCatalog}>
                  Copy from catalog…
                </Button>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <TextField
                fullWidth
                size="small"
                label="Search students"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <List dense sx={{ maxHeight: 360, overflow: "auto", mt: 1 }}>
                {students.map((s) => (
                  <ListItemButton
                    key={s.id}
                    selected={selectedIds.has(s.id)}
                    onClick={() => toggle(s.id)}
                    onDoubleClick={() => setInspectId(s.id)}
                  >
                    <ListItemText primary={s.username} secondary={s.email} />
                  </ListItemButton>
                ))}
              </List>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  onClick={doAssign}
                  disabled={!deckId || selectedIds.size === 0}
                >
                  Assign
                </Button>
                <Button
                  variant="outlined"
                  onClick={doUnassign}
                  disabled={!deckId || selectedIds.size === 0}
                >
                  Unassign
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Student decks {inspectId ? `(user #${inspectId})` : ""}
              </Typography>
              {inspectId ? (
                <List dense>
                  {inspectDecks.map((d) => (
                    <ListItemButton key={d.id}>
                      <ListItemText
                        primary={d.title || `Deck #${d.id}`}
                        secondary={`id: ${d.id}`}
                      />
                    </ListItemButton>
                  ))}
                  {!inspectDecks.length && (
                    <Typography color="text.secondary">No decks</Typography>
                  )}
                </List>
              ) : (
                <Typography color="text.secondary">
                  Double-click a student to inspect their decks.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

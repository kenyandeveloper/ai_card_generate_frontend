import { Container, Card, Typography, Button } from "@mui/material";
import { Brain, ArrowLeft } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import NavBar from "../../NavBar";

const EmptyDeckState = ({ deckId }) => {
  return (
    <>
      <NavBar />
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Card sx={{ textAlign: "center", p: 4 }}>
          <Brain size={48} sx={{ color: "primary.main", mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2 }}>
            No Flashcards Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            This deck doesn't have any flashcards yet. Add some flashcards to
            start studying!
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to={`/mydecks/${deckId}`}
            startIcon={<ArrowLeft size={18} />}
          >
            Back to Deck
          </Button>
        </Card>
      </Container>
    </>
  );
};

export default EmptyDeckState;
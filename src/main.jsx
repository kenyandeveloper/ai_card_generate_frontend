import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { UserProvider } from "./components/context/UserContext.jsx";
import { DecksProvider } from "./contexts/DecksContext.jsx";
import { ProgressProvider } from "./contexts/ProgressContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <DecksProvider>
        <ProgressProvider>
          <App />
        </ProgressProvider>
      </DecksProvider>
    </UserProvider>
  </StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { UserProvider } from "./components/context/UserContext.jsx";
import { DecksProvider } from "./contexts/DecksContext.jsx";
import { ProgressProvider } from "./contexts/ProgressContext.jsx";
import { BillingProvider } from "./contexts/BillingContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <BillingProvider>
        <DecksProvider>
          <ProgressProvider>
            <App />
          </ProgressProvider>
        </DecksProvider>
      </BillingProvider>
    </UserProvider>
  </StrictMode>
);

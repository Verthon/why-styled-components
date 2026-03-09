import { AppProviders } from "@why/core";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <AppProviders>
        <HydratedRouter />
      </AppProviders>
    </StrictMode>,
  );
});

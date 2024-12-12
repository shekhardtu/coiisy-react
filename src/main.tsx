import { TooltipProvider } from "@radix-ui/react-tooltip";
import React from "react";
import ReactDOM from "react-dom/client";
import { Dialog } from "./components/ui/dialog";
import { Router } from "./routes";
import "./styles/global.css";

import { Toaster } from "@/components/ui/toaster";
import { client } from "@shekhardtu/tsoa-client/services.gen";
import posthog from "posthog-js";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { getWebSocketURL } from "./lib/webSocket.config";

const baseUrl =
  import.meta.env.VITE_ENV === "development"
    ? "http://localhost:4000/v1"
    : "https://api.mockplacement.com/v1"

client.setConfig({
  baseUrl: baseUrl,
})

if (import.meta.env.VITE_ENV !== "development") {
posthog.init("phc_14RTykDx36LKcstnpChxFgvWmthHCH1GCSOSxRqcE0n", {
  api_host: "https://us.i.posthog.com",
    person_profiles: "always", // or 'always' to create profiles for anonymous users as well
  })
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WebSocketProvider url={getWebSocketURL()}>
      <Dialog>
        <TooltipProvider>
          <Router />
        </TooltipProvider>
      </Dialog>
      <Toaster />
    </WebSocketProvider>
  </React.StrictMode>
)

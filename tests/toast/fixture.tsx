import { createRoot } from "react-dom/client";
import { createElement } from "react";
import WorkvenceToaster from "../../src/components/ui/WorkvenceToaster/WorkvenceToaster";
import { toast } from "../../src/utils/toast";

declare global {
  interface Window {
    toastTest: { toast: typeof toast; actionCount: number; dismissCount: number; reactContent: () => void };
  }
}

window.toastTest = {
  toast, actionCount: 0, dismissCount: 0,
  reactContent: () => toast(() => createElement("strong", null, "React content preserved")),
};
createRoot(document.getElementById("root")!).render(<WorkvenceToaster />);

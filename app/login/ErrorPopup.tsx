"use client";
import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  google_cancelled:
    "Cancelaste el inicio de sesión con Google. Puedes intentarlo de nuevo.",
  google_invalid: "La solicitud a Google fue inválida. Intenta de nuevo.",
  google_error: "Ocurrió un error con Google. Intenta más tarde.",
  google_not_configured:
    "Google login no está configurado. Contacta al administrador.",
};

const AUTO_HIDE_MS = 8000;

export function ErrorPopup({ errorCode }: { errorCode: string | null }) {
  // The parent passes `key={errorCode}` so a new errorCode remounts the
  // component — no need to reset state across errorCodes here. The only
  // local state is "did the user manually dismiss this popup".
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!errorCode) return;
    const timer = setTimeout(() => setHidden(true), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [errorCode]);

  if (!errorCode || hidden) return null;

  const message =
    ERROR_MESSAGES[errorCode] ?? "Error de autenticación. Intenta de nuevo.";

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 shadow-lg backdrop-blur-xl">
      <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={() => setHidden(true)}
        className="text-red-400 transition-colors hover:text-red-300"
        aria-label="Cerrar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

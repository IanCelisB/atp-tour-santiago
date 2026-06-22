"use client";
import { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  google_cancelled:
    "Cancelaste el inicio de sesión con Google. Puedes intentarlo de nuevo.",
  google_invalid: "La solicitud a Google fue inválida. Intenta de nuevo.",
  google_error: "Ocurrió un error con Google. Intenta más tarde.",
  google_not_configured:
    "Google login no está configurado. Contacta al administrador.",
};

export function ErrorPopup({ errorCode }: { errorCode: string | null }) {
  const [visible, setVisible] = useState(!!errorCode);

  useEffect(() => {
    if (errorCode) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [errorCode]);

  if (!visible || !errorCode) return null;

  const message =
    ERROR_MESSAGES[errorCode] ?? "Error de autenticación. Intenta de nuevo.";

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 shadow-lg backdrop-blur-xl">
      <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="text-red-400 transition-colors hover:text-red-300"
        aria-label="Cerrar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

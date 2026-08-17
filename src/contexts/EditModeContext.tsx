"use client";

import { createContext, useContext } from "react";

const EditModeContext = createContext(false);

export function EditModeProvider({
  editing,
  children,
}: {
  editing: boolean;
  children: React.ReactNode;
}) {
  return <EditModeContext.Provider value={editing}>{children}</EditModeContext.Provider>;
}

export function useEditMode() {
  return useContext(EditModeContext);
}

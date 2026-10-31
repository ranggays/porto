"use client";

import { createContext, useContext } from "react";
import type { ProjectDocuments } from "../data/types";

const ProjectDocumentsContext = createContext<ProjectDocuments>({});

export function ProjectDocumentsProvider({
  documents,
  children,
}: {
  documents: ProjectDocuments;
  children: React.ReactNode;
}) {
  return (
    <ProjectDocumentsContext.Provider value={documents}>
      {children}
    </ProjectDocumentsContext.Provider>
  );
}

export function useProjectDocuments() {
  return useContext(ProjectDocumentsContext);
}

import type { ProjectDocuments } from "./types";

const projectDirectories: Record<string, string> = {
  flow: "flow",
  flox: "flox",
  geovision: "geovision",
  velora: "velora",
};

const projectFiles = import.meta.glob("/docs/projects/*/*", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

export function getProjectDocuments(): ProjectDocuments {
  const documents: ProjectDocuments = {};

  for (const [key, directory] of Object.entries(projectDirectories)) {
    const entries = Object.entries(projectFiles).filter(([filePath]) => {
      const match = filePath.match(/docs\/projects\/([^/]+)\/([^/]+)$/);
      return match?.[1] === directory;
    });

    documents[key] = {
      files: entries.map(([filePath]) => ({
        name: filePath.split("/").pop() ?? filePath,
        type: "file" as const,
      })),
      readme:
        entries.find(([filePath]) => filePath.endsWith("/README.md"))?.[1] ??
        null,
    };
  }

  return documents;
}

export type ProjectFile = {
  name: string;
  type: "file";
};

export type ProjectDocument = {
  files: ProjectFile[];
  readme: string | null;
};

export type ProjectDocuments = Record<string, ProjectDocument>;

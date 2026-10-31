import "./features/portfolio/portfolio.css";
import PortfolioPage from "./features/portfolio/PortfolioPage";
import { ProjectDocumentsProvider } from "./features/portfolio/context/ProjectDocumentsContext";
import "./App.css";
import { getProjectDocuments } from "./features/portfolio/data/project-documents.server";

export default function App() {
  const projectDocuments = getProjectDocuments();

  return (
    <ProjectDocumentsProvider documents={projectDocuments}>
      <PortfolioPage />
    </ProjectDocumentsProvider>
  );
}


import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import ProjectForm from "@/components/ProjectForm";
import { trpc } from "@/lib/trpc";

export default function ProjectEditPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const idStr = window.location.pathname.split("/").pop();
  const projectId = Number(idStr);

  const { data: project, isLoading, error } = trpc.projects.getMyProjectById.useQuery(
    { id: projectId },
    { enabled: isAuthenticated && Number.isInteger(projectId) && projectId > 0 }
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="text-center space-y-4">
          <p className="text-slate-500 font-medium">Project not found or access denied.</p>
          <Button variant="outline" onClick={() => navigate("/student/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-leaf-green/20 via-background to-background">
      <Navigation />
      <div className="container py-10">
        <button
          onClick={() => navigate(`/project/${projectId}`)}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to project
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Edit Project</h1>
          <p className="text-sm text-slate-500 mt-1">
            Update your project details and resubmit for review.
          </p>
        </div>

        <ProjectForm
          initialData={{
            id: project.id,
            title: project.title ?? undefined,
            teamName: project.teamName ?? undefined,
            description: project.description ?? undefined,
            grade: project.grade ?? undefined,
            abstract: project.abstract || undefined,
            scientificQuestion: project.scientificQuestion || undefined,
            sdgAlignment: project.sdgAlignment ? JSON.parse(project.sdgAlignment) : undefined,
            researchMethod: project.researchMethod || undefined,
            experimentDetails: project.experimentDetails || undefined,
            dataExplanation: project.dataExplanation || undefined,
          }}
          onSuccess={() => navigate(`/project/${projectId}`)}
        />
      </div>
    </div>
  );
}

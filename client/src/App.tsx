import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { GestureProvider } from "./contexts/GestureContext";
import { UserWelcomeToast } from "./components/UserWelcomeToast";
import PlatformSectionPlaceholder from "./components/PlatformSectionPlaceholder";
import { Redirect } from "wouter";

// Eagerly load only the most-visited pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import GatewayPage from "./pages/GatewayPage";

// Lazy-load everything else (code splitting)
const InnovationHub      = lazy(() => import("./pages/InnovationHub"));
const Explore            = lazy(() => import("./pages/Explore"));
const Impact             = lazy(() => import("./pages/Impact"));
const ZoneDetail         = lazy(() => import("./pages/ZoneDetail"));
const Learn              = lazy(() => import("./pages/Learn"));
const EcoGuide           = lazy(() => import("./pages/EcoGuide"));
const Experiences        = lazy(() => import("./pages/Experiences"));
const Missions            = lazy(() => import("./pages/Missions"));
const MissionDetail       = lazy(() => import("./pages/MissionDetail"));
const MissionVerification = lazy(() => import("./pages/MissionVerification"));
const MissionsMapPage     = lazy(() => import("./pages/MissionsMapPage"));
const ProjectDetail      = lazy(() => import("./pages/ProjectDetail"));
const StudentDashboard   = lazy(() => import("./pages/StudentDashboard"));
const TeacherDashboard   = lazy(() => import("./pages/TeacherDashboard"));
const AdminDashboard     = lazy(() => import("./pages/AdminDashboard"));
const JourneyCinema      = lazy(() => import("./pages/JourneyCinema"));
const Resources          = lazy(() => import("./pages/Resources"));
const WallMode           = lazy(() => import("./pages/WallMode"));
const Vote               = lazy(() => import("./pages/Vote"));
const ProjectSubmissionPage   = lazy(() => import("./pages/ProjectSubmissionPage"));
const SubcategoriesPage       = lazy(() => import("./pages/SubcategoriesPage"));
const SubcategoryDetailPage   = lazy(() => import("./pages/SubcategoryDetailPage"));
const ChooseRole              = lazy(() => import("./pages/ChooseRole"));

const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path="/" component={GatewayPage} />
        <Route path="/expo" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={SignUp} />
        <Route path="/choose-role" component={ChooseRole} />
        <Route path="/explore" component={Explore} />
        <Route path="/explore/:categorySlug" component={ZoneDetail} />
        <Route path="/learn" component={Learn} />
        <Route path="/ecoguide" component={EcoGuide} />
        <Route path="/missions" component={MissionsMapPage} />
        <Route path="/missions/list" component={Missions} />
        <Route path="/missions/:id" component={MissionDetail} />
        <Route path="/experiences" component={Experiences} />
        <Route path="/stories" component={JourneyCinema} />
        <Route path="/impact" component={Impact} />
        <Route path="/journey" component={StudentDashboard} />
        <Route path="/journey-map" component={MissionsMapPage} />
        <Route path="/challenges"><PlatformSectionPlaceholder title="Innovation Challenges" description="Optional sustainability challenges will appear here." /></Route>
        <Route path="/showcase/:id"><PlatformSectionPlaceholder title="Achievement Showcase" description="Selected achievements will be presented here." /></Route>
        <Route path="/innovation-hub"><Redirect to="/explore" /></Route>
        <Route path="/innovation-hub/:categorySlug"><Redirect to="/explore" /></Route>
        <Route path="/journey-cinema"><Redirect to="/stories" /></Route>
        <Route path="/project/:id" component={ProjectDetail} />
        <Route path="/student/dashboard" component={StudentDashboard} />
        <Route path="/teacher/dashboard" component={TeacherDashboard} />
        <Route path="/teacher/verification" component={MissionVerification} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/journey-cinema" component={JourneyCinema} />
        <Route path="/resources" component={Resources} />
        <Route path="/wall-mode" component={WallMode} />
        <Route path="/vote" component={Vote} />
        <Route path="/project-submission" component={ProjectSubmissionPage} />
        <Route path="/project-submission/:categoryId" component={ProjectSubmissionPage} />
        <Route path="/category/:categoryId" component={SubcategoriesPage} />
        <Route path="/category/:categoryId/subcategory/:subcategoryName" component={SubcategoryDetailPage} />
        <Route path="/category/:categoryId/subcategory/:subcategoryName/submit" component={ProjectSubmissionPage} />
        <Route path="/my-projects" component={StudentDashboard} />
        <Route path="/my-projects/:projectId" component={ProjectDetail} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <GestureProvider>
            <TooltipProvider style={{position: 'relative', zIndex: 10}}>
              <Toaster />
              <UserWelcomeToast />
              <Router />
            </TooltipProvider>
          </GestureProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

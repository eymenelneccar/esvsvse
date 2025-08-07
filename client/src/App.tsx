import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import FileManager from "@/pages/file-manager";
import PdfReader from "@/pages/pdf-reader";
import Translation from "@/pages/translation";
import Review from "@/pages/review";
import Calendar from "@/pages/calendar";
import Productivity from "@/pages/productivity";
import Focus from "@/pages/focus";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/files" component={FileManager} />
      <ProtectedRoute path="/pdf/:id" component={PdfReader} />
      <ProtectedRoute path="/translation" component={Translation} />
      <ProtectedRoute path="/review" component={Review} />
      <ProtectedRoute path="/calendar" component={Calendar} />
      <ProtectedRoute path="/productivity" component={Productivity} />
      <ProtectedRoute path="/focus" component={Focus} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Routes, Route } from 'react-router-dom';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "./hooks/use-auth";
import { ChatProvider } from "./hooks/use-chat";
import { ThemeProvider } from "./hooks/use-theme";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import LeadersPage from "@/pages/leaders-page";
import ForumsPage from "@/pages/forums-page";
import { ProtectedRoute } from "./lib/protected-route";
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from './lib/supabase';
import ProfilePage from "@/pages/profile-page";
import ForumPage from "./pages/forum-page";
import { ErrorBoundary } from "@/components/error-boundary";
import { Layout } from "./components/layout";
import EventsPage from "./pages/events-page";
import EventPage from "./pages/event-page";
import NotificationsPage from "@/pages/profile/notifications-page";
import i18n from './lib/i18n';
import { I18nextProvider } from 'react-i18next';
import CreateEventPage from "@/pages/create-event";
import CalendarPage from './pages/calendar';
import DocumentsPage from './pages/documents';
import LocalUpdatesPage from './pages/local-updates';
import ReportsPage from './pages/reports';
import ProjectsPage from './pages/projects';
import EmergencyContactsPage from './pages/emergency-contacts';
import EmergencyAlertPage from './pages/emergency-alert';
import { Suspense } from 'react';
import { Loader } from '@/components/ui/loader';

function Router() {
  return (
    <ErrorBoundary>
      <Layout>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/auth"><AuthPage /></Route>
            <Route path="/"><ProtectedRoute component={HomePage} /></Route>
            <Route path="/leaders"><ProtectedRoute component={LeadersPage} /></Route>
            <Route path="/profile"><ProfilePage /></Route>
            <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
            <Route path="/forums"><ForumsPage /></Route>
            <Route path="/forums/:id">
              {(params) => <ForumPage forumId={params.id} />}
            </Route>
            <Route path="/events/create"><CreateEventPage /></Route>
            <Route path="/events/:id">
              {(params) => <EventPage eventId={params.id} />}
            </Route>
            <Route path="/events"><EventsPage /></Route>
            <Route path="/notifications">
              <ProtectedRoute component={NotificationsPage} />
            </Route>
            <Route path="/documents">
              <ProtectedRoute component={DocumentsPage} />
            </Route>
            <Route path="/calendar">
              <ProtectedRoute component={CalendarPage} />
            </Route>
            <Route path="/reports">
              <ProtectedRoute component={ReportsPage} />
            </Route>
            <Route path="/local-updates">
              <ProtectedRoute component={LocalUpdatesPage} />
            </Route>
            <Route path="/projects">
              <ProtectedRoute component={ProjectsPage} />
            </Route>
            <Route path="/emergency-contacts">
              <ProtectedRoute component={EmergencyContactsPage} />
            </Route>
            <Route path="/emergency-alert">
              <ProtectedRoute component={EmergencyAlertPage} />
            </Route>
            <Route><NotFound /></Route>
          </Routes>
        </Suspense>
      </Layout>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider defaultTheme="system" storageKey="kenya-civic-theme">
          <QueryClientProvider client={queryClient}>
            <SessionContextProvider supabaseClient={supabase}>
              <AuthProvider>
                <ChatProvider>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                    </Routes>
                  </Layout>
                  <Toaster />
                </ChatProvider>
              </AuthProvider>
            </SessionContextProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
}

export default App;
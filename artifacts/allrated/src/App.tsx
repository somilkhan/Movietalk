import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NetworkStatus } from "@/components/NetworkStatus";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { MobileNav } from "@/components/MobileNav";
import { ProfileGuard } from "@/components/ProfileGuard";
import { cn } from "@/lib/utils";

import { Footer } from "@/components/Footer";

// Eagerly load critical pages
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";

// Lazy load non-critical pages
const Movies = lazy(() => import("@/pages/Movies"));
const Tv = lazy(() => import("@/pages/Tv"));
const Anime = lazy(() => import("@/pages/Anime"));
const Explore = lazy(() => import("@/pages/Explore"));
const Categories = lazy(() => import("@/pages/Categories"));
const Space = lazy(() => import("@/pages/Space"));
const Sports = lazy(() => import("@/pages/Sports"));
const Sparks = lazy(() => import("@/pages/Sparks"));
const TitleDetail = lazy(() => import("@/pages/TitleDetail"));
const Catalog = lazy(() => import("@/pages/Catalog"));
const Watch = lazy(() => import("@/pages/Watch"));
const Settings = lazy(() => import("@/pages/Settings"));
const SettingsAccount = lazy(() => import("@/pages/SettingsAccount"));
const SettingsParental = lazy(() => import("@/pages/SettingsParental"));
const SettingsHelp = lazy(() => import("@/pages/SettingsHelp"));
const Profiles = lazy(() => import("@/pages/Profiles"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 2 },
  },
});

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-10 h-10 border-2 border-white/10 border-t-[#4752c4] rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const isWatchPage = location.startsWith('/watch');
  const isTitlePage = location.startsWith('/title');
  const isProfilesPage = location === '/profiles';

  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* Full-screen watch — NO sidebar, nav, or footer */}
        <Route path="/watch/:mediaType/:id">
          <Suspense fallback={<PageLoader />}>
            <Watch />
          </Suspense>
        </Route>

        {/* Profile selector — standalone, no sidebar/nav */}
        <Route path="/profiles">
          <Suspense fallback={<PageLoader />}>
            <Profiles />
          </Suspense>
        </Route>

        {/* Standard layout */}
        <Route>
          <div className="min-h-screen bg-black text-white flex flex-col">
            {!isProfilesPage && <DesktopSidebar />}

            <main className={cn("flex-1 mobile-content md:pb-0 animate-slide-up", !isProfilesPage && "md:ml-[80px]")}>
              <Switch>
                <Route path="/" component={() => <Redirect to="/home" />} />
                <Route path="/home" component={Home} />
                <Route path="/movies">
                  <Suspense fallback={<PageLoader />}><Movies /></Suspense>
                </Route>
                <Route path="/tv">
                  <Suspense fallback={<PageLoader />}><Tv /></Suspense>
                </Route>
                <Route path="/anime">
                  <Suspense fallback={<PageLoader />}><Anime /></Suspense>
                </Route>
                <Route path="/explore">
                  <Suspense fallback={<PageLoader />}><Explore /></Suspense>
                </Route>
                <Route path="/categories">
                  <Suspense fallback={<PageLoader />}><Categories /></Suspense>
                </Route>
                <Route path="/space">
                  <Suspense fallback={<PageLoader />}><Space /></Suspense>
                </Route>
                <Route path="/sports">
                  <Suspense fallback={<PageLoader />}><Sports /></Suspense>
                </Route>
                <Route path="/sparks">
                  <Suspense fallback={<PageLoader />}><Sparks /></Suspense>
                </Route>
                <Route path="/title/:mediaType/:id">
                  <Suspense fallback={<PageLoader />}><TitleDetail /></Suspense>
                </Route>
                <Route path="/catalog/:mediaType/:category">
                  <Suspense fallback={<PageLoader />}><Catalog /></Suspense>
                </Route>
                <Route path="/settings">
                  <Suspense fallback={<PageLoader />}><Settings /></Suspense>
                </Route>
                <Route path="/settings/account">
                  <Suspense fallback={<PageLoader />}><SettingsAccount /></Suspense>
                </Route>
                <Route path="/settings/parental">
                  <Suspense fallback={<PageLoader />}><SettingsParental /></Suspense>
                </Route>
                <Route path="/settings/help">
                  <Suspense fallback={<PageLoader />}><SettingsHelp /></Suspense>
                </Route>
                <Route component={NotFound} />
              </Switch>
            </main>

            {!isWatchPage && !isTitlePage && !isProfilesPage && <MobileNav />}
            {!isWatchPage && !isProfilesPage && <Footer />}
          </div>
        </Route>
      </Switch>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WouterRouter>
          <TooltipProvider>
            <NetworkStatus />
            <ProfileGuard>
              <Router />
            </ProfileGuard>
            <Toaster />
            <SonnerToaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: '#1a1c24',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                },
              }}
            />
          </TooltipProvider>
        </WouterRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

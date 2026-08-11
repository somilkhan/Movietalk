import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NetworkStatus } from "@/components/NetworkStatus";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MobileHeader } from "@/components/MobileHeader";

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
    <div className="min-h-screen flex items-center justify-center bg-[#0f1014]">
      <div className="w-10 h-10 border-2 border-white/10 border-t-[#4752c4] rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const isWatchPage = location.startsWith('/watch');
  const isTitlePage = location.startsWith('/title');

  /* ---- smoke transformation coordination ----
     Logo smokes at 4s, floating cat appears at 5s */
  const [logoSmokePoof, setLogoSmokePoof] = useState(false);

  useEffect(() => {
    if (isWatchPage || isTitlePage) return;
    const timer = setTimeout(() => setLogoSmokePoof(true), 4000);
    return () => clearTimeout(timer);
  }, [isWatchPage, isTitlePage]);

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

        {/* Standard layout */}
        <Route>
          <div className="min-h-screen bg-[#0f1014] text-white flex flex-col">
            <DesktopSidebar />
            {!isWatchPage && !isTitlePage && <MobileHeader logoSmokePoof={logoSmokePoof} />}

            <main className="md:ml-[80px] flex-1 mobile-content md:pb-0 animate-slide-up">
              <Switch>
                <Route path="/">
                  <Redirect to="/home" />
                </Route>
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
                <Route path="/sports">
                  <Suspense fallback={<PageLoader />}><Sports /></Suspense>
                </Route>
                <Route path="/spark">
                  <Suspense fallback={<PageLoader />}><Sparks /></Suspense>
                </Route>
                <Route path="/space">
                  <Suspense fallback={<PageLoader />}><Space /></Suspense>
                </Route>
                <Route path="/title/:mediaType/:id">
                  <Suspense fallback={<PageLoader />}><TitleDetail /></Suspense>
                </Route>
                <Route path="/category/:name">
                  <Suspense fallback={<PageLoader />}><Catalog /></Suspense>
                </Route>
                <Route path="/settings">
                  <Suspense fallback={<PageLoader />}><Settings /></Suspense>
                </Route>
                <Route component={NotFound} />
              </Switch>
            </main>
            <Footer />
            <MobileBottomNav />
          </div>
        </Route>
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NetworkStatus />
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
          <SonnerToaster position="bottom-center" theme="dark" />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

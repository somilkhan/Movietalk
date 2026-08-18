import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Router as WouterRouter, Redirect, useLocation, useParams } from "wouter";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NetworkStatus } from "@/components/NetworkStatus";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { MobileNav } from "@/components/MobileNav";
import { ProfileGuard } from "@/components/ProfileGuard";
import { GlobalUiFixes } from "@/components/GlobalUiFixes";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/Footer";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import LoginRoute from "@/pages/LoginRoute";
import Register from "@/pages/Register";

const Movies = lazy(() => import("@/pages/Movies"));
const Tv = lazy(() => import("@/pages/Tv"));
const Anime = lazy(() => import("@/pages/Anime"));
const Explore = lazy(() => import("@/pages/Explore"));
const Categories = lazy(() => import("@/pages/Categories"));
const Space = lazy(() => import("@/pages/SpaceEntry"));
const Sports = lazy(() => import("@/pages/Sports"));
const Sparks = lazy(() => import("@/pages/Sparks"));
const TitleDetail = lazy(() => import("@/pages/TitleDetailRoute"));
const Catalog = lazy(() => import("@/pages/Catalog"));
const Watch = lazy(() => import("@/pages/BingrWatchRoute"));
const Settings = lazy(() => import("@/pages/Settings"));
const SettingsAccount = lazy(() => import("@/pages/SettingsAccount"));
const SettingsParental = lazy(() => import("@/pages/SettingsParental"));
const SettingsHelp = lazy(() => import("@/pages/SettingsHelp"));
const Profiles = lazy(() => import("@/pages/Profiles"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 2 } },
});

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location]);
  return null;
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black" role="status" aria-label="Loading">
      <div className="w-9 h-9 border-2 border-white/10 border-t-[#5865d9] rounded-full animate-spin" />
    </div>
  );
}

function LegacyTitleRedirect({ mediaType }: { mediaType: 'movie' | 'tv' }) {
  const { id } = useParams<{ id: string }>();
  return <Redirect to={`/title/${mediaType}/${id}`} />;
}

function LegacyCatalogRedirect() {
  const { name } = useParams<{ name: string }>();
  return <Redirect to={`/catalog/movie/${name}`} />;
}

function Router() {
  const [location] = useLocation();
  const isWatchPage = location.startsWith('/watch');
  const isTitlePage = location.startsWith('/title') || /^\/(movie|tv|anime)\//.test(location);

  return (
    <>
      <ScrollToTop />
      <GlobalUiFixes />
      <Switch>
        <Route path="/login"><LoginRoute /></Route>
        <Route path="/register"><Register /></Route>

        <Route path="/movie/:id"><LegacyTitleRedirect mediaType="movie" /></Route>
        <Route path="/tv/:id"><LegacyTitleRedirect mediaType="tv" /></Route>
        <Route path="/anime/:id"><LegacyTitleRedirect mediaType="tv" /></Route>
        <Route path="/me/profiles"><Redirect to="/profiles" /></Route>
        <Route path="/settings/subscription"><Redirect to="/settings" /></Route>
        <Route path="/category/:name"><LegacyCatalogRedirect /></Route>
        <Route path="/genre/:name"><LegacyCatalogRedirect /></Route>
        <Route path="/language/:name"><LegacyCatalogRedirect /></Route>

        <Route path="/watch/:mediaType/:id/:season/:episode">
          <Suspense fallback={<PageLoader />}><Watch /></Suspense>
        </Route>
        <Route path="/watch/:mediaType/:id">
          <Suspense fallback={<PageLoader />}><Watch /></Suspense>
        </Route>
        <Route path="/profiles"><Suspense fallback={<PageLoader />}><Profiles /></Suspense></Route>
        <Route path="/help"><Redirect to="/settings/help" /></Route>

        <Route>
          <div className="min-h-screen bg-black text-white flex flex-col">
            <DesktopSidebar />
            <main className={cn("flex-1 mobile-content md:pb-0 animate-slide-up", "md:ml-[80px]")}>
              <Switch>
                <Route path="/"><Redirect to="/home" /></Route>
                <Route path="/home" component={Home} />
                <Route path="/movies"><Suspense fallback={<PageLoader />}><Movies /></Suspense></Route>
                <Route path="/tv"><Suspense fallback={<PageLoader />}><Tv /></Suspense></Route>
                <Route path="/anime"><Suspense fallback={<PageLoader />}><Anime /></Suspense></Route>
                <Route path="/explore"><Suspense fallback={<PageLoader />}><Explore /></Suspense></Route>
                <Route path="/categories"><Suspense fallback={<PageLoader />}><Categories /></Suspense></Route>
                <Route path="/space"><Suspense fallback={<PageLoader />}><Space /></Suspense></Route>
                <Route path="/sports"><Suspense fallback={<PageLoader />}><Sports /></Suspense></Route>
                <Route path="/sparks"><Suspense fallback={<PageLoader />}><Sparks /></Suspense></Route>
                <Route path="/title/:mediaType/:id"><Suspense fallback={<PageLoader />}><TitleDetail /></Suspense></Route>
                <Route path="/catalog/:mediaType/:category"><Suspense fallback={<PageLoader />}><Catalog /></Suspense></Route>
                <Route path="/settings"><Suspense fallback={<PageLoader />}><Settings /></Suspense></Route>
                <Route path="/settings/account"><Suspense fallback={<PageLoader />}><SettingsAccount /></Suspense></Route>
                <Route path="/settings/parental"><Suspense fallback={<PageLoader />}><SettingsParental /></Suspense></Route>
                <Route path="/settings/help"><Suspense fallback={<PageLoader />}><SettingsHelp /></Suspense></Route>
                <Route component={NotFound} />
              </Switch>
            </main>
            {!isWatchPage && !isTitlePage && <MobileNav />}
            {!isWatchPage && <Footer />}
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
            <SonnerToaster position="bottom-center" toastOptions={{ style: { background: '#111116', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />
          </TooltipProvider>
        </WouterRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

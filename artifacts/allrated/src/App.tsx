import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Redirect, Route, Router as WouterRouter, Switch, useLocation, useParams } from "wouter";
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
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location]);
  return null;
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center" role="status" aria-label="Loading">
      <div className="h-10 w-10 rounded-full border-[3px] border-white/10 border-t-white animate-spin" />
    </div>
  );
}

function LegacyCatalogRedirect() {
  const { name } = useParams<{ name: string }>();
  return <Redirect to={`/catalog/movie/${encodeURIComponent(decodeURIComponent(name ?? ""))}`} />;
}

function AppRouter() {
  const [location] = useLocation();
  const isWatchPage = location.startsWith("/watch");
  const isTitlePage = location.startsWith("/title/") || /^\/(movie|tv|anime)\//.test(location);

  return (
    <>
      <ScrollToTop />
      <GlobalUiFixes />
      <Switch>
        <Route path="/login"><LoginRoute /></Route>
        <Route path="/register"><Register /></Route>
        <Route path="/profiles"><Suspense fallback={<PageLoader />}><Profiles /></Suspense></Route>

        <Route path="/watch/:mediaType/:id/:season/:episode"><Suspense fallback={<PageLoader />}><Watch /></Suspense></Route>
        <Route path="/watch/:mediaType/:id"><Suspense fallback={<PageLoader />}><Watch /></Suspense></Route>

        <Route path="/movie/:id"><Suspense fallback={<PageLoader />}><TitleDetail /></Suspense></Route>
        <Route path="/tv/:id"><Suspense fallback={<PageLoader />}><TitleDetail /></Suspense></Route>
        <Route path="/anime/:id"><Suspense fallback={<PageLoader />}><TitleDetail /></Suspense></Route>
        <Route path="/title/:mediaType/:id"><Suspense fallback={<PageLoader />}><TitleDetail /></Suspense></Route>

        <Route path="/category/:name"><LegacyCatalogRedirect /></Route>
        <Route path="/genre/:name"><LegacyCatalogRedirect /></Route>
        <Route path="/language/:name"><LegacyCatalogRedirect /></Route>
        <Route path="/studio/:name"><LegacyCatalogRedirect /></Route>
        <Route path="/category"><Redirect to="/categories" /></Route>
        <Route path="/genre"><Redirect to="/categories" /></Route>
        <Route path="/language"><Redirect to="/categories" /></Route>
        <Route path="/categories/all/:type"><Redirect to="/categories" /></Route>
        <Route path="/collection/:id"><Redirect to="/explore" /></Route>
        <Route path="/creator"><Redirect to="/explore" /></Route>
        <Route path="/creators"><Redirect to="/explore" /></Route>
        <Route path="/live-tv"><Redirect to="/sports" /></Route>
        <Route path="/spark"><Redirect to="/sparks" /></Route>
        <Route path="/watch-party"><Redirect to="/space" /></Route>
        <Route path="/watch-party/:code"><Redirect to="/space" /></Route>
        <Route path="/help"><Redirect to="/settings/help" /></Route>
        <Route path="/legal"><Redirect to="/settings/help" /></Route>
        <Route path="/legal/:page"><Redirect to="/settings/help" /></Route>
        <Route path="/me/profiles"><Redirect to="/profiles" /></Route>
        <Route path="/settings/subscription"><Redirect to="/settings" /></Route>
        <Route path="/search"><Redirect to="/explore" /></Route>
        <Route path="/browse"><Redirect to="/explore" /></Route>
        <Route path="/discover"><Redirect to="/explore" /></Route>

        <Route>
          <div className="min-h-screen bg-black text-white flex flex-col">
            <DesktopSidebar />
            <main className={cn("flex-1 mobile-content animate-slide-up", "md:pl-[80px] lg:pl-[100px]")}> 
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
            <ProfileGuard><AppRouter /></ProfileGuard>
            <Toaster />
            <SonnerToaster position="bottom-center" toastOptions={{ style: { background: "#08080b", color: "#fff", border: "1px solid rgba(255,255,255,.08)" } }} />
          </TooltipProvider>
        </WouterRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

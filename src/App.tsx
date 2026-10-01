import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { ToastContainer, toast } from "./components/Toast";
import { CityGate } from "./components/CityGate";
import { InstallPrompt } from "./components/InstallPrompt";
import { useRoute, navigate } from "./lib/router";
import { HomePage } from "./pages/Home";
import { SearchPage } from "./pages/Search";
import { ListingDetailPage } from "./pages/ListingDetail";
import { CreateListingPage } from "./pages/CreateListing";
import { LoginPage } from "./pages/Login";
import { DashboardPage, MyListingsPage, SettingsPage } from "./pages/Dashboard";
import { MessagesPage } from "./pages/Messages";
import { FavoritesPage, NotificationsPage } from "./pages/Favorites";
import { AdminPage } from "./pages/Admin";
import { ConfigPage } from "./pages/Config";
import { BlogPage, BlogPostPage } from "./pages/Blog";
import { AboutPage, ContactPage, TermsPage, FaqPage, NotFoundPage } from "./pages/StaticPages";
import { AppInstallPage } from "./pages/AppInstall";

export default function App() {
  const route = useRoute();

  useEffect(() => {
    const onExpired = () => {
      toast("نشست شما منقضی شده است؛ لطفاً دوباره وارد شوید.", "error");
      navigate({ name: "login" });
    };
    window.addEventListener("kb:session-expired", onExpired);
    return () => window.removeEventListener("kb:session-expired", onExpired);
  }, []);

  return (
    <Layout>
      {route.name === "home" && <HomePage />}
      {route.name === "search" && <SearchPage />}
      {route.name === "category" && <SearchPage categorySlug={route.slug} />}
      {route.name === "listing" && <ListingDetailPage id={route.id} />}
      {route.name === "create" && <CreateListingPage />}
      {route.name === "login" && <LoginPage />}
      {route.name === "dashboard" && <DashboardPage />}
      {route.name === "my-listings" && <MyListingsPage />}
      {route.name === "messages" && <MessagesPage />}
      {route.name === "favorites" && <FavoritesPage />}
      {route.name === "notifications" && <NotificationsPage />}
      {route.name === "settings" && <SettingsPage />}
      {route.name === "admin" && <AdminPage />}
      {route.name === "config" && <ConfigPage />}
      {route.name === "blog" && <BlogPage />}
      {route.name === "blog-post" && <BlogPostPage slug={route.slug} />}
      {route.name === "about" && <AboutPage />}
      {route.name === "app" && <AppInstallPage />}
      {route.name === "contact" && <ContactPage />}
      {route.name === "terms" && <TermsPage />}
      {route.name === "faq" && <FaqPage />}
      {route.name === "404" && <NotFoundPage />}
      <CityGate />
      <InstallPrompt />
      <ToastContainer />
    </Layout>
  );
}

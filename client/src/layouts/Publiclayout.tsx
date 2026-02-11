import { Outlet } from "react-router-dom";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { useLanguage } from "../hooks/useLanguage";

export default function PublicLayout() {
  const { dir } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col" dir={dir}>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export const MainLayout = () => (
  <div className="min-h-screen bg-app text-ink">
    <Navbar />
    <Outlet />
  </div>
);

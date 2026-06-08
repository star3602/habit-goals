import { ArrowRightOnRectangleIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { clearToken, getToken } from "../api";
import { Button } from "./Button";

export function Layout() {
  const navigate = useNavigate();
  const hasToken = Boolean(getToken());

  function logout() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
              <SparklesIcon className="h-5 w-5" />
            </span>
            Habit Goals
          </Link>
          {hasToken ? (
            <Button variant="ghost" onClick={logout} aria-label="退出登录">
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              退出
            </Button>
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}

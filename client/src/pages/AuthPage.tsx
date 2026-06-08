import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { login, register, setToken } from "../api";
import { Button } from "../components/Button";

type AuthPageProps = {
  mode: "login" | "register";
};

export function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  function validate() {
    if (!/^\S+@\S+\.\S+$/.test(email)) return "请输入有效邮箱。";
    if (password.length < 8) return "密码至少 8 位。";
    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = isLogin ? await login(email, password) : await register(email, password);
      setToken(response.token);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "请求失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md pt-8">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-cyan-700">{isLogin ? "欢迎回来" : "创建账户"}</p>
        <h1 className="text-3xl font-bold tracking-normal text-slate-950">
          {isLogin ? "登录你的打卡面板" : "从今天开始记录目标"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">邮箱</span>
          <span className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 focus-within:border-cyan-400 focus-within:bg-white">
            <EnvelopeIcon className="h-5 w-5 text-slate-400" />
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-12 w-full bg-transparent text-base outline-none"
              type="email"
              autoComplete="email"
              required
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">密码</span>
          <span className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 focus-within:border-cyan-400 focus-within:bg-white">
            <LockClosedIcon className="h-5 w-5 text-slate-400" />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-12 w-full bg-transparent text-base outline-none"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
            />
          </span>
        </label>

        {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <Button className="w-full" disabled={loading}>
          {loading ? "处理中..." : isLogin ? "登录" : "注册"}
        </Button>

        <p className="text-center text-sm text-slate-600">
          {isLogin ? "还没有账户？" : "已有账户？"}
          <Link className="ml-1 font-semibold text-cyan-700 hover:text-cyan-800" to={isLogin ? "/register" : "/login"}>
            {isLogin ? "去注册" : "去登录"}
          </Link>
        </p>
      </form>
    </section>
  );
}

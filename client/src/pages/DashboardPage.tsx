import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon, CheckCircleIcon, PlusIcon } from "@heroicons/react/24/outline";
import { checkInGoal, createGoal, getGoals } from "../api";
import { Button } from "../components/Button";
import type { Goal } from "../types";

export function DashboardPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadGoals() {
    setLoading(true);
    try {
      setGoals(await getGoals());
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "加载目标失败。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadGoals();
  }, []);

  async function handleCreateGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setMessage("目标标题不能为空。");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      await createGoal(title, description);
      setTitle("");
      setDescription("");
      await loadGoals();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "创建目标失败。");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCheckin(goalId: string) {
    setMessage("");
    try {
      await checkInGoal(goalId);
      await loadGoals();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "打卡失败。");
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-6 text-white shadow-soft">
        <p className="text-sm font-semibold text-cyan-50">UTC 日期记录，目标清晰推进</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal">今天也向前一步</h1>
      </div>

      <form onSubmit={handleCreateGoal} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-soft sm:grid-cols-[1fr_1fr_auto]">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="min-h-11 rounded-lg border border-slate-200 px-3 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          placeholder="目标标题，例如：每天阅读"
          maxLength={120}
        />
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-11 rounded-lg border border-slate-200 px-3 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          placeholder="描述，可选"
          maxLength={1000}
        />
        <Button disabled={submitting}>
          <PlusIcon className="h-5 w-5" />
          新建
        </Button>
      </form>

      {message ? <p className="rounded-lg bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-800">{message}</p> : null}

      {loading ? (
        <p className="text-slate-600">正在加载...</p>
      ) : goals.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          先创建一个目标，然后开始第一天打卡。
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => (
            <article key={goal.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">{goal.title}</h2>
                  {goal.description ? <p className="mt-1 text-sm text-slate-600">{goal.description}</p> : null}
                </div>
                {goal.checkedInToday ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">已打卡</span>
                ) : null}
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">连续天数</p>
                  <p className="mt-1 text-2xl font-bold text-cyan-700">{goal.streak}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">总天数</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-600">{goal.totalDays}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="flex-1" disabled={goal.checkedInToday} onClick={() => handleCheckin(goal.id)}>
                  <CheckCircleIcon className="h-5 w-5" />
                  {goal.checkedInToday ? "今日已完成" : "今日打卡"}
                </Button>
                <Link
                  to={`/goal/${goal.id}`}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-100"
                >
                  详情
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

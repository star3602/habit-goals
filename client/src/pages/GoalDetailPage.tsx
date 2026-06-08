import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { getGoalCheckins } from "../api";
import type { GoalCheckinsResponse } from "../types";

export function GoalDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<GoalCheckinsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    getGoalCheckins(id)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "加载详情失败。"));
  }, [id]);

  if (error) {
    return <p className="rounded-lg bg-rose-50 px-4 py-3 text-rose-700">{error}</p>;
  }

  if (!data) {
    return <p className="text-slate-600">正在加载...</p>;
  }

  return (
    <section className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-800" to="/">
        <ArrowLeftIcon className="h-5 w-5" />
        返回面板
      </Link>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <p className="mb-2 text-sm font-semibold text-cyan-700">目标详情</p>
        <h1 className="text-3xl font-bold tracking-normal text-slate-950">{data.goal.title}</h1>
        {data.goal.description ? <p className="mt-2 text-slate-600">{data.goal.description}</p> : null}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">连续天数</p>
            <p className="mt-1 text-3xl font-bold text-cyan-700">{data.streak}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">总天数</p>
            <p className="mt-1 text-3xl font-bold text-emerald-600">{data.totalDays}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-950">
          <CalendarDaysIcon className="h-6 w-6 text-cyan-700" />
          打卡历史
        </h2>

        {data.checkins.length === 0 ? (
          <p className="text-slate-600">还没有打卡记录。</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {data.checkins.map((checkin) => (
              <li key={checkin.id} className="rounded-lg bg-slate-50 px-4 py-3 font-semibold text-slate-700">
                {checkin.date}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

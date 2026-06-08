import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { calculateCurrentStreak, todayUtcDate } from "../utils/date.js";

const router = Router();

const createGoalSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(120),
  description: z.string().trim().max(1000).optional().or(z.literal(""))
});

router.use(requireAuth);

router.post("/", async (req, res) => {
  const parsed = createGoalSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid goal data.", errors: parsed.error.flatten() });
  }

  const goal = await prisma.goal.create({
    data: {
      user_id: req.user!.id,
      title: parsed.data.title,
      description: parsed.data.description || null
    }
  });

  return res.status(201).json(goal);
});

router.get("/", async (req, res) => {
  const today = todayUtcDate();
  const goals = await prisma.goal.findMany({
    where: { user_id: req.user!.id },
    include: {
      checkins: {
        select: { date: true },
        orderBy: { date: "desc" }
      }
    },
    orderBy: { created_at: "desc" }
  });

  const response = goals.map((goal) => {
    const dates = goal.checkins.map((checkin) => checkin.date);
    return {
      id: goal.id,
      user_id: goal.user_id,
      title: goal.title,
      description: goal.description,
      created_at: goal.created_at,
      checkedInToday: dates.includes(today),
      streak: calculateCurrentStreak(dates, today),
      totalDays: dates.length
    };
  });

  return res.json(response);
});

router.post("/:goalId/checkin", async (req, res) => {
  const goal = await prisma.goal.findFirst({
    where: {
      id: req.params.goalId,
      user_id: req.user!.id
    }
  });

  if (!goal) {
    return res.status(404).json({ message: "Goal not found." });
  }

  const today = todayUtcDate();
  const existing = await prisma.checkin.findUnique({
    where: {
      goal_id_user_id_date: {
        goal_id: goal.id,
        user_id: req.user!.id,
        date: today
      }
    }
  });

  if (existing) {
    return res.status(400).json({ message: "You have already checked in for this goal today." });
  }

  const checkin = await prisma.checkin.create({
    data: {
      goal_id: goal.id,
      user_id: req.user!.id,
      date: today
    }
  });

  return res.status(201).json(checkin);
});

router.get("/:goalId/checkins", async (req, res) => {
  const goal = await prisma.goal.findFirst({
    where: {
      id: req.params.goalId,
      user_id: req.user!.id
    }
  });

  if (!goal) {
    return res.status(404).json({ message: "Goal not found." });
  }

  const checkins = await prisma.checkin.findMany({
    where: {
      goal_id: goal.id,
      user_id: req.user!.id
    },
    orderBy: { date: "desc" }
  });

  const dates = checkins.map((checkin) => checkin.date);

  return res.json({
    goal,
    checkins,
    streak: calculateCurrentStreak(dates),
    totalDays: dates.length
  });
});

export { router as goalsRouter };

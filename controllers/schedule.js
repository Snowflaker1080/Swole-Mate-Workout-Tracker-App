import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import WorkoutGroup from "../models/workoutGroup.js";

dayjs.extend(isoWeek);
dayjs.extend(relativeTime);

export async function index(req, res) {
  const today = dayjs();
  const calendar = [];

  for (let w = 0; w < 6; w++) {
    const week = [];

    for (let d = 0; d < 7; d++) {
      const date = today.add(w * 7 + (d - today.isoWeekday()), "day");
      const isoDate = date.format("YYYY-MM-DD");
      const label = date.format("ddd D MMM");
      const relative = date.from(today);

      // Get groups assigned to this date
      const groups = await WorkoutGroup.find({
        userId: req.session.userId,
        scheduledDate: isoDate,
      });

      week.push({ date: isoDate, label, relative, groups });
    }

    calendar.push(week);
  }

  // Fetch unscheduled groups (never scheduled or explicitly cleared)
  const unscheduledGroups = await WorkoutGroup.find({
    userId: req.session.userId,
    $or: [
      { scheduledDate: { $exists: false } },
      { scheduledDate: null },
    ],
  });

  // Render calendar view
  res.render("schedule/index", {
    calendar,
    todayLabel: today.format("dddd, D MMMM YYYY"),
    unscheduledGroups,
  });
}

export async function assign(req, res) {
  const { groupId, date } = req.body;

  // Validate input
  if (!groupId) {
    return res.status(400).json({ error: "groupId is required" });
  }

  try {
    // Only update groups belonging to the current user
    const updated = await WorkoutGroup.findOneAndUpdate(
      { _id: groupId, userId: req.session.userId },
      { scheduledDate: date || null },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "WorkoutGroup not found" });
    }

    // Return the updated group so the client can re-render if needed
    res.json({ success: true, group: updated });
  } catch (err) {
    console.error("Assignment error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
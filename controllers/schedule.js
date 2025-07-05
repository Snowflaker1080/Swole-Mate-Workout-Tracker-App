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
      const relative = date.from(today); // e.g., "in 3 days"

      // Get groups assigned to this date
      const groups = await WorkoutGroup.find({
        userId: req.session.userId,
        scheduledDate: isoDate,
      });

      week.push({
        date: isoDate,
        label,
        relative,
        groups,
      });
    }

    calendar.push(week);
  }

  // Fetch unscheduled groups
  const unscheduledGroups = await WorkoutGroup.find({
    userId: req.session.userId,
    scheduledDate: { $exists: false },
  });

// render to EJS view
  res.render("schedule/index", {
    calendar,
    todayLabel: today.format("dddd, D MMMM YYYY"),
    unscheduledGroups,
  });
}

// Assign a workout group to a date
export async function assign(req, res) {
  const { groupId, date } = req.body;
  try {
    await WorkoutGroup.findByIdAndUpdate(groupId, { scheduledDate: date || null });
    res.sendStatus(200);
  } catch (err) {
    console.error("Assignment error:", err);
    res.sendStatus(500);
  }
}

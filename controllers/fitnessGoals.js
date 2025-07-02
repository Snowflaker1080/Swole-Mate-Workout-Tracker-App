const FitnessGoal = require('../models/fitnessGoal');

async function index(req, res) {
  if (!req.user) {
    return res.redirect('/auth/sign-in'); // fallback if middleware fails
  }

  const goals = await FitnessGoal.find({ userId: req.user._id });
  res.render('fitnessGoals/index', { goals });
}

// Render the multi-goal creation form
const newForm = async (req, res) => {
  try {
    const existingGoals = await FitnessGoal.find({ userId: req.session.userId });
    const goalMap = {};
    existingGoals.forEach(goal => {
      goalMap[goal.goalType] = goal;
    });

    res.render("fitnessGoals/new", { existingGoals: goalMap });
  } catch (err) {
    console.error("Error loading new goal form:", err);
    res.status(500).send("Internal Server Error");
  }
};

// Bulk create or update selected goals
const bulkCreateOrUpdate = async (req, res) => {
  const userId = req.session.userId;
  let selected = req.body.selectedGoals;

  if (!selected) return res.redirect("/fitnessGoals");
  if (!Array.isArray(selected)) selected = [selected]; // Ensure array for single selection

  const operations = [];

  for (const goalType of selected) {
    const data = req.body[goalType];
    if (!data) continue;

    operations.push(
      FitnessGoal.findOneAndUpdate(
        { userId, goalType },
        {
          userId,
          goalType,
          startValue: data.startValue,
          targetValue: data.targetValue,
          unit: data.unit,
          startDate: data.startDate,
          targetDate: data.targetDate
        },
        { upsert: true, new: true }
      )
    );
  }

  try {
    await Promise.all(operations);
    res.redirect("/fitnessGoals");
  } catch (err) {
    console.error("Error saving goals:", err);
    res.status(500).send("Internal Server Error");
  }
};

// Render edit form for a single goal
const edit = async (req, res) => {
  try {
    const goal = await FitnessGoal.findById(req.params.id);
    if (!goal) return res.status(404).send("Goal not found");

    const goalLabels = {
      startWeightKg: "Start Weight",
      targetWeightKg: "Target Weight",
      startBodyFat: "Start Body Fat %",
      targetBodyFat: "Target Body Fat %",
      startRestingHR: "Resting Heart Rate",
      targetRestingHR: "Target Heart Rate",
      startVO2Max: "Start VO2 Max",
      targetVO2Max: "Target VO2 Max"
    };

    const goalLabel = goalLabels[goal.goalType] || goal.goalType;
    res.render("fitnessGoals/edit", { goal, goalLabel });

  } catch (err) {
    console.error("Error loading edit form:", err);
    res.status(500).send("Internal Server Error");
  }
};

// Update a single goal by ID
const update = async (req, res) => {
  try {
    const goal = await FitnessGoal.findOneAndUpdate (
      { _id: req.params.id, userId: req.session.userId }, // securely match
      {  
      startValue: req.body.startValue,
        targetValue: req.body.targetValue,
        unit: req.body.unit,
        startDate: req.body.startDate,
        targetDate: req.body.targetDate
      },
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(403).send("Not authorised to udpate this goal.");
    }

    res.redirect("/fitnessGoals");
  } catch (err) {
    console.error("Error updating goal:", err);
    res.status(500).send("Internal Server Error");
  }
};

// Delete a single goal by ID (with ownership check)
const remove = async (req, res) => {
  try {
    const deleted = await FitnessGoal.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.userId // ensure only the owner can delete
    });

    if (!deleted) {
      return res.status(403).send("Not authorised to delete this goal.");
    }

    res.redirect("/fitnessGoals");
  } catch (err) {
    console.error("Error deleting goal:", err);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = {
  index,
  new: newForm,
  bulkCreateOrUpdate,
  edit,
  update,
  deleteGoal: remove
};
// Show all goals for the user
const FitnessGoal = require('../models/FitnessGoal');

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
    res.render("fitnessGoals/edit", { goal });
  } catch (err) {
    console.error("Error loading edit form:", err);
    res.status(500).send("Internal Server Error");
  }
};

// Update a single goal by ID
const update = async (req, res) => {
  try {
    await FitnessGoal.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/fitnessGoals");
  } catch (err) {
    console.error("Error updating goal:", err);
    res.status(500).send("Internal Server Error");
  }
};

// Delete a single goal by ID
const remove = async (req, res) => {
  try {
    await FitnessGoal.findByIdAndDelete(req.params.id);
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
  delete: remove
};
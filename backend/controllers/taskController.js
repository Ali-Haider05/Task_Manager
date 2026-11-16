const mongoose = require("mongoose");

const Task = require("../models/Task");

const taskFields = ["title", "description", "status", "priority", "dueDate"];
const taskQueryFields = ["status", "priority", "search"];
const taskStatuses = ["todo", "in-progress", "done"];
const taskPriorities = ["low", "medium", "high"];

function isValidTaskId(id) {
  return /^[a-f\d]{24}$/i.test(id);
}

function hasValidationError(error) {
  return error && (error.name === "ValidationError" || error.name === "CastError");
}

function taskDataFromBody(body) {
  return taskFields.reduce((data, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      data[field] = body[field];
    }

    return data;
  }, {});
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getTaskQuery(req) {
  const query = req.query;
  const unknownFields = Object.keys(query).filter(
    (field) => !taskQueryFields.includes(field),
  );

  if (unknownFields.length > 0) {
    return { error: "Unexpected task query parameter" };
  }

  for (const field of taskQueryFields) {
    if (field in query && typeof query[field] !== "string") {
      return { error: `${field} must be provided once` };
    }
  }

  if (query.status && !taskStatuses.includes(query.status)) {
    return { error: "Invalid task status" };
  }

  if (query.priority && !taskPriorities.includes(query.priority)) {
    return { error: "Invalid task priority" };
  }

  if (query.search && query.search.length > 100) {
    return { error: "Search text must be 100 characters or fewer" };
  }

  return { query };
}

async function createTask(req, res, next) {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      res.status(400).json({ message: "Invalid task data" });
      return;
    }

    const task = await Task.create({
      ...taskDataFromBody(req.body),
      user: req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    if (hasValidationError(error)) {
      res.status(400).json({ message: "Invalid task data" });
      return;
    }

    next(error);
  }
}

async function getTasks(req, res, next) {
  const { query, error } = getTaskQuery(req);

  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  try {
    const filter = { user: req.user._id };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.priority) {
      filter.priority = query.priority;
    }

    if (query.search) {
      const searchPattern = new RegExp(escapeRegex(query.search), "i");
      filter.$or = [
        { title: searchPattern },
        { description: searchPattern },
      ];
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
}

async function getTaskStats(req, res, next) {
  try {
    const [stats] = await Task.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          todo: {
            $sum: {
              $cond: [{ $eq: ["$status", "todo"] }, 1, 0],
            },
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0],
            },
          },
          done: {
            $sum: {
              $cond: [{ $eq: ["$status", "done"] }, 1, 0],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      total: stats ? stats.total : 0,
      todo: stats ? stats.todo : 0,
      inProgress: stats ? stats.inProgress : 0,
      done: stats ? stats.done : 0,
    });
  } catch (error) {
    next(error);
  }
}

async function getTaskById(req, res, next) {
  if (!isValidTaskId(req.params.id)) {
    res.status(400).json({ message: "Invalid task ID" });
    return;
  }

  try {
    const task = await Task.findOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
      user: req.user._id,
    });

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  if (!isValidTaskId(req.params.id)) {
    res.status(400).json({ message: "Invalid task ID" });
    return;
  }

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    res.status(400).json({ message: "Invalid task data" });
    return;
  }

  const unknownFields = Object.keys(req.body).filter(
    (field) => !taskFields.includes(field),
  );

  if (unknownFields.length > 0) {
    res.status(400).json({ message: "Unknown task field" });
    return;
  }

  const updates = taskDataFromBody(req.body);

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ message: "No task fields provided" });
    return;
  }

  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(req.params.id),
        user: req.user._id,
      },
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    if (hasValidationError(error)) {
      res.status(400).json({ message: "Invalid task data" });
      return;
    }

    next(error);
  }
}

async function deleteTask(req, res, next) {
  if (!isValidTaskId(req.params.id)) {
    res.status(400).json({ message: "Invalid task ID" });
    return;
  }

  try {
    const task = await Task.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(req.params.id),
      user: req.user._id,
    });

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTask,
  getTasks,
  getTaskStats,
  getTaskById,
  updateTask,
  deleteTask,
};

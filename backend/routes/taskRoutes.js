const express = require("express");

const {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  getTaskStats,
  updateTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.route("/").post(createTask).get(getTasks);
router.get("/stats/summary", getTaskStats);
router
  .route("/:id")
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;

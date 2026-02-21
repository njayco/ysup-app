const { body, param, query } = require("express-validator")

// Common validation rules
const validationRules = {
  // User validation
  userRegistration: [
    body("firstName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters")
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage("First name can only contain letters and spaces"),

    body("lastName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters")
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage("Last name can only contain letters and spaces"),

    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username can only contain letters, numbers, and underscores"),

    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),

    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain at least one lowercase letter, one uppercase letter, and one number"),

    body("phone").optional().isMobilePhone().withMessage("Please provide a valid phone number"),

    body("college")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("College name must be between 2 and 100 characters"),

    body("major").trim().isLength({ min: 2, max: 100 }).withMessage("Major must be between 2 and 100 characters"),

    body("year")
      .isIn(["Freshman", "Sophomore", "Junior", "Senior", "Graduate", "Other"])
      .withMessage("Invalid academic year"),
  ],

  userLogin: [
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),

    body("password").notEmpty().withMessage("Password is required"),
  ],

  // Course validation
  courseCreation: [
    body("name").trim().isLength({ min: 3, max: 100 }).withMessage("Course name must be between 3 and 100 characters"),

    body("code")
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage("Course code must be between 3 and 20 characters")
      .matches(/^[A-Z]{2,4}\d{3,4}[A-Z]?$/)
      .withMessage("Course code format is invalid (e.g., CS101, MATH151)"),

    body("description")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Description must be between 10 and 1000 characters"),

    body("credits").isInt({ min: 1, max: 6 }).withMessage("Credits must be between 1 and 6"),

    body("maxStudents").optional().isInt({ min: 1, max: 500 }).withMessage("Max students must be between 1 and 500"),
  ],

  // Post validation
  postCreation: [
    body("content")
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage("Post content must be between 1 and 2000 characters"),

    body("type")
      .optional()
      .isIn(["question", "discussion", "announcement", "study-group", "resource"])
      .withMessage("Invalid post type"),

    body("tags").optional().isArray({ max: 10 }).withMessage("Maximum 10 tags allowed"),

    body("tags.*")
      .optional()
      .trim()
      .isLength({ min: 1, max: 30 })
      .withMessage("Each tag must be between 1 and 30 characters"),
  ],

  // Game validation
  gameAction: [
    body("action")
      .isIn(["ask_question", "provide_assistance", "correct_answer", "attendance", "good_behavior"])
      .withMessage("Invalid game action"),

    body("points").optional().isInt({ min: 1, max: 1000 }).withMessage("Points must be between 1 and 1000"),

    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters"),
  ],

  // Common parameter validation
  mongoId: [param("id").isMongoId().withMessage("Invalid ID format")],

  // Pagination validation
  pagination: [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),

    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  ],

  // Search validation
  search: [
    query("q")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Search query must be between 1 and 100 characters"),
  ],
}

module.exports = validationRules

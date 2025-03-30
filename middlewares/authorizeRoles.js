const userModel = require("../models/userModel");

const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Denied" });
    }

    // If the user is a Manager and trying to create a task
    // if (req.method === "POST" && req.originalUrl.includes('/createTask') && req.user.role === "Manager") {
    //   try {
    //     // Get the assignee's role from the database
    //     const assignee = await userModel.findById(req.body.assignedTo);
        
    //     // If assignee is an Admin, deny access
    //     if (assignee && assignee.role === "Admin") {
    //       return res.status(403).json({
    //         message: "Managers can only assign tasks to Employees, not to Admin"
    //       });
    //     }

    //   } catch (error) {
    //     return res.status(500).json({
    //       message: "Error checking assignee role",
    //       error: error.message
    //     });
    //   }
    // }
    next();
  };
};

module.exports = authorizeRoles;

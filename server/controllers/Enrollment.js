const Course = require("../models/Course");

exports.enrollFreeCourses = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courses } = req.body;

    if (!courses || courses.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No courses provided for enrollment",
      });
    }

    for (const courseId of courses) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: `Course not found: ${courseId}`,
        });
      }

      if (course.price > 0) {
        return res.status(400).json({
          success: false,
          message: `Course "${course.title}" is not free`,
        });
      }

      if (!course.studentsEnrolled.includes(studentId)) {
        course.studentsEnrolled.push(studentId);
        await course.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Successfully enrolled in free courses",
    });
  } catch (err) {
    console.error("Error in enrollFreeCourses:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during enrollment",
    });
  }
};

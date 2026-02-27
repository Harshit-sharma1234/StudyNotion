const supabase = require("../config/supabase")

exports.enrollFreeCourses = async (req, res) => {
  try {
    const studentId = req.user.id
    const { courses } = req.body

    if (!courses || courses.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No courses provided for enrollment",
      })
    }

    for (const courseId of courses) {
      // 1. Fetch course details
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single()

      if (courseError || !course) {
        return res.status(404).json({
          success: false,
          message: `Course not found: ${courseId}`,
        })
      }

      // 2. Check if course is free
      if (course.price > 0) {
        return res.status(400).json({
          success: false,
          message: `Course "${course.course_name}" is not free`,
        })
      }

      // 3. Check for existing enrollment
      const { data: enrollment, error: enrollCheckError } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("user_id", studentId)
        .eq("course_id", courseId)
        .single()

      if (!enrollment) {
        // Enroll student
        const { error: enrollError } = await supabase
          .from("course_enrollments")
          .insert({ user_id: studentId, course_id: courseId })

        if (enrollError) throw enrollError

        // Initialize progress
        const { error: progressError } = await supabase
          .from("course_progress")
          .insert({ user_id: studentId, course_id: courseId })

        if (progressError) throw progressError
      }
    }

    return res.status(200).json({
      success: true,
      message: "Successfully enrolled in free courses",
    })
  } catch (err) {
    console.error("Error in enrollFreeCourses:", err)
    return res.status(500).json({
      success: false,
      message: "Something went wrong during enrollment",
      error: err.message
    })
  }
}

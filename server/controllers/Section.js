const supabase = require("../config/supabase")

// Utility to fetch full course details similar to populate() in Mongoose
const getFullCourseDetails = async (courseId) => {
  const { data: course, error } = await supabase
    .from("courses")
    .select(`
      *,
      users!instructor_id (
        id,
        first_name,
        last_name,
        image,
        profiles (*)
      ),
      categories (*),
      ratings_reviews (*),
      courseContent:sections (
        *,
        subSection:sub_sections (*)
      )
    `)
    .eq("id", courseId)
    .single()

  if (error) throw error
  return course
}

// CREATE a new section
exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body

    if (!sectionName || !courseId) {
      return res.status(400).json({ success: false, message: "Missing required properties" })
    }

    // Create a new section in Supabase
    const { data: newSection, error: sectionError } = await supabase
      .from("sections")
      .insert({ section_name: sectionName, course_id: courseId })
      .select()
      .single()

    if (sectionError) throw sectionError

    // Fetch updated course with all sections and subsections
    const updatedCourse = await getFullCourseDetails(courseId)

    res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourse,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// UPDATE a section
exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId, courseId } = req.body

    const { data: updatedSection, error: sectionError } = await supabase
      .from("sections")
      .update({ section_name: sectionName })
      .eq("id", sectionId)
      .select()
      .single()

    if (sectionError) throw sectionError

    const course = await getFullCourseDetails(courseId)

    res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: course,
    })
  } catch (error) {
    console.error("Error updating section:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// DELETE a section
exports.deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body

    // Cascade delete is handled by Supabase schema:
    // sections.course_id REFERENCES courses(id) ON DELETE CASCADE
    // sub_sections.section_id REFERENCES sections(id) ON DELETE CASCADE

    const { error: deleteError } = await supabase
      .from("sections")
      .delete()
      .eq("id", sectionId)

    if (deleteError) throw deleteError

    // find the updated course and return it
    const course = await getFullCourseDetails(courseId)

    res.status(200).json({
      success: true,
      message: "Section deleted",
      data: course,
    })
  } catch (error) {
    console.error("Error deleting section:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

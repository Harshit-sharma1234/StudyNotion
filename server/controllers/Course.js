const supabase = require("../config/supabase")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const { convertSecondsToDuration } = require("../utils/secToDuration")

// Function to create a new course
exports.createCourse = async (req, res) => {
  try {
    const userId = req.user.id
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: _tag,
      category,
      status,
      instructions: _instructions,
    } = req.body

    const thumbnail = req.files.thumbnailImage

    const tag = JSON.parse(_tag)
    const instructions = JSON.parse(_instructions)

    if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag.length || !thumbnail || !category || !instructions.length) {
      return res.status(400).json({ success: false, message: "All Fields are Mandatory" })
    }

    if (!status) status = "Draft"

    // Verify instructor exists and is an instructor
    const { data: instructorDetails, error: instructorError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .eq("account_type", "Instructor")
      .single()

    if (instructorError || !instructorDetails) {
      return res.status(404).json({ success: false, message: "Instructor Details Not Found" })
    }

    // Verify category exists
    const { data: categoryDetails, error: categoryError } = await supabase
      .from("categories")
      .select("*")
      .eq("id", category)
      .single()

    if (categoryError || !categoryDetails) {
      return res.status(404).json({ success: false, message: "Category Details Not Found" })
    }

    // Upload Thumbnail to Cloudinary
    const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME)

    // Create new course in Supabase
    const { data: newCourse, error: courseCreateError } = await supabase
      .from("courses")
      .insert({
        course_name: courseName,
        course_description: courseDescription,
        instructor_id: userId,
        what_you_will_learn: whatYouWillLearn,
        price,
        tags: tag,
        category_id: category,
        thumbnail: thumbnailImage.secure_url,
        status: status,
        instructions,
      })
      .select()
      .single()

    if (courseCreateError) throw courseCreateError

    res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course Created Successfully",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    })
  }
}

// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const updates = req.body

    // Check if course exists
    const { data: course, error: fetchError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single()

    if (fetchError || !course) {
      return res.status(404).json({ error: "Course not found" })
    }

    const updateData = {}

    // Map request body to SQL column names
    if (updates.courseName) updateData.course_name = updates.courseName
    if (updates.courseDescription) updateData.course_description = updates.courseDescription
    if (updates.whatYouWillLearn) updateData.what_you_will_learn = updates.whatYouWillLearn
    if (updates.price) updateData.price = updates.price
    if (updates.category) updateData.category_id = updates.category
    if (updates.status) updateData.status = updates.status
    if (updates.tag) updateData.tags = JSON.parse(updates.tag)
    if (updates.instructions) updateData.instructions = JSON.parse(updates.instructions)

    // Handle Thumbnail Update
    if (req.files && req.files.thumbnailImage) {
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME)
      updateData.thumbnail = thumbnailImage.secure_url
    }

    // Update Course in Supabase
    const { data: updatedCourseRaw, error: updateError } = await supabase
      .from("courses")
      .update(updateData)
      .eq("id", courseId)
      .select(`
        *,
        users!instructor_id (
          *,
          profiles (*)
        ),
        categories (*),
        ratings_reviews (*),
        sections (
          *,
          sub_sections (*)
        )
      `)
      .single()

    if (updateError) throw updateError

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourseRaw,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
// Get Course List
exports.getAllCourses = async (req, res) => {
  try {
    const { data: allCourses, error } = await supabase
      .from("courses")
      .select(`
        id,
        course_name,
        price,
        thumbnail,
        instructor_id,
        status,
        users!instructor_id (
          id,
          first_name,
          last_name,
          image
        ),
        ratings_reviews (count)
      `)
      .eq("status", "Published")

    if (error) throw error

    return res.status(200).json({
      success: true,
      data: allCourses,
    })
  } catch (error) {
    console.log(error)
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    })
  }
}

exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const { data: courseDetails, error } = await supabase
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
        sections (
          *,
          sub_sections (*)
        )
      `)
      .eq("id", courseId)
      .single()

    if (error || !courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    let totalDurationInSeconds = 0
    courseDetails.sections?.forEach((section) => {
      section.sub_sections?.forEach((subSection) => {
        totalDurationInSeconds += parseInt(subSection.time_duration || 0)
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id

    // Fetch course details
    const { data: courseDetails, error } = await supabase
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
        sections (
          *,
          sub_sections (*)
        )
      `)
      .eq("id", courseId)
      .single()

    if (error || !courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // Fetch progress
    const { data: courseProgress, error: progressError } = await supabase
      .from("course_progress")
      .select(`
        *,
        completed_videos (sub_section_id)
      `)
      .eq("course_id", courseId)
      .eq("user_id", userId)
      .single()

    let totalDurationInSeconds = 0
    courseDetails.sections?.forEach((section) => {
      section.sub_sections?.forEach((subSection) => {
        totalDurationInSeconds += parseInt(subSection.time_duration || 0)
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgress?.completed_videos || [],
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user.id

    const { data: instructorCourses, error } = await supabase
      .from("courses")
      .select("*")
      .eq("instructor_id", instructorId)
      .order("created_at", { ascending: false })

    if (error) throw error

    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}

// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    // Check if course exists
    const { data: course, error: fetchError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .single()

    if (fetchError || !course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Delete the course (Cascading deletes will handle Sections, SubSections, Enrollments, Progress, Ratings)
    const { error: deleteError } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId)

    if (deleteError) throw deleteError

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

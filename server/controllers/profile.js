const supabase = require("../config/supabase")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const { convertSecondsToDuration } = require("../utils/secToDuration")

// Utility to map Supabase user record to frontend format
const mapUserToFrontend = (dbUser) => {
  if (!dbUser) return null
  return {
    id: dbUser.id,
    firstName: dbUser.first_name,
    lastName: dbUser.last_name,
    email: dbUser.email,
    accountType: dbUser.account_type,
    active: dbUser.active,
    approved: dbUser.approved,
    image: dbUser.image,
    additionalDetails: dbUser.profiles
      ? {
        id: dbUser.profiles.id,
        gender: dbUser.profiles.gender,
        dateOfBirth: dbUser.profiles.date_of_birth,
        about: dbUser.profiles.about,
        contactNumber: dbUser.profiles.contact_number,
      }
      : null,
  }
}


// Method for updating a profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contactNumber = "",
      gender = "",
    } = req.body
    const id = req.user.id // This is the UUID from Supabase 'users' table

    // Update the User details (first_name, last_name)
    const { data: updatedUser, error: userError } = await supabase
      .from("users")
      .update({
        first_name: firstName,
        last_name: lastName,
      })
      .eq("id", id)
      .select()
      .single()

    if (userError) throw userError

    // Check if profile exists, if not create one
    if (!updatedUser.additional_details_id) {
      const { data: newProfile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          date_of_birth: dateOfBirth,
          about: about,
          contact_number: contactNumber,
          gender: gender,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      await supabase
        .from("users")
        .update({ additional_details_id: newProfile.id })
        .eq("id", id);
    } else {
      // Update the Profile details
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          date_of_birth: dateOfBirth,
          about: about,
          contact_number: contactNumber,
          gender: gender,
        })
        .eq("id", updatedUser.additional_details_id)

      if (profileError) throw profileError
    }


    // Fetch the combined user details
    const { data: fullUserDetails, error: fetchError } = await supabase
      .from("users")
      .select("*, profiles(*)")
      .eq("id", id)
      .single()

    if (fetchError) throw fetchError

    return res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails: mapUserToFrontend(fullUserDetails),
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id

    // Check if user exists
    const { data: user, error: userFetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single()

    if (userFetchError || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Delete Associated Profile
    if (user.additional_details_id) {
      await supabase.from("profiles").delete().eq("id", user.additional_details_id)
    }

    // Note: Course enrollments and progress deletion should ideally be handled by 
    // ON DELETE CASCADE in the database schema, but for explicit safety:
    await supabase.from("course_enrollments").delete().eq("user_id", id)
    await supabase.from("course_progress").delete().eq("user_id", id)

    // Delete User
    const { error: deleteError } = await supabase.from("users").delete().eq("id", id)
    if (deleteError) throw deleteError

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ success: false, message: "User Cannot be deleted successfully" })
  }
}

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id
    const { data: userDetails, error } = await supabase
      .from("users")
      .select("*, profiles(*)")
      .eq("id", id)
      .single()

    if (error) throw error

    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: mapUserToFrontend(userDetails),
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user details",
    })
  }
}

exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )

    const { error: updateError } = await supabase
      .from("users")
      .update({ image: image.secure_url })
      .eq("id", userId)

    if (updateError) throw updateError

    // Fetch the combined user details
    const { data: fullUserDetails, error: fetchError } = await supabase
      .from("users")
      .select("*, profiles(*)")
      .eq("id", userId)
      .single()

    if (fetchError) throw fetchError

    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: mapUserToFrontend(fullUserDetails),
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id

    // Fetch courses enrolled by user with all nested content
    const { data: enrollmentData, error: enrollError } = await supabase
      .from("course_enrollments")
      .select(`
        courses (
          *,
          categories (*),
          sections (
            *,
            sub_sections (*)
          )
        )
      `)
      .eq("user_id", userId)

    if (enrollError) throw enrollError

    const courses = enrollmentData.map(enrollment => enrollment.courses)

    for (const course of courses) {
      let totalDurationInSeconds = 0
      let SubsectionLength = 0

      if (course.sections) {
        for (const section of course.sections) {
          if (section.sub_sections) {
            totalDurationInSeconds += section.sub_sections.reduce(
              (acc, curr) => acc + parseInt(curr.time_duration || 0),
              0
            )
            SubsectionLength += section.sub_sections.length
          }
        }
      }

      course.totalDuration = convertSecondsToDuration(totalDurationInSeconds)

      // Fetch progress for this course
      const { data: progressData } = await supabase
        .from("course_progress")
        .select(`
          id,
          completed_videos (sub_section_id)
        `)
        .eq("user_id", userId)
        .eq("course_id", course.id)
        .single()

      const completedVideosCount = progressData?.completed_videos?.length || 0

      if (SubsectionLength === 0) {
        course.progressPercentage = 100
      } else {
        const multiplier = Math.pow(10, 2)
        course.progressPercentage =
          Math.round(
            (completedVideosCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }

    return res.status(200).json({
      success: true,
      data: courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.instructorDashboard = async (req, res) => {
  try {
    const userId = req.user.id

    // Fetch courses created by this instructor
    const { data: courses, error } = await supabase
      .from("courses")
      .select(`
        *,
        course_enrollments (count)
      `)
      .eq("instructor_id", userId)

    if (error) throw error

    const courseData = courses.map((course) => {
      const totalStudentsEnrolled = course.course_enrollments?.[0]?.count || 0
      const totalAmountGenerated = totalStudentsEnrolled * (course.price || 0)

      return {
        id: course.id,
        courseName: course.course_name,
        courseDescription: course.course_description,
        totalStudentsEnrolled,
        totalAmountGenerated,
      }
    })

    res.status(200).json({ courses: courseData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

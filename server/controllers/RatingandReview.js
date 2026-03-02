const supabase = require("../config/supabase")

// Create a new rating and review
exports.createRating = async (req, res) => {
  try {
    const userId = req.user.id
    const { rating, review, courseId } = req.body

    // Check if the user is enrolled in the course
    const { data: enrollment, error: enrollError } = await supabase
      .from("course_enrollments")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single()

    if (enrollError || !enrollment) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in this course",
      })
    }

    // Check if the user has already reviewed the course
    const { data: alreadyReviewed, error: reviewCheckError } = await supabase
      .from("ratings_reviews")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single()

    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course already reviewed by user",
      })
    }

    // Create a new rating and review
    const { data: ratingReview, error: insertError } = await supabase
      .from("ratings_reviews")
      .insert({
        rating,
        review,
        course_id: courseId,
        user_id: userId,
      })
      .select()
      .single()

    if (insertError) throw insertError

    return res.status(201).json({
      success: true,
      message: "Rating and review created successfully",
      ratingReview,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// Get the average rating for a course
exports.getAverageRating = async (req, res) => {
  try {
    const courseId = req.body.courseId

    const { data: ratings, error } = await supabase
      .from("ratings_reviews")
      .select("rating")
      .eq("course_id", courseId)

    if (error) throw error

    if (ratings.length > 0) {
      const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0)
      const averageRating = sum / ratings.length

      return res.status(200).json({
        success: true,
        averageRating: averageRating,
      })
    }

    // If no ratings are found, return 0 as the default rating
    return res.status(200).json({ success: true, averageRating: 0 })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve the rating for the course",
      error: error.message,
    })
  }
}

// Get all rating and reviews
exports.getAllRatingReview = async (req, res) => {
  try {
    const { data: allReviews, error } = await supabase
      .from("ratings_reviews")
      .select(`
        *,
        users!user_id (
          first_name,
          last_name,
          email,
          image
        ),
        courses!course_id (
          course_name
        )
      `)
      .order("rating", { ascending: false })

    if (error) throw error

    res.status(200).json({
      success: true,
      data: allReviews,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve the rating and review for the course",
      error: error.message,
    })
  }
}

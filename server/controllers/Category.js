const supabase = require("../config/supabase");

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const { data: category, error } = await supabase
      .from("categories")
      .insert({ name, description })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Category Created Successfully",
      data: category
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.showAllCategories = async (req, res) => {
  try {
    const { data: allCategories, error } = await supabase
      .from("categories")
      .select("*");

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: allCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;

    // 1. Get courses for the specified category
    const { data: selectedCategory, error: selectedError } = await supabase
      .from("categories")
      .select(`
				*,
				courses!courses_category_id_fkey (
					*,
					ratings_reviews (*)
				)
			`)
      .eq("id", categoryId)
      .eq("courses.status", "Published")
      .single();

    if (selectedError || !selectedCategory) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    if (!selectedCategory.courses || selectedCategory.courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      });
    }

    // 2. Get courses for other categories
    const { data: otherCategories, error: othersError } = await supabase
      .from("categories")
      .select(`
				*,
				courses (
					*,
					ratings_reviews (*)
				)
			`)
      .neq("id", categoryId)
      .eq("courses.status", "Published");

    let differentCategory = null;
    if (otherCategories && otherCategories.length > 0) {
      differentCategory = otherCategories[getRandomInt(otherCategories.length)];
    }

    // 3. Get most selling courses (across all categories)
    // We join with course_enrollments to count 'sales'
    const { data: allCoursesData, error: coursesError } = await supabase
      .from("courses")
      .select(`
				*,
				users!instructor_id (id, first_name, last_name, image),
				course_enrollments (count)
			`)
      .eq("status", "Published");

    if (coursesError) throw coursesError;

    const mostSellingCourses = allCoursesData
      .map(course => ({
        ...course,
        sold: course.course_enrollments?.[0]?.count || 0
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
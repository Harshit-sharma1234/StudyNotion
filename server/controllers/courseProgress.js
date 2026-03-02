const supabase = require("../config/supabase")

exports.updateCourseProgress = async (req, res) => {
    const { courseId, subSectionId } = req.body
    const userId = req.user.id

    try {
        // 1. Check if the subsection is valid
        const { data: subSection, error: sectionError } = await supabase
            .from("sub_sections")
            .select("*")
            .eq("id", subSectionId)
            .single()

        if (sectionError || !subSection) {
            return res.status(404).json({ error: "Invalid SubSection" })
        }

        // 2. Find course progress entry for the user
        const { data: courseProgress, error: progressFetchError } = await supabase
            .from("course_progress")
            .select("id")
            .eq("course_id", courseId)
            .eq("user_id", userId)
            .single()

        if (progressFetchError || !courseProgress) {
            return res.status(404).json({
                success: false,
                message: "Course Progress does not exist",
            })
        }

        // 3. Check if video already completed
        const { data: alreadyCompleted, error: completedError } = await supabase
            .from("completed_videos")
            .select("*")
            .eq("progress_id", courseProgress.id)
            .eq("sub_section_id", subSectionId)
            .single()

        if (alreadyCompleted) {
            return res.status(400).json({
                error: "Subsection already completed",
            })
        }

        // 4. Insert into completed_videos
        const { error: insertError } = await supabase
            .from("completed_videos")
            .insert({
                progress_id: courseProgress.id,
                sub_section_id: subSectionId,
            })

        if (insertError) throw insertError

        return res.status(200).json({
            success: true,
            message: "Course Progress Updated Successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Internal Server Error", message: error.message })
    }
}

exports.getProgressPercentage = async (req, res) => {
    const { courseId } = req.body
    const userId = req.user.id

    if (!courseId) {
        return res.status(400).json({ error: "Course ID not provided." })
    }

    try {
        // 1. Fetch course progress entry
        const { data: courseProgress, error: progressFetchError } = await supabase
            .from("course_progress")
            .select("id")
            .eq("course_id", courseId)
            .eq("user_id", userId)
            .single()

        if (progressFetchError || !courseProgress) {
            return res.status(400).json({ error: "Can not find Course Progress with these IDs." })
        }

        // 2. Count completed videos
        const { count: completedCount, error: countError } = await supabase
            .from("completed_videos")
            .select("*", { count: "exact", head: true })
            .eq("progress_id", courseProgress.id)

        if (countError) throw countError

        // 3. Count total subsections in the course
        const { data: sections, errorContentError } = await supabase
            .from("sections")
            .select(`
            id,
            sub_sections (id)
        `)
            .eq("course_id", courseId)

        if (errorContentError) throw errorContentError

        let totalLectures = 0
        sections.forEach(sec => {
            totalLectures += sec.sub_sections?.length || 0
        })

        let progressPercentage = 0
        if (totalLectures > 0) {
            progressPercentage = (completedCount / totalLectures) * 100
        }

        // To make it up to 2 decimal points
        const multiplier = Math.pow(10, 2)
        progressPercentage = Math.round(progressPercentage * multiplier) / multiplier

        return res.status(200).json({
            success: true,
            data: progressPercentage,
            message: "Successfully fetched Course progress",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Internal server error", message: error.message })
    }
}

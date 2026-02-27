const supabase = require("../config/supabase")
const { uploadImageToCloudinary } = require("../utils/imageUploader")

// Utility to fetch section with its sub-sections
const getUpdatedSection = async (sectionId) => {
  const { data: section, error } = await supabase
    .from("sections")
    .select(`
      *,
      sub_sections (*)
    `)
    .eq("id", sectionId)
    .single()

  if (error) throw error
  return section
}

// Create a new sub-section for a given section
exports.createSubSection = async (req, res) => {
  try {
    const { sectionId, title, description } = req.body
    const video = req.files.video

    if (!sectionId || !title || !description || !video) {
      return res.status(404).json({ success: false, message: "All Fields are Required" })
    }

    // Upload video to Cloudinary
    const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME)

    // Create sub-section in Supabase
    const { data: subSection, error: subSectionError } = await supabase
      .from("sub_sections")
      .insert({
        section_id: sectionId,
        title: title,
        time_duration: `${uploadDetails.duration}`,
        description: description,
        video_url: uploadDetails.secure_url,
      })
      .select()
      .single()

    if (subSectionError) throw subSectionError

    // Fetch updated section with its sub-sections
    const updatedSection = await getUpdatedSection(sectionId)

    return res.status(200).json({ success: true, data: updatedSection })
  } catch (error) {
    console.error("Error creating new sub-section:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description } = req.body

    // Check if subSection exists
    const { data: subSection, error: fetchError } = await supabase
      .from("sub_sections")
      .select("*")
      .eq("id", subSectionId)
      .single()

    if (fetchError || !subSection) {
      return res.status(404).json({ success: false, message: "SubSection not found" })
    }

    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description

    if (req.files && req.files.video) {
      const video = req.files.video
      const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME)
      updateData.video_url = uploadDetails.secure_url
      updateData.time_duration = `${uploadDetails.duration}`
    }

    // Update in Supabase
    const { error: updateError } = await supabase
      .from("sub_sections")
      .update(updateData)
      .eq("id", subSectionId)

    if (updateError) throw updateError

    const updatedSection = await getUpdatedSection(sectionId)

    return res.json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
      error: error.message
    })
  }
}

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body

    const { error: deleteError } = await supabase
      .from("sub_sections")
      .delete()
      .eq("id", subSectionId)

    if (deleteError) throw deleteError

    const updatedSection = await getUpdatedSection(sectionId)

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
      error: error.message
    })
  }
}

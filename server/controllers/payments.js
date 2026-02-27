const { instance } = require("../config/razorpay")
const supabase = require("../config/supabase")
const crypto = require("crypto")
const mailSender = require("../utils/mailSender")
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body
  const userId = req.user.id
  if (courses.length === 0) {
    return res.json({ success: false, message: "Please Provide Course ID" })
  }

  let total_amount = 0

  for (const course_id of courses) {
    try {
      // Find the course in Supabase
      const { data: course, error: fetchError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", course_id)
        .single()

      if (fetchError || !course) {
        return res.status(200).json({ success: false, message: "Could not find the Course" })
      }

      // Check if the user is already enrolled in the course
      const { data: enrollment, error: enrollError } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("user_id", userId)
        .eq("course_id", course_id)
        .single()

      if (enrollment) {
        return res.status(200).json({ success: false, message: "Student is already Enrolled" })
      }

      total_amount += course.price
    } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  }

  try {
    const paymentResponse = await instance.orders.create(options)
    res.json({
      success: true,
      data: paymentResponse,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Could not initiate order." })
  }
}

// verify the payment
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id
  const razorpay_payment_id = req.body?.razorpay_payment_id
  const razorpay_signature = req.body?.razorpay_signature
  const courses = req.body?.courses
  const userId = req.user.id

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId) {
    return res.status(200).json({ success: false, message: "Payment Failed" })
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex")

  if (expectedSignature === razorpay_signature) {
    await enrollStudents(courses, userId, res)
    return res.status(200).json({ success: true, message: "Payment Verified" })
  }

  return res.status(200).json({ success: false, message: "Payment Failed" })
}

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body
  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res.status(400).json({ success: false, message: "Please provide all the details" })
  }

  try {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (userError || !user) throw new Error("User not found")

    await mailSender(
      user.email,
      `Payment Received`,
      paymentSuccessEmail(`${user.first_name} ${user.last_name}`, amount / 100, orderId, paymentId)
    )
  } catch (error) {
    console.log("error in sending mail", error)
    return res.status(400).json({ success: false, message: "Could not send email" })
  }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res.status(400).json({ success: false, message: "Please Provide Course ID and User ID" })
  }

  for (const courseId of courses) {
    try {
      // 1. Add course enrollment entry
      const { error: enrollError } = await supabase
        .from("course_enrollments")
        .insert({ user_id: userId, course_id: courseId })

      if (enrollError) throw enrollError

      // 2. Initialize course progress
      const { data: courseProgress, error: progressError } = await supabase
        .from("course_progress")
        .insert({ user_id: userId, course_id: courseId })
        .select()
        .single()

      if (progressError) throw progressError

      // 3. Fetch course and user details for email
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("course_name")
        .eq("id", courseId)
        .single()

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      // Send email notification
      await mailSender(
        user.email,
        `Successfully Enrolled into ${course.course_name}`,
        courseEnrollmentEmail(course.course_name, `${user.first_name} ${user.last_name}`)
      )
    } catch (error) {
      console.log(error)
      return res.status(400).json({ success: false, error: error.message })
    }
  }
}
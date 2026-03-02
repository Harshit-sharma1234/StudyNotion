const supabase = require("../config/supabase")
const mailSender = require("../utils/mailSender")
const bcrypt = require("bcrypt")
const crypto = require("crypto")

exports.resetPasswordToken = async (req, res) => {
  try {
    const email = req.body.email

    // Find user in Supabase
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single()

    if (fetchError || !user) {
      return res.json({
        success: false,
        message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
      })
    }

    const token = crypto.randomBytes(20).toString("hex")

    // Update token and expiry in Supabase
    const { data: updatedDetails, error: updateError } = await supabase
      .from("users")
      .update({
        token: token,
        reset_password_expires: new Date(Date.now() + 3600000).toISOString(),
      })
      .eq("email", email)
      .select()
      .single()

    if (updateError) throw updateError

    const url = `https://studynotion-edtech-project.vercel.app/update-password/${token}`

    await mailSender(
      email,
      "Password Reset",
      `Your Link for email verification is ${url}. Please click this url to reset your password.`
    )

    res.json({
      success: true,
      message: "Email Sent Successfully, Please Check Your Email to Continue Further",
    })
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Sending the Reset Message`,
    })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body

    if (confirmPassword !== password) {
      return res.json({
        success: false,
        message: "Password and Confirm Password Does not Match",
      })
    }

    // Find user by token in Supabase
    const { data: userDetails, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("token", token)
      .single()

    if (fetchError || !userDetails) {
      return res.json({
        success: false,
        message: "Token is Invalid",
      })
    }

    if (!(new Date(userDetails.reset_password_expires) > new Date())) {
      return res.status(403).json({
        success: false,
        message: `Token is Expired, Please Regenerate Your Token`,
      })
    }

    const encryptedPassword = await bcrypt.hash(password, 10)

    // Update password in Supabase
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: encryptedPassword })
      .eq("token", token)

    if (updateError) throw updateError

    res.json({
      success: true,
      message: `Password Reset Successful`,
    })
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Updating the Password`,
    })
  }
}

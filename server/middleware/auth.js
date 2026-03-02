// Importing required modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
// const User = require("../models/User"); // Deprecated after Supabase migration
// Configuring dotenv to load environment variables from .env file
dotenv.config();

const supabase = require("../config/supabase");

// This function is used as middleware to authenticate user requests
const { createClerkClient } = require("@clerk/clerk-sdk-node");
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Utility to map Supabase user record to frontend format
const mapUserToFrontend = (dbUser) => {
	if (!dbUser) return null;
	return {
		id: dbUser.id,
		clerkId: dbUser.clerk_id,
		firstName: dbUser.first_name,
		lastName: dbUser.last_name,
		email: dbUser.email,
		accountType: dbUser.account_type,
		active: dbUser.active,
		approved: dbUser.approved,
		image: dbUser.image,
		additionalDetails: dbUser.profiles ? {
			id: dbUser.profiles.id,
			gender: dbUser.profiles.gender,
			dateOfBirth: dbUser.profiles.date_of_birth,
			about: dbUser.profiles.about,
			contactNumber: dbUser.profiles.contact_number,
		} : null
	};
};


exports.auth = async (req, res, next) => {
	try {
		// Extracting token from request headers
		const token = req.header("Authorization")?.replace("Bearer ", "");

		if (!token) {
			return res.status(401).json({ success: false, message: `Token Missing` });
		}

		try {
			// Verifying the Clerk token
			const decodedData = await clerkClient.verifyToken(token);
			const clerkId = decodedData.sub;

			// Get user details from Clerk
			const clerkUser = await clerkClient.users.getUser(clerkId);
			const email = clerkUser.emailAddresses[0].emailAddress;

			// Check if user exists in Supabase by clerk_id
			let { data: dbUser, error: fetchError } = await supabase
				.from("users")
				.select("*, profiles(*)")
				.eq("clerk_id", clerkId)
				.single();

			if (fetchError && fetchError.code === "PGRST205") {
				throw new Error("Supabase tables missing. Please apply the SQL schema to your Supabase project.");
			}

			if (!dbUser) {
				// If not found by clerk_id, try finding by email
				let { data: existingUser, error: emailError } = await supabase
					.from("users")
					.select("*, profiles(*)")
					.eq("email", email)
					.single();

				if (emailError && emailError.code === "PGRST205") throw new Error("Supabase tables missing.");

				if (existingUser) {
					// Link the account
					const { data: updatedUser, error: linkError } = await supabase
						.from("users")
						.update({ clerk_id: clerkId })
						.eq("id", existingUser.id)
						.select("*, profiles(*)")
						.single();

					if (linkError) throw linkError;
					dbUser = updatedUser;
				} else {
					// Auto-create profile and user in Supabase
					const { data: newProfile, error: profileError } = await supabase
						.from("profiles")
						.insert({})
						.select()
						.single();

					if (profileError) {
						if (profileError.code === "PGRST205") throw new Error("Supabase tables missing.");
						throw profileError;
					}

					const { data: newUser, error: userError } = await supabase
						.from("users")
						.insert({
							first_name: clerkUser.firstName || "",
							last_name: clerkUser.lastName || "",
							email: email,
							clerk_id: clerkId,
							account_type: clerkUser.unsafeMetadata?.accountType || "Student",
							additional_details_id: newProfile.id,
							image: clerkUser.imageUrl,
							active: true,
							approved: true
						})
						.select("*, profiles(*)")
						.single();

					if (userError) throw userError;
					dbUser = newUser;
				}
			}

			if (!dbUser) {
				return res.status(401).json({ success: false, message: "User not found in database and could not be created." });
			}

			// mapping to frontend format
			req.user = mapUserToFrontend(dbUser);

		} catch (error) {
			console.error("Supabase/Clerk Auth Error:", error);
			return res
				.status(401)
				.json({ success: false, message: "Authentication failed", error: error.message });
		}

		next();
	} catch (error) {
		console.error("Auth Middleware Error:", error);
		return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Token`,
		});
	}
};
exports.isStudent = async (req, res, next) => {
	try {
		if (req.user.accountType !== "Student") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Students",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
exports.isAdmin = async (req, res, next) => {
	try {
		if (req.user.accountType !== "Admin") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Admin",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
exports.isInstructor = async (req, res, next) => {
	try {
		if (req.user.accountType !== "Instructor") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Instructor",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};

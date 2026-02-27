// Importing required modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
// Configuring dotenv to load environment variables from .env file
dotenv.config();

// This function is used as middleware to authenticate user requests
const { createClerkClient } = require("@clerk/clerk-sdk-node");
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

exports.auth = async (req, res, next) => {
	try {
		// Extracting JWT from request headers
		const token = req.header("Authorization")?.replace("Bearer ", "");

		// If JWT is missing, return 401 Unauthorized response
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

			// Check if user exists in MongoDB by clerkId
			let dbUser = await User.findOne({ clerkId }).populate("additionalDetails");

			if (!dbUser) {
				// If not found by clerkId, try finding by email (for existing users pre-clerk)
				dbUser = await User.findOne({ email }).populate("additionalDetails");

				if (dbUser) {
					// Link the account
					dbUser.clerkId = clerkId;
					await dbUser.save();
				} else {
					// Auto-create user if not found (Sync on the fly)
					const profileDetails = await Profile.create({
						gender: null,
						dateOfBirth: null,
						about: null,
						contactNumber: null,
					});

					dbUser = await User.create({
						firstName: clerkUser.firstName || "",
						lastName: clerkUser.lastName || "",
						email: email,
						clerkId: clerkId,
						accountType: clerkUser.unsafeMetadata?.accountType || "Student",
						additionalDetails: profileDetails._id,
						image: clerkUser.imageUrl,
						password: "CLERK_MANAGED", // Placeholder for required field
						approved: true,
					});
					dbUser = await dbUser.populate("additionalDetails");
				}
			}

			// Storing the database user document in the request object
			// Controllers expect req.user.id to be MongoDB _id
			req.user = dbUser;
		} catch (error) {
			console.error("Clerk Token Verification Error:", error);
			return res
				.status(401)
				.json({ success: false, message: "token is invalid" });
		}

		// If JWT is valid, move on to the next middleware or request handler
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

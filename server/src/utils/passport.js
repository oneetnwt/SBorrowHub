import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import UserModel from "../models/user.js";
import bcrypt from "bcryptjs";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${
        process.env.BACKEND_URL || "http://localhost:5000"
      }/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log(
          "Google OAuth - Profile received:",
          profile.id,
          profile.emails[0].value
        );

        const email = profile.emails[0].value;

        // Find existing user by email or googleId
        let user = await UserModel.findOne({
          $or: [{ email }, { googleId: profile.id }],
        });

        console.log(
          "Google OAuth - User found:",
          user ? user._id : "No user found"
        );

        if (!user) {
          // User not found - return false to trigger failure redirect
          console.log("Google OAuth - No account found, redirecting to signup");
          return done(null, false, {
            message: "No account found. Please sign up first.",
            redirectToSignup: true,
          });
        }

        // Link Google account if not already linked
        if (!user.googleId) {
          console.log("Google OAuth - Linking Google account to user");
          user.googleId = profile.id;
          user.profilePicture = user.profilePicture || profile.photos[0]?.value;
          await user.save();
        }

        console.log("Google OAuth - Authentication successful");
        done(null, user);
      } catch (err) {
        console.error("Google Strategy Error:", err);
        done(err, null);
      }
    }
  )
);

// Serialize and deserialize user for sessions (optional, not needed with JWT)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;

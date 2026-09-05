const User = require("../models/user.model");
const Address = require("../models/address.model");
const bcrypt = require("bcryptjs");
const jwtProvider = require("../config/jwtProvider");

// const createUser = async (userData) => {
//   try {
//     let { firstName, lastName, email, password } = userData;
//     const isUserExist = await User.findOne({ email });

//     if (isUserExist) {
//       throw new Error("User already exist with email :", email);
//     }
//     password = await bcrypt.hash(password, 8);

//     const user = await User.create({ firstName, lastName, email, password });
//     //console.log("create user", user);
//     return user;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

const createUser = async (userData, addressData) => {
  try {
    let { firstName, lastName, email, password, mobile, role } = userData;
    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      throw new Error("User already exists with email: " + email);
    }
    
    password = await bcrypt.hash(password, 8);

    const user = new User({ firstName, lastName, email, password, mobile, role });

    if (addressData) {
      addressData.user = user._id;
      const address = await Address.create(addressData);
      user.address.push(address._id);
    }

    await user.save();
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};




const findUserById = async (userId) => {
  try {
    const user = await User.findById(userId).populate("address");

    if (!user) {
      throw new Error("User not found with id", userId);
    }
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found with email", email);
    }
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getUserProfileByToken = async (token) => {
  try {
    const userId = jwtProvider.getUserIdFromToken(token);
    const user = await findUserById(userId);

    if (!user) {
      throw new Error("User not found with id", userId);
    }
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    throw new Error(error.message);
  }
};

const VALID_ROLES = ["CUSTOMER", "ADMIN"];

/**
 * Documents created before multi-role support have no roles array, so derive
 * one from the active role and guarantee the active role is always a member.
 */
const normalizeRoles = (user) => {
  const active = String(user?.role || "CUSTOMER").toUpperCase();
  const list = Array.isArray(user?.roles) ? user.roles : [];
  const roles = [...new Set([...list, active].map((r) => String(r).toUpperCase()))]
    .filter((r) => VALID_ROLES.includes(r));
  return roles.length > 0 ? roles : ["CUSTOMER"];
};

const sanitizeUser = (user) => {
  const obj = user?.toObject ? user.toObject() : { ...user };
  delete obj.password;
  obj.roles = normalizeRoles(obj);
  return obj;
};

/**
 * Switches which of the user's roles is active. Refuses roles the user does
 * not hold, so this cannot be used to self-promote to ADMIN.
 */
const switchUserRole = async (userId, requestedRole) => {
  const role = String(requestedRole || "").toUpperCase();
  if (!VALID_ROLES.includes(role)) {
    throw new Error(`Unknown role: ${requestedRole}`);
  }
  const user = await findUserById(userId);
  const roles = normalizeRoles(user);
  if (!roles.includes(role)) {
    throw new Error("You do not have access to that role");
  }
  user.roles = roles;
  user.role = role;
  await user.save();
  return sanitizeUser(user);
};

const updateUserProfile = async (userId, profileData) => {
  try {
    const user = await findUserById(userId);
    const { firstName, lastName, email, mobile, address } = profileData;

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (email && email !== user.email) {
      const taken = await User.findOne({ email: email.trim(), _id: { $ne: userId } });
      if (taken) throw new Error("Email already in use");
      user.email = email.trim();
    }
    if (mobile !== undefined) user.mobile = mobile.trim();

    await user.save();

    if (address) {
      const payload = {
        firstName: address.firstName || user.firstName,
        lastName: address.lastName || user.lastName,
        streetAddress: address.streetAddress,
        city: address.city,
        state: address.state,
        zipCode: Number(address.zipCode),
        mobile: address.mobile || user.mobile,
      };

      const existingId = user.address?.[0];
      if (existingId) {
        await Address.findByIdAndUpdate(existingId, payload, { new: true, runValidators: true });
      } else {
        const created = await Address.create({ ...payload, user: userId });
        user.address.push(created._id);
        await user.save();
      }
    }

    return findUserById(userId);
  } catch (error) {
    throw new Error(error.message);
  }
};

const changeUserPassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new Error("Current password is incorrect");

    if (!newPassword || String(newPassword).length < 6) {
      throw new Error("New password must be at least 6 characters");
    }

    user.password = await bcrypt.hash(newPassword, 8);
    await user.save();
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};


/**
 * Resolve a Google sign-in to a local account.
 *
 * Three cases:
 *  - Known googleId: return that account.
 *  - Same email registered locally: attach the googleId so the shopper keeps
 *    one account and their existing orders, rather than silently getting a
 *    duplicate. Their password still works.
 *  - Otherwise: create a passwordless CUSTOMER account.
 */
const findOrCreateGoogleUser = async ({ googleId, email, firstName, lastName, avatar }) => {
  if (!googleId || !email) {
    throw new Error("Google profile is missing an id or email");
  }

  const byGoogleId = await User.findOne({ googleId });
  if (byGoogleId) {
    // Keep the picture fresh; leave name and roles alone so local edits stick.
    if (avatar && byGoogleId.avatar !== avatar) {
      byGoogleId.avatar = avatar;
      await byGoogleId.save();
    }
    return byGoogleId;
  }

  const byEmail = await User.findOne({ email });
  if (byEmail) {
    byEmail.googleId = googleId;
    if (!byEmail.avatar && avatar) byEmail.avatar = avatar;
    await byEmail.save();
    return byEmail;
  }

  const user = new User({
    firstName: firstName || "Shopper",
    lastName: lastName || "",
    email,
    googleId,
    avatar,
    authProvider: "google",
    role: "CUSTOMER",
    roles: ["CUSTOMER"],
  });
  await user.save();
  return user;
};

module.exports = {
  createUser,
  findOrCreateGoogleUser,
  findUserById,
  getUserByEmail,
  getAllUsers,
  getUserProfileByToken,
  sanitizeUser,
  normalizeRoles,
  switchUserRole,
  updateUserProfile,
  changeUserPassword,
};

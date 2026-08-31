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

const sanitizeUser = (user) => {
  const obj = user?.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
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

module.exports = {
  createUser,
  findUserById,
  getUserByEmail,
  getAllUsers,
  getUserProfileByToken,
  sanitizeUser,
  updateUserProfile,
  changeUserPassword,
};

const userService = require("../services/user.service");

const getUserProfile = async (req, res) => {
  try {
    const jwt = req.headers.authorization?.split(" ")[1];

    if (!jwt) {
      return res.status(404).send({ error: "token not found" });
    }
    const user = await userService.getUserProfileByToken(jwt);
    return res.status(200).send(userService.sanitizeUser(user));
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!req.user || String(req.user._id) !== String(userId)) {
      return res.status(403).send({ message: "You can only update your own profile" });
    }
    const user = await userService.updateUserProfile(userId, req.body);
    return res.status(200).send(userService.sanitizeUser(user));
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!req.user || String(req.user._id) !== String(userId)) {
      return res.status(403).send({ message: "Forbidden" });
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).send({ message: "Current and new password are required" });
    }
    await userService.changeUserPassword(userId, currentPassword, newPassword);
    return res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return res.status(200).send(users);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

/** PUT /api/users/role — switch which of the caller's roles is active. */
const switchRole = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).send({ error: "Not authenticated" });
    }
    const user = await userService.switchUserRole(req.user._id, req.body?.role);
    return res.status(200).send(user);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

module.exports = { getUserProfile, getAllUsers, updateUserProfile, changePassword, switchRole };

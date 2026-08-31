const isAdmin = (req, res, next) => {
    if (!req.user) {
      return res.status(401).send({ error: "User not authenticated" });
    }
  
    if (req.user.role !== 'ADMIN') {
      return res.status(403).send({ error: "User is not an admin" });
    }
  
    next();
  };
  
  module.exports = isAdmin;
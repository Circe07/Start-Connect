const express = require("express");
const Router = express.Router();
const authCtrl = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth");
const { authRateLimit } = require("../middleware/rateLimit");

Router.get("/check", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Rutas de autenticación cargadas"
  });
});

Router.post("/register", authRateLimit, authCtrl.register);
Router.post("/login", authRateLimit, authCtrl.login);
Router.post("/refresh", authRateLimit, authCtrl.refresh);
Router.post("/logout", authMiddleware, authCtrl.logut);
Router.get("/me", authMiddleware, authCtrl.me);
Router.post("/change-password", authMiddleware, authCtrl.changePassword);

module.exports = Router;
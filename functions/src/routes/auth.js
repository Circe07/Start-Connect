const express = require("express");
const Router = express.Router();
const authCtrl = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth");

Router.get("/check", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Rutas de autenticación cargadas"
  });
});

Router.post("/register", authCtrl.register);
Router.post("/login", authCtrl.login);
Router.post("/logout", authMiddleware, authCtrl.logut);
Router.get("/me", authMiddleware, authCtrl.me);


module.exports = Router;
/**
 * Controller Chatting
 * This controller is responsible for managging the status of message of app
 * Author: Unai Villar
 */



/**
 * TODO -> Implement:
 * Manage Messages
 * Chats ID -> CREATION, DELETE, ETC...
 */

const { db, admin } = require("../config/firebase");


/**
 * POST -> Type Message
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.typeMessage = async (req, res) => {
    try {
        const { message } = req.params.body;

        if (!message.trim()) {
            return res
                .status(400)
                .json({ message: "El cuerpo del mensaje es requerido" });
        }

        res.status(201).json({ message: "Mensaje enviado correctamente" });
    } catch (err) {
        console.error("Server error to type message", err);
        res
            .status(500)
            .json({
                message: "Error del servidor al enviar mensaje",
                error: err.message,
            });
    }
};

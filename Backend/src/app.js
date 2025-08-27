import express from "express"
import morgan from "morgan"
import admin from "firebase-admin";
import dotenv from "dotenv";
import db from "./firebase.js"
dotenv.config();

const app = express();

app.use(morgan('dev'))

app.get("/", async (req, res) => {
  try {
    const result = await db.collection("users").get();
    console.log(result.docs.map(doc => doc.data()));
    res.send("hello");
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Error fetching users");
  }
});




export default app
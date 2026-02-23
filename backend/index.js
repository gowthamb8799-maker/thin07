import express from "express";
import cors from "cors";
import AWS from "aws-sdk";
import { v4 as uuid } from "uuid";

// ----------------------------------
// AWS CONFIG (EC2 IAM ROLE)
// ----------------------------------
AWS.config.update({
  region: process.env.AWS_REGION || "us-east-1"
});

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE = process.env.TABLE_NAME || "Contacts";

// ----------------------------------
// APP SETUP
// ----------------------------------
const app = express();
app.use(express.json());
app.use(cors());

// ----------------------------------
// HEALTH CHECK (ELB / ALB friendly)
// ----------------------------------
app.get("/health", (_, res) => res.status(200).send("OK"));

// ----------------------------------
// API ROUTER
// ----------------------------------
const router = express.Router();

// GET ALL CONTACTS
router.get("/contacts", async (_, res) => {
  try {
    const data = await dynamo.scan({ TableName: TABLE }).promise();
    res.json(data.Items || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE CONTACT
router.post("/contacts", async (req, res) => {
  try {
    const item = {
      id: uuid(),
      ...req.body
    };

    await dynamo.put({
      TableName: TABLE,
      Item: item
    }).promise();

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE CONTACT
router.put("/contacts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const keys = Object.keys(body);
    if (!keys.length) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const UpdateExpression =
      "SET " + keys.map(k => `#${k} = :${k}`).join(", ");

    const ExpressionAttributeNames =
      Object.fromEntries(keys.map(k => [`#${k}`, k]));

    const ExpressionAttributeValues =
      Object.fromEntries(keys.map(k => [`:${k}`, body[k]]));

    await dynamo.update({
      TableName: TABLE,
      Key: { id },
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues
    }).promise();

    res.json({ id, ...body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE CONTACT
router.delete("/contacts/:id", async (req, res) => {
  try {
    await dynamo.delete({
      TableName: TABLE,
      Key: { id: req.params.id }
    }).promise();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------
// MOUNT API PREFIX
// ----------------------------------
app.use("/api", router);

// ----------------------------------
// START SERVER
// ----------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 API running on port ${PORT}`)
);
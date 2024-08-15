// testAggregation.js
const mongoose = require("mongoose");
const Message = require("./schema");
const User = require("../Users/schema");

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://rehmanwaqas466:g4D6xo1NomiKiCr9@cluster0.bpffhyq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);

const receiverId = "66a5f819e54e9f4d8d785439";

(async () => {
  try {
    const senderDetails = await Message.aggregate([
      {
        $match: {
          $or: [
            { receiverId: new mongoose.Types.ObjectId(receiverId) },
            { senderId: new mongoose.Types.ObjectId(receiverId) },
          ],
        },
      },
      { $sort: { timestamp: 1 } }, // Sort by timestamp in descending order
      {
        $group: {
          _id: {
            senderId: {
              $cond: {
                if: {
                  $eq: ["$senderId", new mongoose.Types.ObjectId(receiverId)],
                },
                then: "$receiverId",
                else: "$senderId",
              },
            },
            receiverId: {
              $cond: {
                if: {
                  $eq: ["$senderId", new mongoose.Types.ObjectId(receiverId)],
                },
                then: "$senderId",
                else: "$receiverId",
              },
            },
          },
          lastMessage: { $last: "$message" },
          lastTimestamp: { $last: "$timestamp" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.senderId",
          foreignField: "_id",
          as: "senderDetails",
        },
      },
      { $unwind: "$senderDetails" },
      {
        $project: {
          _id: 0,
          senderId: "$_id.senderId",
          receiverId: "$_id.receiverId",
          lastMessage: 1,
          lastTimestamp: 1,
          "senderDetails.name": 1,
          "senderDetails.profilePic": 1,
        },
      },
    ]);

    console.log(senderDetails);
  } catch (error) {
    console.error("Error fetching sender details:", error);
  } finally {
    mongoose.connection.close();
  }
})();

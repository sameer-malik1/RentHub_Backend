// controllers/messageController.js
const mongoose = require('mongoose');
const Message = require('./schema');
const User = require('../Users/schema');

const getSenderDetails = async (req, res) => {
  try {
    const { receiverId } = req.params;

    // Aggregate to find the details of unique senders and their last message
    const senderDetails = await Message.aggregate([
      { $match: { receiverId: mongoose.Types.ObjectId(receiverId) } },
      { $sort: { timestamp: -1 } },
      { 
        $group: {
          _id: '$senderId',
          lastMessage: { $first: '$message' },
          lastTimestamp: { $first: '$timestamp' }
        }
      },
      { 
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'senderDetails'
        }
      },
      { $unwind: '$senderDetails' },
      { 
        $project: {
          _id: 1,
          lastMessage: 1,
          lastTimestamp: 1,
          'senderDetails.name': 1,
          'senderDetails.profilePic': 1
        }
      }
    ]);

    res.status(200).json(senderDetails);
  } catch (error) {
    console.error('Error fetching sender details:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
};

module.exports = { getSenderDetails };

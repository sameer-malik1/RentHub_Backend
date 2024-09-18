const Booking = require("./schema");
const bookingSchema = require("./schema");
const userschema = require("../Users/schema");

// Create booking
const createBooking = async (req, res) => {
  console.log("api hit");
  const { product, startDate, endDate } = req?.body;
  const user = req?.user?.id;
  // try {
  // console.log("api hit in try block");
  // let checkStatus = await bookingSchema.findOne({ product });

  // if (checkStatus) {
  //   return res.status(400).json({ message: "This Product is already booked" });
  // }
  // console.log("check status: ", checkStatus);

  const newBooking = await Booking.create({
    user,
    product,
    startDate,
    endDate,
    status: "booked",
  });

  console.log("booking object creation: ", newBooking);

  // console.log("booking creation in Db: ", booking);kc

  //emit events
  req.io.emit("bookingCreated", newBooking);

  return res.status(201).json({
    message: "Booking created successfully",
    newBooking,
  });
  // } catch (error) {
  //   return res.status(500).json({ message: error.message });
  // }
};

// Get all bookings
const allBookings = async (req, res) => {
  try {
    const bookings = await bookingSchema.find().populate("product");
    return res.status(200).json(bookings);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { endDate } = req.body;
    const userId = req.user.id;

    const filter = { id };
    const update = { endDate };

    const booking = await bookingSchema.findOneAndUpdate(filter, update, {
      new: true,
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    return res
      .status(200)
      .json({ message: "Booking Updated Successfully", userId, booking });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Delete booking
const deleteBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const booking = await bookingSchema.findOneAndDelete(req.params._id);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    return res
      .status(200)
      .json({ message: "Booking deleted successfully", userId, booking });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// myBooking
const myBooking = async (req, res) => {
  const bookedBy = req.user.id;
  try {
    const user = await userschema.findById(bookedBy).select("-password");
    if (!user) {
      return res.status(400).json({ message: "UnAuthorized User" });
    }

    const allBookings = await bookingSchema.find({ user: bookedBy }).populate('product').exec();

    return res.status(200).json({ message: "Your Post", allBookings, user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  allBookings,
  updateBookingStatus,
  deleteBooking,
  myBooking,
};

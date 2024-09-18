const productSchema = require("./schema");
const userschema = require("../Users/schema");
const Booking = require("../reservationSystem/schema");

const addProduct = async (req, res) => {
  const { name, price, category, description, location, type, images } =
    req.body;
  const createdBy = req.user.id;

  try {
    if (
      name &&
      price &&
      category &&
      description &&
      location &&
      type &&
      images
    ) {
      const user = await userschema.findById(createdBy).select("-password");
      if (!user) {
        return res.status(400).json({ message: "UnAuthorized User" });
      } else {
        const createProduct = await productSchema.create({
          createdBy: user,
          name,
          price,
          category,
          description,
          location,
          type,
          images,
        });

        // emit event using socket.io
        req.io.emit("productUpdated", createProduct);

        return res.status(201).json({
          message: "Product created Successfully",
          createProduct,
        });
      }
    } else {
      return res.status(422).json({ message: "Required Field Missing" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const yourPost = async (req, res) => {
  const createdBy = req.user.id;
  try {
    const user = await userschema.findById(createdBy).select("-password");
    if (!user) {
      return res.status(400).json({ message: "UnAuthorized User" });
    }

    const items = await productSchema.find({ createdBy });
    const itemsWithClientDetails = await Promise.all(
      items.map(async (item) => {
        const bookings = await Booking.find({ product: item._id }).populate(
          "user",
          "name email contactNo"
        ); // Assuming 'User' model has 'name' and 'email' fields
        const clientsWithBookingDetails = bookings.map((booking) => ({
          client: booking.user, // Client details
          startDate: booking.startDate, // Booking start date
          endDate: booking.endDate, // Booking end date
        }));

        return {
          ...item._doc, // Spread the item fields
          bookings: clientsWithBookingDetails, // List of clients with booking dates
        };
      })
    );

    res.json(itemsWithClientDetails);

    // return res.status(200).json({ message: "Your Post", items, user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { _id, name, price, description, category, images } = req.body;
  const createdBy = req.user.id;
  try {
    const filter = { _id };
    const update = { name, price, description, category, images };
    const updatedProduct = await productSchema.findOneAndUpdate(
      filter,
      update,
      { new: true }
    );
    if (updatedProduct) {
      return res.status(201).json({
        message: "Product Updated Successfully",
        createdBy,
        updatedProduct,
      });
    } else {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.query;
  const userId = req.user.id;

  if (!id) {
    res.status(404).json({ message: "ProductID is required" });
  } else {
    try {
      const product = await productSchema.findByIdAndDelete(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const allProducts = await productSchema.find();
      return res.status(201).json({
        message: "Product Deleted Successfully",
        Products: allProducts,
        CreatedBy: userId,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

const allProducts = async (req, res) => {
  try {
    const products = await productSchema.find().populate("createdBy").exec();
    res.status(200).json({ Products: products });
    if (!products) {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const searchProduct = async (req, res) => {
  const { name, category, location } = req.query;

  try {
    let filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    } else if (category) {
      filter.category = { $regex: category, $options: "i" };
    } else if (location) {
      filter.location = { $regex: location, $options: "i" };
    } else {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the filter is empty
    if (Object.keys(filter).length === 0) {
      return res.status(400).json({ message: "No search parameters provided" });
    }

    const findProduct = await productSchema.find(filter);

    if (findProduct.length >= 0) {
      return res.status(200).json({ Products: findProduct });
    } else {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  allProducts,
  searchProduct,
  yourPost,
};

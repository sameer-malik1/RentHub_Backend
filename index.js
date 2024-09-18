const express = require("express");
require("dotenv").config();
const connectDB = require("./model/database");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerJsDocs = YAML.load("./Swagger/api.yaml");
// const app = express();
const port = process.env.SERVER_PORT || 3000;
const admin_Route = require("./AdminPanel/router")
const user_Route = require("./Users/router");
const product_Route = require("./products/router");
const message_Route = require("./message/router");
const booking_Route = require("./reservationSystem/router");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// socket io configs
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// initialize express
const app = express();

// create http server
const server = http.createServer(app);

// initialize socket.io
const io = socketIo(server);

// middleware to add socket io instance to req
app.use((req,res,next)=>{
  req.io = io;
  next();
})

//Middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());;

// connect Db
connectDB();

//Routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJsDocs));
app.use("/api", user_Route);
app.use("/api", admin_Route);
app.use("/api", product_Route);
app.use("/api", message_Route);
app.use("/api", booking_Route);


// listen for socket io connections
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
      console.log('A user disconnected');
  });
});

// start the server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


//Server
// app.listen(port, () => {
//   connectDB()
//     .then(() => {
//       console.log(`App listening on port ${port}`);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

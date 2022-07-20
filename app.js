var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const options = require("./knexfile.js");
const { request } = require("http");
const knex = require("knex")(options);

const swaggerUI = require("swagger-ui-express");
const swaggerDocument = require("./docs/swagger.json");

//Rounter
const app = express();
var userRouter = require("./routes/user");
const factorsRouter = require("./routes/factors");
const rankingsRouter = require("./routes/rankings");
const countriesRouter = require("./routes/countries");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(logger("common"));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

logger.token("req", (req, res) => JSON.stringify(req.headers));
logger.token("res", (req, res) => {
  const headers = {};
  res.getHeaderNames().map((h) => (headers[h] = res.getHeader(h)));
  return JSON.stringify(headers);
});
app.use((req, res, next) => {
  req.db = knex;
  next();
});
app.use("/rankings", rankingsRouter);
app.use("/countries", countriesRouter);
app.use("/factors", factorsRouter);
//app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/", swaggerUI.serve);
app.get("/", swaggerUI.setup(swaggerDocument));
//create 404 for invalid route

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
app.use(function (req, res, next) {
  res.status(404).json({
    error: true,
    message: "Not Found",
  });
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

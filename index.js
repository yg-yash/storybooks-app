const express = require("express");
const path = require("path");
const passport = require("passport");
const cookieparser = require("cookie-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
mongoose.Promise = global.Promise;
require("./db/mongoose");
const app = express();
require("./models/user");
require("./models/Story");

//passport config
require("./config/passport")(passport);

//load routes
const auth = require("./routes/auth");
const index = require("./routes/index");
const stories = require("./routes/stories");

//bodyparser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//method-override middleware
app.use(methodOverride("_method"));

//hanldebars helpers
const {
  truncate,
  stripTags,
  formatDate,
  select,
  editIcon
} = require("./helpers/hbs");

//handlebars middleware
app.engine(
  "handlebars",
  exphbs({
    helpers: { truncate, stripTags, formatDate, select, editIcon },
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

//session and cookie parser
app.use(cookieparser());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//set global vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//set static content
app.use(express.static(path.join(__dirname, "public")));
//user route
app.use("/auth", auth);
app.use("/", index);
app.use("/stories", stories);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`server is up on ${PORT}`));

var express      =require("express");
	app          =express();
	bodyParser   =require("body-parser");
	mongoose     =require("mongoose");
	passport     =require("passport");
	LocalStrategy=require("passport-local");  
	methodOverride = require("method-override");
	flash        = require("connect-flash");  
	app.locals.moment = require("moment");
	Campground   =require("./models/campground");
	seedDB       =require("./seeds.js");
	Comment      =require("./models/comment");
	User         =require("./models/user");

//requiring routes
var commentRoutes     = require("./routes/comments");
	campgroundRoutes  = require("./routes/campgrounds");
	indexRoutes       = require("./routes/index");

// seedDB();  //seeding the db
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost:27017/your_camp",{useNewUrlParser: true});
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash());
app.set("view engine","ejs");

//PASSPORT CONFIG
app.use(require("express-session")({
	secret:"Football is my favourite sport",
	resave:false,
	saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use(commentRoutes);
app.use(campgroundRoutes);
app.use(indexRoutes);


app.listen(process.env.PORT || 3000,function(){
	console.log("yourcamp server has started");
});
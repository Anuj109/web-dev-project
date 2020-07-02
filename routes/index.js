var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");

//root route
router.get("/",function(req,res){
	res.render("landing");
})


//AUTH ROUTES
//show register form
router.get("/register",function(req,res){
	res.render("register", {page: "register"});
});

//handle sign up logic
router.post("/register",function(req,res){
	var newUser = new User({
		username:req.body.username,
		avatar:req.body.avatar,
		firstName:req.body.firstName,
		lastName:req.body.lastName,
		email:req.body.email,		
	});
	User.register(newUser, req.body.password, function(err,user){
		if(err){
			req.flash("error", err.message);
			return res.redirect("/register");
		}
		passport.authenticate("local")(req,res,function(){
			req.flash("success", "Welcome to YourCamp " + user.username);
			res.redirect("/campgrounds");
		});
	})
});

//showing login form
router.get("/login",function(req,res){
	res.render("login", {page: "login"});
});

//login logic
router.post("/login",function(req,res,next){
	passport.authenticate("local",
	 	{
	 		successRedirect:"/campgrounds",
	 		failureRedirect:"/login",
	 		failureFlash: true,
	 		successFlash: "Welcome to YourCamp " + req.body.username
		})(req,res);
});

//logout route logic
router.get("/logout",function(req,res){
	req.logout();
	req.flash("success", "Successfully Logged out");
	res.redirect("/");
});

//USER profile
//show route
router.get("/users/:id", function(req,res){
	User.findById(req.params.id, function(err, foundUser){
		if(err){
			req.flash("error", "Something went wrong");
			res.redirect("back");
		}
		else{
			Campground.find().where("author.id").equals(foundUser._id).exec(function(err,campgrounds){
				if(err){
					req.flash("error", "Something went wrong");
					res.redirect("back");
				}
				else{
					res.render("users/show",{user:foundUser, campgrounds:campgrounds});		
				}
			});
			
		}
	});
})

//edit route
router.get("/users/:id/edit",function(req,res){
	User.findById(req.params.id, function(err,foundUser){
		if(err){
			req.flash("err", "User not found");
			res.redirect("back");
		}
		else{
			res.render("users/edit",{user:foundUser});		
		}
	})
	
})

//update route
router.put("/users/:id", function(req,res){
	User.findByIdAndUpdate(req.params.id,req.body.user, function(err, updatedUser){
		if(err){
			req.flash("error", "User not found");
			res.redirect("back");
		}
		else{
			Campground.updateMany({"author.id": req.params.id},{$set: {"author.username": updatedUser.username}},function(err){
				if(err){
					req.flash("error",err);
					res.redirect("back");
				}
				else{
					req.flash("success","User profile updated");
					console.log(updatedUser)
					res.redirect("/users/" + req.params.id);
				}
			})
			
		}
	})
})

module.exports = router;
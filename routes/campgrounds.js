var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

router.get("/campgrounds",function(req,res){
	Campground.find({},function(err,allCampgrounds){
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/index",{campgrounds:allCampgrounds, page: "campgrounds"});
		}
	});

	
});

router.post("/campgrounds",middleware.isLoggedIn,function(req,res){
	var name=req.body.name;
	var image=req.body.image;
	var descp=req.body.description;
	var price = req.body.price;
	var author={
		id: req.user._id,
		username: req.user.username
	};
	var newcampground={name:name, price:price, image:image, description:descp, author:author};
	Campground.create(newcampground,function(err,newcampground){
		if(err){
			req.flash("error",err.message);
		}
		else{
			res.redirect("/campgrounds");		
		}
	});
	
});

router.get("/campgrounds/new",middleware.isLoggedIn,function(req,res){
	res.render("campgrounds/new");
});

//SHOW - shows more info about selected campground
router.get("/campgrounds/:id",function(req,res){
	//find campground with given id
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
		if(err || !foundCampground){
			req.flash("error", "Campground not found");
			res.redirect("back");
		}
		else{
			//render the campground template with given id
			res.render("campgrounds/show",{campground:foundCampground});		
		}
	})
	
});

//EDIT campground
router.get("/campgrounds/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
	Campground.findById(req.params.id,function(err,foundCampground){
		res.render("campgrounds/edit",{campground: foundCampground});
	});
});

//UPDATE campground
router.put("/campgrounds/:id",middleware.checkCampgroundOwnership,function(req,res){
	//find and update correct campground
	Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		}
		else{
			//redirect to show page
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
	
})

//DESTROY campground
router.delete("/campgrounds/:id",middleware.checkCampgroundOwnership, function(req,res){
	Campground.findByIdAndRemove(req.params.id, function(err, removedCampground){
		if(err){
			res.redirect("/campgrounds");
		}
		Comment.deleteMany({_id: { $in: removedCampground.comments}},function(err){
			if(err){
				res.redirect("/campgrounds");
			}
			else{
				req.flash("success", "Campground removed");
				res.redirect("/campgrounds");
			}

		});
	});
});

module.exports = router;	
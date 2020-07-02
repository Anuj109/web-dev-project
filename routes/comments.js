var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//showing new comment form
router.get("/campgrounds/:id/comments/new", middleware.isLoggedIn, function(req,res){
	Campground.findById(req.params.id,function(err,campground){
		if(err){
			console.log(err);
		}
		else{
			res.render("comments/new",{campground:campground});		
		}
	})
	
})

//comment addition logic
router.post("/campgrounds/:id/comments", middleware.isLoggedIn, function(req,res){
	//look for campground ID
	Campground.findById(req.params.id,function(err,campground){
		if(err){
			req.flash("error", "Something went wrong");
			console.log(err);
			res.redirect("/campgrounds");
		}
		else{
			//create new comment
			Comment.create(req.body.comment,function(err,comment){
				if(err){
					console.log(err);
				}
				else{
					//add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					//push commment in the capground and save
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("success", "Successfully added comment");
					//redirect to campground show page
					res.redirect("/campgrounds/"+req.params.id);
				}
			})
		}
	})	
});

//EDIT comment
router.get("/campgrounds/:id/comments/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
	Campground.findById(req.params.id,function(err,foundCampground){
		if(err || !foundCampground){
			req.flash("error", "No campground found");
			return res.redirect("back");
		}
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err){
				res.redirect("back");
			}
			else{
				res.render("comments/edit",{campground_id:req.params.id, comment:foundComment});
			}
		});
	});
	
});

//UPDATE comment
router.put("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership, function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment,function(err, updatedComment){
		if(err){
			res.redirect("back");
		}
		else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

//DESTROY comment
router.delete("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership,function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id,function(err){
		if(err){
			res.redirect("back");
		}
		else{
			req.flash("success", "Comment deleted");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

module.exports = router;
const express = require("express");
const router = express.Router();
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");
const mongoose = require("mongoose");

const Story = mongoose.model("stories");
//stories index
router.get("/", (req, res) => {
  Story.find({ status: "public" })
    .populate("user")
    .sort({ date: "desc" })
    .then(stories => {
      res.render("stories/index", {
        stories
      });
    });
});

//show single story
router.get("/show/:id", (req, res) => {
  Story.findOne({ _id: req.params.id })
    .populate("user")
    .populate("comments.commentUser")
    .then(story => {
      if (story.status == "public") {
        res.render("stories/show", {
          story
        });
      } else {
        if (req.user) {
          if (req.user.id == story.user._id) {
            res.render("stories/show", {
              story
            });
          } else {
            res.redirect("/stories");
          }
        } else {
          res.redirect("/stories");
        }
      }
    });
});

//list stories from a user
router.get("/user/:userId", (req, res) => {
  Story.find({ user: req.params.userId, status: "public" })
    .populate("user")
    .then(stories => {
      res.render("stories/index", {
        stories
      });
    });
});

//logged in user stories
router.get("/my", ensureAuthenticated, (req, res) => {
  Story.find({ user: req.user.id })
    .populate("user")
    .then(stories => {
      res.render("stories/index", {
        stories
      });
    });
});

//add story form
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("stories/add");
});

//edit story form
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Story.findOne({ _id: req.params.id }).then(story => {
    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      res.render("stories/edit", {
        story
      });
    }
  });
});

//prcoess add story
router.post("/", (req, res) => {
  let allowComments;

  req.body.allowComments ? (allowComments = true) : (allowComments = false);
  const newStory = {
    title: req.body.title,
    status: req.body.status,
    allowComments,
    body: req.body.body,
    user: req.user._id
  };

  //create story
  new Story(newStory)
    .save()
    .then(story => {
      res.redirect(`/stories/show/${story._id}`);
    })
    .catch(e => {
      console.log(e);
    });
});

//edit form process
router.put("/:id", (req, res) => {
  Story.findOne({ _id: req.params.id }).then(story => {
    let allowComments;

    req.body.allowComments ? (allowComments = true) : (allowComments = false);
    //set new values
    (story.title = req.body.title),
      (story.status = req.body.status),
      (story.allowComments = allowComments),
      (story.body = req.body.body);
    story.save().then(story => {
      res.redirect("/dashboard");
    });
  });
});

//delete story
router.delete("/:id", (req, res) => {
  Story.deleteOne({ _id: req.params.id }).then(() => {
    res.redirect("/dashboard");
  });
});

//add comments
router.post("/comment/:id", (req, res) => {
  Story.findOne({ _id: req.params.id }).then(story => {
    const newComment = {
      commentBody: req.body.commentBody,
      commentUser: req.user.id
    };
    //push to comments arrat
    story.comments.unshift(newComment);
    story.save().then(story => {
      res.redirect(`/stories/show/${story.id}`);
    });
  });
});

module.exports = router;

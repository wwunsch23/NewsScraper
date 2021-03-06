// Require all models
var db = require("../models");

module.exports = function(app) {
  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("notes")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle.notes);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated Article -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate(
          { _id: req.params.id },
          { $push: { notes: dbNote._id } },
          { new: true }
        ).populate("notes");
      })
      .then(function(dbArticle) {
        console.log("Updated article", dbArticle.notes);
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle.notes);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  app.delete("/notes/:id", function(req, res) {
    db.Note.findByIdAndRemove(req.params.id)
      .then(function(dbNote) {
        //console.log("apiRoute", dbNote);
        return db.Article.findOneAndUpdate(
          { notes: dbNote._id },
          { $pull: { notes: dbNote._id } },
          { new: true }
        ).populate("notes");
      })
      .then(function(dbArticle) {
        //console.log("Delete Article", dbArticle);
        res.json(dbArticle.notes);
      })
      .catch(function(err) {
        console.log(err);
        res.json(err);
      });
  });
};

// Require all models
var db = require("../models");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function(app) {
  // Route for getting all Articles from the db
  app.get("/", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        //console.log(dbArticle);
        // If we were able to successfully find Articles, send them back to the client
        res.render("index", { articles: dbArticle });
        //res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  // A GET route for scraping the echoJS website
  app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.npr.org/sections/news/").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);

      // Now, we grab every h2 within an article tag, and do the following:
      $("article").each(function(i, element) {
        // Save an empty result object
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .find("h2.title a")
          .text();
        result.url = $(this)
          .find("h2.title a")
          .attr("href");
        result.date = $(this)
          .find(".date")
          .text();
        result.summary = $(this)
          .find(".teaser a")
          .text();

        console.log(result);
        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          });
      });

      // Send a message to the client
      res.send("Scrape Complete");
    });
  });
};

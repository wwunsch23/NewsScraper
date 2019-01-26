$(document).ready(function() {
  //Whenever someone clicks the scrape button
  $("#scrape").on("click", function() {
    console.log("Clicked on scrape");
    // Empty the notes from the note section
    // Now make an ajax call for the Article
    $.get("/scrape")
      // With that done, add the note information to the page
      .then(function(data) {
        //console.log(data);
        console.log("Scraped NPR");
        location.reload();
      });
  });

  function displayNotes(notes) {
    var listgroup = $("<ul>").addClass("list-group mb-3");
    notes.forEach(note => {
      var listItem = $("<li>")
        .addClass(
          "list-group-item list-group-item-action d-flex justify-content-between shadow-sm"
        )
        .text(note.body)
        .append(
          "<button type='button' class='btn btn-outline-danger deletenote pt-0 pb-0' data-id=" +
            note._id +
            ">&times</button>"
        );
      listgroup.append(listItem);
    });
    $("#notes").append(listgroup);
  }

  $("#notesModal").on("show.bs.modal", function(event) {
    //console.log("Show modal event reached");
    var button = $(event.relatedTarget);
    //console.log(button); // Button that triggered the modal
    var thisId = button.data("id");
    var title = button
      .parent()
      .find("a.text-info")
      .text();
    // Empty the notes from the note section
    var modal = $(this);
    modal.find(".modal-title").text("Notes for: " + title);
    $("#savenote").attr("data-id", thisId);
    $("#notes").empty();
    $("#note-text").val("");
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the note information to the page
      .then(function(data) {
        if (data.length > 0) {
          console.log(data);
          displayNotes(data);
        }
      });
  });

  $("#notesModal").on("hidden.bs.modal", function(event) {
    location.reload();
  });

  // When you click the savenote button
  $(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    var notetext = $("#note-text").val();

    if (notetext) {
      console.log("Saving note");
      // Run a POST request to change the note, using what's entered in the inputs
      $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
          // Value taken from note textarea
          body: $("#note-text").val()
        }
      })
        // With that done
        .then(function(data) {
          // Empty the notes section
          $("#notes").empty();
          $("#note-text").val("");
          displayNotes(data);
        });
    }
  });

  $(document).on("click", ".deletenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    console.log(thisId);
    $.ajax({
      method: "DELETE",
      url: "/notes/" + thisId
    }).then(function(data) {
      $("#notes").empty();
      displayNotes(data);
    });
  });
});

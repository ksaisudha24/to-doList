//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sudha:Test123@cluster0.dl1n2.mongodb.net/todolistDB?retryWrites=true/todolistDB", {useUnifiedTopology: true});

const itemSchema = new mongoose.Schema ({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Buy Food"
});

const item2 = new Item ({
  name: "Make Food"
});

const item3 = new Item({
  name: "Eat Food"
});


const listSchema = new mongoose.Schema ({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (err) {
      console.log(err);
    }
    else {
      if (foundItems.length === 0) {
        Item.insertMany([item1, item2, item3], function(err) {
          if (err) {
            console.log(err);
          }
          else {
            console.log("Updated Successfully");
          }
        });

        res.redirect("/");
      }
      else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    }
  });
});


app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList) {
    if (err) {
      console.log(err);
    }
    else {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: [item1, item2, item3]
        });
        list.save()
        res.redirect("/" + customListName);
      }
      else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });


});


app.post("/", function(req, res){

  const it = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: it
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }

  else {
    List.findOne({name: listName}, function(err, foundList) {
      if (err)
        console.log(err);
      else {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }
});

let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }

app.listen(port);

// app.listen(3000, function() {
//   console.log("Server started on port 3000");
// });

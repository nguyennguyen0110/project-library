/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
//Import Mongoose and connect to MongoDB with URI store in secret
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

//Create book Schema and Model
const bookSchema = new mongoose.Schema({
  title: String,
  commentcount: Number,
  comments: [String]
});
const Book = new mongoose.model('Book', bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      Book.find({}).select('-comments').exec((err, books) => {
        if (err) return console.log(err);
        res.json(books);
      });
    })
    
    .post(function (req, res){
      if (!req.body.title) {
        res.json('missing required field title');
      }
      else {
        Book.findOne({title: req.body.title}, (err, book) => {
          if (err) return console.log(err);
          if (book == null) {
            let newBook = new Book({title: req.body.title, commentcount: 0});
            newBook.save((err, book) => {
              if (err) return console.log(err);
              res.json({title: book.title, _id: book._id});
            });
          }
          else {
            res.json({'Error': 'This book is already in the library'});
          }
        });
      }
    })
    
    .delete(function(req, res){
      Book.deleteMany({}, err => {
        if (err) return console.log(err);
        res.json('complete delete successful');
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      Book.findById(req.params.id, '-commentcount', (err, book) => {
        if (err) return console.log(err);
        if (book == null) {
          res.json('no book exists');
        }
        else {
          res.json(book);
        }
      });
    })
    
    .post(function(req, res){
      if (!req.body.comment) {
        res.json('missing required field comment');
      }
      else {
        Book.findByIdAndUpdate(
          req.params.id,
          {$push: {comments: req.body.comment}, $inc: {commentcount: 1}},
          {select: '-commentcount', new: true},
          (err, book) => {
            if (err) return console.log(err);
            if (book == null) {
              res.json('no book exists');
            }
            else {
              res.json(book);
            }
          }
        );
      }
    })
    
    .delete(function(req, res){
      Book.findByIdAndRemove(req.params.id, (err, book) => {
        if (err) return console.log(err);
        if (book == null) {
          res.json('no book exists');
        }
        else {
          res.json('delete successful');
        }
      })
    });
  
};

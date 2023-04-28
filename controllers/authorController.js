const Author = require("../models/author");
const Book = require("../models/book");
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// Display list of all Authors.
exports.author_list = asyncHandler(async (req, res, next) => {
  const allAuthors = await Author.find().sort({ family_name: 1 }).exec();
  
  res.render("author_list", {
    title: 'Author List',
    author_list: allAuthors,
  });
});

// Display detail page for a specific Author.
exports.author_detail = asyncHandler(async (req, res, next) => {
  const [author, authorsBooks] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }).populate('title summary').exec(),
  ]);

  if (author === null){
    // No result
    const err = new Error('Author not found');
    err.status = 404;
    return next(err);
  }

  res.render('author_detail', {
    title: "Author Detail",
    author: author,
    author_books: authorsBooks,
  });
});

// Display Author create form on GET.
exports.author_create_get = (req, res, next) => {
  res.render('author_form', { title: 'Create Author' });
};

// Handle Author create on POST.
exports.author_create_post = [
  // Validate and sanitize fields.
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified."),
  body("last_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Last name must be specified."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Author object with escaped and trimmed data
    const author = new Author({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("author_form", {
        title: "Create Author",
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Save author.
      await author.save();
      // Redirect to new author record.
      res.redirect(author.url);
    }
  }),
];


// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of author and all their books (in parallel)
  const [author, authorBooks] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.idd }, 'title summary').exec(),
  ]);

  if (author === null) {
    // No results
    res.redirect('/catalog/authors');
  }

  res.render('author_delete', {
    title: 'Delete Author',
    author: author,
    author_books: authorBooks,
  });
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of author and all their books (in parallel)
  const [author, authorBooks] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, 'title summary').exec(),
  ]);

  if (authorBooks.length > 0) {
    // Author has books. Render in same way as for GET route
    res.render('author_delete', {
      title: 'Delete Author',
      author: author,
      author_books: authorBooks,
    });
    return;
  } else {
    // Author has no books. Delete object and redirect to the list of Authors
    await Author.findByIdAndRemove(req.body.authorid);
    res.redirect('/catalog/authors');
  }
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  const [author, authorBooks] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }).exec(),
  ]);

  if (author === null) {
    // Author does not exist
    const err = new Error('Author not found');
    err.status = 404;
    return next(err);
  }

  res.render('author_form', {
    title: 'Update Author',
    author: author,
    author_books: authorBooks
  });
});

// Handle Author update on POST.
exports.author_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author update POST");
});

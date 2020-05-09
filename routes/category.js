const express = require("express");
require("express-async-errors");

const Categories = require("../models/category");

const router = express.Router();

router.get("/cat/:id", async (req, res, next) => {
  const { limit, skip, critiria, dir } = req.query;

  const { id } = req.params;

  const products = await Categories.find({
    _id: id
  })
    .populate({
      path: "products",
      options: {
        sort: critiria
      }
    })
    .limit(+limit)
    .skip(+skip)
    .exec();
  products.to;
  res.status(200).json(products);
});

router.get("/", async (req, res, next) => {
  const category = await Categories.find();
  res.status(200).json(category);
});

router.post("/add", async (req, res, next) => {
  try {
    const { name } = req.body;
    const category = new Categories({
      name
    });
    await category.save();
    res.status(200).json(`done`);
  } catch (err) {
    err.statusCode = 422;
    next(err);
  }
});
module.exports = router;

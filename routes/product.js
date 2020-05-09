const express = require('express');
const fileUpload = require('express-fileupload');
const cloudinary = require("cloudinary").v2;

require('express-async-errors');

const Products = require('../models/product');
const authnticationMiddleware = require('../middlewares/authentication');
const authorizationMiddleWare = require('../middlewares/authorization');

const parser = require("../middlewares/cloudinary");

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

router.get('/', async (req, res, next) => {

    const {
        limit,
        skip,
        sortBy,
        sdir
    } = req.query;

    var sortObject = {};
    sortObject[sortBy] = sdir;


    const product = limit & sortBy ? await Products.find().limit(+limit).skip(+skip).sort(sortObject) :
        sortBy ? await Products.find().sort(sortObject) :
        limit ? await Products.find().limit(+limit).skip(+skip) :
        await Products.find();

    const numberOfProducts = await Products.count();
    res.status(200).json({
        product: product,
        numberOfProducts: numberOfProducts
    });
})


router.delete('/:id', authnticationMiddleware, authorizationMiddleWare, async (req, res, next) => {
    const product = await Products.findById(req.params.id);
    await Products.deleteOne(product);
    res.status(200).json("done");
})


router.patch('/:id', authnticationMiddleware, authorizationMiddleWare, async (req, res, next) => {

    const {
        id
    } = req.params;
    const product = await Products.findById(id);
    await product.update(req.body, {
        new: true,
        runValidators: true,
        omitUndefined: true
    })
    res.status(200).json(`${product}done`);
})


router.post('/add', authnticationMiddleware,  async (req, res, next) => {
    try {
        const {
            discount,
            price,
            imagesUrls,
            data,
            categoryId
        } = req.body;
        const userID = req.user.id;
        const product = new Products({
            userID,
            discount,
            price,
            imagesUrls,
            data,
            categoryId,
            createdAt: new Date()
        });

        await product.save();
        res.status(200).json(` ${product.data[0].name} added with ${product.data[0].description} and ${product}`);
    } catch (err) {
        next(err);
    }
})




router.post('/upload', async (req, res, next) => {
    try {
        const {
            photo
        } = req.files;
        cloudinary.uploader.upload(photo.tempFilePath, (err, result) => {
        res.status(200).json(result.url);

        })
    } catch (err) {
        next(err);
    }
})



module.exports = router;
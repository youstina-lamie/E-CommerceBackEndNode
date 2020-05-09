const express = require('express');
const Users = require('../models/user');
const Products = require('../models/product');
const authnticationMiddleware = require('../middlewares/authentication');
const router = express.Router();


router.post('/login', async (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        res.status(422).send(`${!req.body.email? 'email' : 'password' } is required`);
    } else {
        try {
            const {
                email,
                password
            } = req.body;
            const person = await Users.findOne({
                email
            });
            if (!person) {
                throw new Error('please check !!! you not entre the right email or password')
            } else {
                const isValidPerson = await person.comparePassword(password);
                if (isValidPerson) {
                    const token = await person.generateToken();
                    res.status(200).json({
                        person,
                        token
                    });
                } else {
                    throw new Error('please check !!! you not entre the right email or password')
                }
            }
        } catch (err) {
            err.statusCode = 422;
            next(err);
        }

    }
})

router.post('/register', async (req, res, next) => {
    try {
        const {
            email,
            password,
            repeatedPassword
        } = req.body;
        const user = new Users({
            email,
            password
        });
        if (password !== repeatedPassword) {
            
            throw new Error('please check !!! you not entre the right email or Password');
        }
        await user.save();
        res.status(200).json(`s`);
    } catch (err) {
        err.statusCode = 422;
        next(err);
    }

})


module.exports = router;
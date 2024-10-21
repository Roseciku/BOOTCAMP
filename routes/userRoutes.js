//importing packages and modules
const express = require ('express');
const { registerUser, loginUser, logoutUser, getUser,editUser}= require('../controllers/userController')
const{check} = require('express-validator');
const router = express.Router();

//registration route
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),//checking name is not empty
        check('email', 'Please provide a valid email').isEmail(),
        check('password','Password must be 6characters or more.').isLength({min: 6})
    ],
    //if validation passes, register user
    registerUser
);

//login route
router.post('/login', loginUser);

//get user
router.get('/individual', getUser);

//edit user
router.put('/individual/edit',
[
    check('name', 'Name is required').not().isEmpty(),//checking name is not empty
    check('email', 'Please provide a valid email').isEmail(),
    check('password','Password must be 6characters or more.').isLength({min: 6})
],
 editUser
);

//logout
//router.get('/logout', logoutUser);


module.exports = router;
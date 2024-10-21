const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');//frontend validation might not be adequate to counter malicious users, so that's why we have also back-end valiation

//register user

exports.registerUser = async (req, res)=>{
    const errors = validationResult(req);//variable that will hold the errors. We pass req to the validation result method so that it can validate for us. The validation is performed on the route
    //check if any errors present in validation
    if(!errors.isEmpty()){
        return res.status(400).json({message: 'Please correct input errors', errors: errors.array()})
    }
    //else If no errors, we fetch input parameters from the request body
    const {name, email, password}= req.body;
//use try-catch for error handling
    try{
        //check if a user exists
        const [users] = await db.execute('SELECT email FROM users WHERE email = ?', [email]);
   if(users.length > 0){
    return res.status(400).json({message:'The user already exist'});
   }
   //prepare our data - hash the password
   const hashedPassword = await bcrypt.hash(password, 10);

   //insert the record
   await db.execute('INSERT INTO users (name, email, password) VALUES(?,?,?)',[name,email,hashedPassword])
   //response
   return res.status(201).json({message: 'New user registered successfully'})
    }catch(error){
        console.error(error);
        res.status(500).json({message: 'An error coccured during registration', error:error.message})
    }
};   

//login
exports.loginUser = async (req, res)=>{
    //fetch email & password from request body
    const {email, password} = req.body;

    try{
        //check if user exists
        const [user] = await db.execute('SELECT name,email FROM users WHERE email = ?', [email]);
    if(user.length === 0){//if user does not exist
        return res.status(400).json({message:'The user does not exist'})
    }
    //else if user exists check the password
    const isMatch = await bcrypt.compare(password, user[0].password);//use bcrypt function to match the plain password to the hashed password stored in the database.user[0].password is the password stored in the database in the variable user where the password resides. user[0] is an array
   if(!isMatch){
    return res.status(400).json({message:'Invalid email/password combination'})
   }
//else if it is a match we can create a session.save the name by accsessing the user and the email
req.session.userId= user[0].id;
req.session.name =user[0].name;
req.session.email = user[0].eamil;

return res.status(200).json({message: 'Successful login!'})
}catch(error){
    console.error(error);
    res.status(500).json({message: 'An error coccured during login', error:error.message})
}

}

//logout
exports.logoutuser = (req, res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.error(err);
            return res.status(500).json({message:'An error occured', error: err.message})
        }
        return res.status(200).json({message: 'Successfully logged out!'})
    });
}

//get user information for editing
exports.getUser = async (req,res)=>{
    //check whether user is looged in/authorised
    if(!req.session.userId){
        return res.status(401).json({message:'Unauthorized!'})
 }
//if logged in we can fetch user for editing
try{
    //fetch user
    const [users] = await db.execute('SELECT name, email FROM users WHERE id = ?', [req.session.userId]);
    if(users.length === 0){
     return res.status(400).json({message:'User not found'});
    }

    return res.status(200).json({message:'User details fetched for editing.', user:user[0]})
}catch(error){
    console.error(error);
    return res.status(500).json({message:'An error occured while fetching user details.',error: error.message})
}

};
//function for editing user
exports.editUser = async(req, res)=>{
    const errors = validationResult(req);//variable that will hold the errors. We pass req to the validation result method so that it can validate for us. The validation is performed on the route
    //check if any errors present in validation
    if(!errors.isEmpty()){
        return res.status(400).json({message: 'Please correct input errors', errors: errors.array()})
    }
    // if no validation errors, we can procede to change the user details
    //fetch user details from request body
    const{name, email, password}=req.body;
    //prepare our data - hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    //check if user is logged in
    if(!req.session.userId){
    return res.status(401).json({message:'Unauthorised. Please login'})
    }
    //else if loggedin we can try edit the user details
    try{
        //update user details
    await db.execute('UPDATE users SET name = ?, email= ?,password=? WHERE id =?', [name, email,hashedPassword, req.session.userId])
    return res.status(200).json({message:'User details updated successfully'})
    }catch(error){
        console.err(error);
        return res.status(500).json({message: 'An error occured during edit.',error: error.message})
    }
}
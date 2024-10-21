//import necessary packages
const db = require('./config/db'); // for database connection
const express =require('express');
const bodyParser = require('body-parser');//helps to capture input parameters from the form
const session = require('express-session');//used for session management
const MySQLStore = require('express-mysql-session')(session);// cvariable that will help store and manage the session
const dotenv = require('dotenv');
const path = require('path')

//initialize env management
dotenv.config();

//initialize app
const app= express();

//configure middleware
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(bodyParser.json());//use json
app.use(bodyParser.urlencoded({extended: true}));//capture form data

//configure session store.how session will be stored which is the database
const sessionStore = new MySQLStore({}, db);//accesses the store created on line 5. New is a keyword
//configure session middleware.
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave:false,
    saveUninitialized:false,//determines whether to store unitialized sessions
    cookie:{
        maxAge: 1000 * 60 *60 //1 hour =>3600s
    }
}));

//configure routes.url that will handle usermanagement
app.use('/telemedicine/api/users', require('./routes/userRoutes'));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 5500;

//start server
app.listen(PORT, ()=>{
console.log(`Server is running at: http://localhost:${PORT}`);
});
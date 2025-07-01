const express = require('express')
const app = express()
const userRouter = require('./routes/user.routes')
const indexRouter= require('./routes/index.routes')

const dotenv = require('dotenv');
dotenv.config()
const connectToDB = require('./config/db')
connectToDB();
const cookieParser = require('cookie-parser')

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.set('view engine','ejs')
app.use(cookieParser())
app.use('/',indexRouter)
app.use('/user',userRouter)
//global method for error handeling not preffered used on last hope
process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception');
    console.log(err);

})


app.listen(3000,()=>{
    console.log('Server is running on Port 3000')
})
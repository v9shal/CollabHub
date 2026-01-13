import express from 'express'
import cookieParser from 'cookie-parser'
import authRoute from './routes/authRoutes.js'
import cors from 'cors'
const app=express();
app.use(cookieParser())

app.use(cors())
app.use('/api/auth',authRoute);
app.listen(3000,()=>{
    console.log('app listening on port 3000');
})
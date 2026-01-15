import express from 'express'
import cookieParser from 'cookie-parser'
import authRoute from './routes/authRoutes.js'
import cors from 'cors'
import collectionRoute from './routes/collectionRoutes.js'
import 'dotenv/config';
const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", 
    credentials: true, 
  })
);

console.log(process.env.DATABASE_URL)
console.log(process.env.JWT_TOKEN);
app.use('/api/auth', authRoute);
app.use('/api/collections',collectionRoute);

app.listen(3000, () => {
  console.log('app listening on port 3000')
})
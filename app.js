require("dotenv").config()
const path = require("path")
const express = require("express")
const bodyParser = require("body-parser")
const fs = require("fs")
const jwt = require('jsonwebtoken')
const cookieParser = require("cookie-parser")


const app = express()

const PORT = process.env.PORT
const SECRET_KEY = process.env.SECRET_KEY
app.set("view engine", "ejs")
app.set(path.join(__dirname,"views"))
app.use(express.static(path.join(__dirname,"public")))
app.use(bodyParser.urlencoded({extended:true}))
app.use(cookieParser())

app.use(express.json())
const auth = (req, res, next) => {
    const token = req.cookies.token
    if (token) {
      jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
          return res.status(403).redirect("/login")
        }
        req.user = user
        next()
      })
    } else {
      res.redirect("/login")
    }
  }

app.get("/", (req,res) => {
   
    res.render("register")
})

app.post("/register", (req,res) => {
    
    const {username,password} = req.body
    const users = JSON.parse(fs.readFileSync("users.json"))
    const user = users.find(user => user.username === username && user.password === password)
    if(user){
        return res.send("User already exists")
    }
    users.push({username,password})
    fs.writeFileSync("users.json", JSON.stringify(users))
    res.redirect("/login")
    

})

app.get("/login", (req,res) => {
    res.render("login")
})
app.get("/register",(req,res) =>{
    res.render("register")
})

app.post("/login", (req,res) => {
    const {username, password} = req.body
    const users = JSON.parse(fs.readFileSync("users.json"))
    const user = users.find(user => user.username === username && user.password === password)
    if(!user){
         return res.redirect("/register")
    }
    const token = jwt.sign(user, SECRET_KEY, { expiresIn: 60 })
    res.cookie('token', token, { httpOnly: true })
    res.render("user",{username})
   

})
app.get("/login", (req,res) => {
    res.render("user" )
})



app.get("/user" ,auth ,(req,res) => {
    res.status(200).redirect("/user")
})

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})
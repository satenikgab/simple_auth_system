require("dotenv").config()
const path = require("path")
const express = require("express")
const bodyParser = require("body-parser")
const fs = require("fs")
const jwt = require('jsonwebtoken')

const app = express()

const PORT = process.env.PORT
const SECRET_KEY = process.env.SECRET_KEY
app.set("view engine", "ejs")
app.set(path.join(__dirname,"views"))
app.use(express.static(path.join(__dirname,"public")))
app.use(bodyParser.urlencoded({extended:true}))

app.use(express.json())

const auth = (req, res, next) => {
    const authHeader = req.headers['authorization']
    if (authHeader) {
      const token = authHeader.split(' ')[1]
      jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
          return res.status(403).send('Invalid token').redirect("/login")
        }
        req.user = user
      })
      return next()
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
         res.redirect("/register")
    }
    const token = jwt.sign(user, SECRET_KEY, { expiresIn: 60 })
    res.status(200).send(token).redirect("/user")
   

})
app.get("/login", (req,res) => {
    res.render("user")
})


app.get("/user" ,auth ,(req,res) => {
    res.status(200).json({ message: "Hello ", user: req.user })
})

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})
require('dotenv').config();
import express from 'express';
import mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import TodoItem from './models/todo.model';
import userModel from './models/user.model';
const app = express();
const port = 3000;


/**Base Setup */
const urlEncodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json());
const dbHost = 'mongodb://127.0.0.1/alaa-mady';

/**DB Connection */
mongoose.connect(dbHost);
const connection = mongoose.connection;

connection.once("open", () => {
    console.log("MongoDb connection established successfully!");
})

const todoRoutes = express.Router()


/**Authentication */

app.post('/signup',async (req, res) => {
    const user = req.body;

    const takenUsername = await userModel.findOne({username: user.username});
    if(takenUsername){
        res.json({
            message: "Username has already been taken"
        })
    }else{
        user.password = await bcrypt.hash(req.body.password, 10);
        const newUser = new userModel({
            username: user.username.toLowerCase(),
            password: user.password,
          });
        newUser.save();
        res.json({
        message: "new user has been created successfully",
        isLoggedIn: true,
        });
    }
})

app.post("/login", (req, res) => {
    const userLoggingIn = req.body;
    userModel.findOne({ username: userLoggingIn.username }).then((dbUser) => {
      if (!dbUser) {
        return res.json({ message: "User doesn't exist" });
      }
      bcrypt
        .compare(userLoggingIn.password, dbUser.password)
        .then((isCorrect) => {
          if (isCorrect) {
            const payload = {
              id: dbUser._id,
              username: dbUser.username,
            };
            jwt.sign(
              payload,
              process.env.JWT_SECRET,
              { expiresIn: 86400 },
              (err, token) => {
                if (err) {return res.json({ message: err })}
                return res.json({
                    message: "Success",
                    token: "Bearer" + token,
                    isLoggedIn: true,
                });

              }
            );
          } else {
            return res.json({
              message: "Invalid password",
            });
          }
        });
    });
  });

  app.get("/isUserAuth", async (req, res, next) => {
    const token = (req.headers["x-access-token"] as string)?.split(" ")[1];
  
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err)
          return res.json({
            isLoggedIn: false,
            message: "failed to authenticate",
          });
        req.body.user = {};
        req.body.user.id = decoded.id;
        req.body.user.username = decoded.username;
        next();
      });
    } else {
      res.json({ message: "Incorrect Token", isLoggedIn: false });
    }
  });

  /** CRUDs */
  todoRoutes.route('/:id').get((req,res) => {
    const id = req.params.id;
    TodoItem.findById(id, (e, message) => {
        if(e) console.log(`Error getting todo item with id: ${id}`)
        res.json(message);
    })
  })

  todoRoutes.route('/create').post((req, res) => {
    const todo = new TodoItem(req.body);
    todo
    .save()
    .then((todo) => {
      res.status(200).json({ todo: "todo posted successfully" });
    })
    .catch((err) => {
      res.status(400).send("posting todo failed");
    });
  })

  todoRoutes.route('/edit/:id').put((req, res) => {
    const id = req.params.id;
    TodoItem.findById(id, (e, message) => {
        if(!message){ 
            res.status(404).send("Todo not found");
        } else { 
            message.title = req.body.title ?? message.title;
            message.completed = req.body.completed ?? message.completed;

        }
        message
        .save()
        .then((message) => {
          res.json("Todo edited");
        })
        .catch((err) => {
          res.status(400).send("Editing Failed");
        });
    })
  })


app.use("/todos", todoRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    return console.log(`App is running on: localhost:${port}`)
})
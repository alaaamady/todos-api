"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const bodyParser = __importStar(require("body-parser"));
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const todo_model_1 = __importDefault(require("./models/todo.model"));
const user_model_1 = __importDefault(require("./models/user.model"));
const app = (0, express_1.default)();
const port = 3000;
/**Base Setup */
// app.use(cors());
const urlEncodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json());
const dbHost = 'mongodb://127.0.0.1/alaa-mady';
/**DB Connection */
mongoose_1.default.connect(dbHost);
const connection = mongoose_1.default.connection;
connection.once("open", () => {
    console.log("MongoDb connection established successfully!");
});
const todoRoutes = express_1.default.Router();
/**Authentication */
app.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body;
    const takenUsername = yield user_model_1.default.findOne({ username: user.username });
    if (takenUsername) {
        res.json({
            message: "Username has already been taken"
        });
    }
    else {
        user.password = yield bcrypt.hash(req.body.password, 10);
        const newUser = new user_model_1.default({
            username: user.username.toLowerCase(),
            password: user.password,
        });
        newUser.save();
        res.json({
            message: "new user has been created successfully",
            isLoggedIn: true,
        });
    }
}));
app.post("/login", (req, res) => {
    const userLoggingIn = req.body;
    user_model_1.default.findOne({ username: userLoggingIn.username }).then((dbUser) => {
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
                jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 86400 }, (err, token) => {
                    if (err) {
                        return res.json({ message: err });
                    }
                    return res.json({
                        message: "Success",
                        token: "Bearer" + token,
                        isLoggedIn: true,
                    });
                });
            }
            else {
                return res.json({
                    message: "Invalid password",
                });
            }
        });
    });
});
app.get("/isUserAuth", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers["x-access-token"]) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
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
    }
    else {
        res.json({ message: "Incorrect Token", isLoggedIn: false });
    }
}));
/** CRUDs */
todoRoutes.route('/:id').get((req, res) => {
    const id = req.params.id;
    todo_model_1.default.findById(id, (e, message) => {
        if (e)
            console.log(`Error getting todo item with id: ${id}`);
        res.json(message);
    });
});
todoRoutes.route('/create').post((req, res) => {
    const todo = new todo_model_1.default(req.body);
    todo
        .save()
        .then((todo) => {
        res.status(200).json({ todo: "todo posted successfully" });
    })
        .catch((err) => {
        res.status(400).send("posting todo failed");
    });
});
todoRoutes.route('/edit/:id').put((req, res) => {
    const id = req.params.id;
    todo_model_1.default.findById(id, (e, message) => {
        var _a, _b;
        if (!message) {
            res.status(404).send("Todo not found");
        }
        else {
            message.title = (_a = req.body.title) !== null && _a !== void 0 ? _a : message.title;
            message.completed = (_b = req.body.completed) !== null && _b !== void 0 ? _b : message.completed;
        }
        message
            .save()
            .then((message) => {
            res.json("Todo edited");
        })
            .catch((err) => {
            res.status(400).send("Editing Failed");
        });
    });
});
app.use("/todos", todoRoutes);
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.listen(port, () => {
    return console.log(`App is running on: localhost:${port}`);
});
//# sourceMappingURL=app.js.map
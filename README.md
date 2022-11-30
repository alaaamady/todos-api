## Back - End
### Technologies used: 

 1. Node.js 
 2. Express.js
 3. bcrypt for encrypting passwords
 4. JWTs for token-based authentication
 5. MongoDB & Mongoose
 

### In the `todos-api`You'll find:

 - `models` directory containing all the DB models implemented


 - `server.js` containing all endpoints' logic and functionality

### Make sure to: 
 - create a `.env` file with JWT_SECRET
 - run `npm install` to include all dependencies
 - have mongoDB server running
 - run your server with `npm run start`	

### Endpoints
| **Endpoint** | **Functionality** |
|--|--|
|  POST/signup| Registers new user |
|POST/login|Log in existing user|
|GET/isUserAuth| Checks if user is authenticated|
|GET/todos|List all todos|
|GET/todos/:id|get specific todo|
|POST/todos/create|Create new todo|
|POST/todos/edit/:id|Updates existing todo|

### Some of the practices I followed:

 - Single Responsbility Princible: writing functions with descriptive names that have one sole purpose
 - all variables and constants have descriptive names, no `x`, `y` or `var1` naming
 - used `const` instead of `let` almost always, I believe that if I find myself needing to use a variable I ask myself "is there a better way to do this?"

### What to Improve: 

 1. add middleware authentication checker to each private route
 2. add DB seed
 3. add test cases


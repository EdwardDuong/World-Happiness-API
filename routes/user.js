require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const e = require("express");

router.post("/register", function (req, res, next) {
  const user = req.body.email;
  const password = req.body.password;

  if (!user || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required",
    });
    return;
  }
  req.db
    .from("users")
    .where("username", "like", user)
    .then((rows) => {
      if (rows.length !== 0) {
        //409 bad request
        res.status(409).json({
          error: true,
          message: "user exists",
        });
        return;
      }
      //IMPLEMENT HASHING PASSWORD WITH BCRYPT MODULE
      const saltRounds = 10;
      //hashSync
      const hash = bcrypt.hashSync(password, saltRounds);
      console.log(hash);
      //Insert into data base
      req.db
        .insert({ username: user, password: hash })
        .into("users")
        .then((abc) => console.log(abc));
      res
        .status(201)
        .json({ success: true, message: "User registered successfully" });
    })
    .catch((err) => {
      console.log(err);
      res.json({ Error: false, Message: "Error in MySQL query" });
    });
});

//Make function login and check
router.post("/login", (req, res) => {
  const user = req.body.email;
  const password = req.body.password;
  if (!user || !password) {
    return res.status(400).json({
      message: "Request body incomplete, both email and password are required",
    });
  }

  req.db
    .from("users")
    .select("username", "password")
    .where("username", "like", user)
    .then(async (users) => {
      // Not exists
      if (users[0] === undefined) {
        return res
          .status(401)
          .json({ error: true, message: "Incorrect email or password" });
      }

      const hash = users[0].password;
      const correctHash = await bcrypt.compare(password, hash);
      console.log();
      if (!correctHash) {
        return res
          .status(401)
          .json({ error: true, message: "Incorrect email or password" });
      } else {
        const secret = "secret_key";
        const expires_in = 24 * 3600;
        const exp = Date.now() + expires_in * 1000;
        const token = jwt.sign({ user, exp }, secret);
        res.status(200).json({ token_type: "Bearer", token, expires_in });
      }
    });
});

router.get("/:email/profile", (req, res) => {
  const email = req.params.email;
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.split(" ")[1];
    const typeToken = authorization.split(" ")[0];
    if (token) {
      try {
        const decode = jwt.verify(token, process.env.SECRET_KEY);
        // IF AUTHORIZED
        if (decode.exp < Date.now()) {
          res.status(401).json({
            error: true,
            message: "JWT token has expired",
          });
        } else {
          req.db
            .select("username", "firstName", "lastName", "dob", "address")
            .from("users")
            .where("username", "like", email)
            .then((rows) => {
              if (rows.length === 0) {
                //404 User Not Found
                res.status(404).json({
                  error: true,
                  message: "User not found",
                });
                return;
              }
              console.log(rows);
              return res.status(200).json({
                email: rows[0].username,
                firstName: rows[0].firstName,
                lastName: rows[0].lastName,
                dob: rows[0].dob,
                address: rows[0].address,
              });
            })
            .catch((err) => {
              console.log(err);
              res.json({ Error: false, Message: "Error in MySQL query" });
            });
        }
      } catch (_) {
        console.error("Invalid token");
      }
    }
  }

  req.db
    .select("username", "firstName", "lastName")
    .from("users")
    .where("username", "like", email)
    .then((rows) => {
      if (rows.length === 0) {
        //404 User Not Found
        res.status(404).json({
          error: true,
          message: "User not found",
        });
        return;
      }
      res.status(200).json({
        email: rows[0].username,
        firstName: rows[0].firstName,
        lastName: rows[0].lastName,
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({ Error: false, Message: "Error in MySQL query" });
    });
});

// router.put("/:email/profile", (req, res) => {
//   const email = req.params.email;
//   const { firstName, lastName, dob, address } = req.body;

//   const authorization = req.headers.authorization;
//   if (Object.keys(input).length === 0) {
//     return res.status(400).json({
//       error: true,
//       message:
//         "Request body incomplete: firstName, lastName, dob and address are required.",
//     });
//   }
//   if (Object.keys(input).length === 3) {
//     return;
//   }
//   // TODO validate INPUT body
//   else if (authorization) {
//     const token = authorization.split(" ")[1];
//     if (token) {
//       try {
//         const decode = jwt.verify(token, process.env.SECRET_KEY);
//         // IF AUTHORIZED
//         if (decode.exp < Date.now()) {
//           res.status(401).json({
//             error: true,
//             message: "Authorization header ('Bearer token') not found",
//           });
//         } else if (decode.user !== email) {
//           res.status(403).json({
//             error: true,
//             message: "Forbidden",
//           });
//         } else {
//           req.db
//             .table("users")
//             .where("username", "like", email)
//             .update({
//               firstName: input.firstName,
//               lastName: input.lastName,
//               dob: input.dob,
//               address: input.address,
//             })
//             .then((rows) => {
//               return res.status(200).json({
//                 email: email,
//                 firstName: input.firstName,
//                 lastName: input.lastName,
//                 dob: input.dob,
//                 address: input.address,
//               });
//             })
//             .catch((err) => {
//               console.log(err);
//               res.json({ Error: false, Message: "Error in MySQL query" });
//             });
//         }
//       } catch (_) {
//         console.log(_);
//         console.error("Invalid token");
//       }
//     }
//   } else {
//     res.status(401).json({
//       error: true,
//       message: "Authorization header ('Bearer token') not found",
//     });
//   }
// });
const authenticateToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ error: true, message: "Unauthorized" });
  }
  const token = authorization.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: true, message: "Unauthorized user" });
  }

  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    if (decode.exp < Date.now()) {
      return res
        .status(401)
        .json({ error: true, message: "The token has expired!" });
    }
    next();
  } catch (_) {
    res.status(401).json({ error: true, message: "The token is invalid!" });
  }
};
function checkTime(field) {
  var errorMsg = "";

  // regular expression to match required time format
  re = /^(\d{1,2}):(\d{2})(:00)?([ap]m)?$/;

  if (field.value != "") {
    if ((regs = field.value.match(re))) {
      if (regs[4]) {
        // 12-hour time format with am/pm
        if (regs[1] < 1 || regs[1] > 12) {
          errorMsg = "Invalid value for hours: " + regs[1];
        }
      } else {
        // 24-hour time format
        if (regs[1] > 23) {
          errorMsg = "Invalid value for hours: " + regs[1];
        }
      }
      if (!errorMsg && regs[2] > 59) {
        errorMsg = "Invalid value for minutes: " + regs[2];
      }
    } else {
      errorMsg = "Invalid time format: " + field.value;
    }
  }

  if (errorMsg != "") {
    alert(errorMsg);
    field.focus();
    return false;
  }

  return true;
}
router.put("/:email/profile", authenticateToken, (req, res) => {
  const email = req.params.email;
  if (Object.keys(req.body)[0] === undefined) {
    return res.status(400).json({
      error: true,
      message:
        "Request body incomplete: firstName, lastName, dob and address are required.",
    });
  }
  const { firstName, lastName, dob, address } = req.body;
  const age = dob.substring(2, 4);
  regexDOB = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
  if (!email) {
    return res
      .status(400)
      .json({ error: true, message: "Request body incomplete - email needed" });
  } else {
    if (parseInt(age) > 21) {
      return res.status(400).json({
        error: true,
        message: "Invalid input: dob must be a date in the past.",
      });
    }
    if (!regexDOB.test(dob)) {
      return res.status(400).json({
        error: true,
        message: "Invalid input: dob must be a real date in format YYYY-MM-DD.",
      });
    } else if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof address !== "string"
    ) {
      return res.status(400).json({
        error: true,
        message:
          "Request body invalid, firstName, lastName and address must be strings only.",
      });
    } else {
      req.db
        .from("users")
        .where({ email: email })
        .update(
          {
            firstName: firstName,
            lastName: lastName,
            dob: dob,
            address: address,
          },
          ["email", "firstName", "lastName", "dob", "address"]
        )
        .then((users) => {
          if (users === 0) {
            return res.status(403).json({ error: true, message: "Error" });
          } else if (users === 1) {
            req.db
              .from("users")
              .select("email", "firstName", "lastName", "dob", "address")
              .where({ email: email })
              .then((rows) => {
                res.status(200).json(rows[0]);
              });
          }
        });
    }
  }
});
module.exports = router;

 var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");

router.get("/:year", (req, res) => {
  const email = req.params.email;
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({
      error: true,
      message: "Authorization header ('Bearer token') not found",
    });
  } else if (authorization) {
    const token = authorization.split(" ")[1];
    const typeToken = authorization.split(" ")[0];
    if (typeToken !== "Bearer") {
      return res.status(401).json({
        error: true,
        message: "Authorization header is malformed",
      });
    }
    if (token) {
      try {
        const decode = jwt.verify(token, process.env.SECRET_KEY);
        // IF AUTHORIZED
        if (decode.exp < Date.now()) {
          return res.status(401).json({
            error: true,
            message: "JWT token has expired",
          });
        } else {
          const query = Object.keys(req.query);
          const { limit, country } = req.query;
          regexYear = /^\d{4}$/;
          regexCountry = /\b[^\d\W]+\b/g;
          regexLimit = /^[1-9]\d*$/;
          if (!req.params.year) {
            return res.status(400).json({
              error: true,
              message: "There is no parameter year defined",
            });
          } else if (req.params.year) {
            if (!regexYear.test(req.params.year)) {
              res.status(400).json({
                error: true,
                message: "Invalid year format. Format must be yyyy.",
              });
            } else if (req.params.year > 2020 || req.params.year < 2015) {
              res.status(200).json([]);
            } else if (Object.keys(req.query).length === 0) {
              req.db
                .from("rankings")
                .where("year", "=", req.params.year)
                .orderBy("year", "desc")
                .then((rows) => {
                  console.log(rows.length);
                  res.status(200).json(rows);
                })
                .catch((_) => {
                  console.log(_);
                  res.json({ Error: false, Message: "Error in MySQL query" });
                });
            } else if (query.length > 2) {
              console.log(query[0]);
              res.status(400).json({
                error: true,
                message:
                  "Invalid query parameters. Only year and country are permitted.",
              });
            } else if (query[0] !== "limit" && query[0] !== "country") {
              console.log(query[0]);
              res.status(400).json({
                error: true,
                message:
                  "Invalid query parameters. Only year and country are permitted.",
              });
            } else if (limit || country) {
              if (limit && !country) {
                if (!regexLimit.test(limit)) {
                  res.status(400).json({
                    error: true,
                    message:
                      "Invalid limit query. Limit must be a positive number.",
                  });
                } else {
                  req.db
                    .from("rankings")
                    .orderBy("year", "desc")
                    .where("year", "=", req.params.year)
                    .limit(limit)
                    .then((rows) => {
                      console.log(rows);
                      res.status(200).json(rows);
                    })
                    .catch((_) => {
                      console.log(_);
                      res.json({
                        Error: false,
                        Message: "Error in MySQL query",
                      });
                    });
                }
              } else if (country && !limit) {
                if (!regexCountry.test(country)) {
                  res.status(400).json({
                    error: true,
                    message:
                      "Invalid country format. Country query parameter cannot contain numbers.",
                  });
                } else {
                  req.db
                    .from("rankings")
                    .where({ year: req.params.year, country: country })
                    .orderBy("country", "asc")
                    .then((rows) => {
                      console.log(rows.length);
                      res.status(200).json(rows);
                    })
                    .catch((_) => {
                      console.log(_);
                      res.json({
                        Error: false,
                        Message: "Error in MySQL query",
                      });
                    });
                }
              } else if (
                rq.query !== rq.query.year ||
                rq.query !== rq.query.country
              ) {
                res.status(400).json({
                  Error: true,
                  message: "error",
                });
              }
            } else {
              res.status(400).json({
                Error: true,
                message: "error",
              });
            }
          } else {
            res.status(400).json({
              Error: true,
              message: "error",
            });
          }
        }
      } catch (_) {
        return res
          .status(401)
          .json({ error: true, message: "Invalid JWT token" });
      }
    }
  }
});
module.exports = router;

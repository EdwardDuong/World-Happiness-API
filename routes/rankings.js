var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");

//GET Rankings
router.get("/", function (req, res, next) {
  // Without year and country search
  if (Object.keys(req.query).length === 0) {
    req.db
      .from("rankings")
      .distinct("country", "rank", "score", "year")
      .orderBy([{ column: "year", order: "desc" }, "rank"])
      .then((rows) => {
        if (rows.length !== 0) {
          console.log(rows);
          res.status(200).json(rows);
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ error: false, Message: "Error in MySQL query" });
      });
  } else if (Object.keys(req.query).length > 2) {
    res.status(400).json({
      error: true,
      message: "Invalid query parameters. Only year and country are permitted.",
    });
  }
  // With year or country or both
  else {
    const country = req.query.country;
    const year = req.query.year;
    const numbers = /^[0-9]+$/;
    const letters = /^[A-Za-z]+$/;

    if (country && !letters.test(country)) {
      res
        .status(400)
        .json({
          error: true,
          message:
            "Invalid country format. Country query parameter cannot contain numbers.!",
        })
        .statusMessage("Bad Request");
    }
    if (year && !numbers.test(year)) {
      res
        .status(400)
        .json({
          error: true,
          message:
            "Invalid year format. Year query parameter cannot contain letter.!",
        })
        .statusMessage("Bad Request");
    }
    if (!letters.test(country) && country) {
      res
        .status(400)
        .json({
          error: true,
          message:
            "Invalid year format. Year query parameter cannot contain letter.!",
        })
        .statusMessage("Bad Request");
    }

    // both year and country
    if (country && year) {
      req.db
        .from("rankings")
        .distinct("country", "rank", "score", "year")
        .where("country", "like", `%${country}%`)
        .andWhere("year", year)
        .orderBy("rank", "desc")
        .then((rows) => {
          if (rows.length !== 0) {
            console.log(rows);
            res.status(200).json(rows);
          } else {
            res.status(400).json([]);
          }
        })
        .catch((err) => {
          console.log(err);
          res
            .status(400)
            .json({ error: false, Message: "Error in MySQL query" })
            .statusMessage("Bad Request");
        });
    }
    // only year
    else if (year) {
      req.db
        .from("rankings")
        .distinct("country", "rank", "score", "year")
        .where("year", year)
        .then((rows) => {
          if (rows.length !== 0) {
            console.log(rows);
            res.status(200).json(rows);
          } else {
            res.status(200).json([]);
          }
        })
        .catch((err) => {
          console.log(err);
          res
            .json({ error: false, Message: "Error in MySQL query" })
            .statusMessage("Bad Request");
        });
    }
    // only country
    else if (country) {
      req.db
        .from("rankings")
        .distinct("country", "rank", "score", "year")
        .where("country", "like", `%${country}%`)
        .orderBy("rank", "desc")
        .then((rows) => {
          if (rows.length !== 0) {
            console.log(rows);
            res.status(200).json(rows);
          } else {
            res.status(200).json([]);
          }
        })
        .catch((err) => {
          console.log(err);
          res
            .json({ error: false, Message: "Error in MySQL query" })
            .statusMessage("Bad Request");
        });
    }
  }
});
module.exports = router;

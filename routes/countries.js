var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");

router.get("/", function (req, res) {
  if (Object.keys(req.query).length === 0) {
    console.log(req.query.industry);
    req.db
      .from("rankings")
      .distinct("country")
      .then((rows) => {
        var data = [];
        for (var i = 0; i < rows.length; i++) {
          countries = Object.values(rows[i]);
          data.push(countries[0]);
        }
        data.sort();
        console.log(data);
        res.status(200).json(data);
      })
      .catch(() => {
        console.log();
        res.json({ error: false, Message: "Error in MySQL query" });
      });
  } else {
    return res.status(400).json({
      error: true,
      message: "Invalid query parameters. Query parameters are not permitted.",
    });
  }
});
module.exports = router;

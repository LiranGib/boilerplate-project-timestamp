require('dotenv');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const dateFormateHandler = (req, res, next) => {
    let requestedDate = req.params.date;
    let [utcString, unixString] = ['',''];

    if(!requestedDate){
        unixString = new Date().getTime();
        utcString = new Date().toUTCString();
        req.dateObj = {unix: unixString, utcDate:utcString};
    } else if(isValidUnixDateString(requestedDate)){
        unixString = requestedDate
        utcString = new Date(Number(requestedDate)).toUTCString();
        req.dateObj = {unix: unixString, utcDate:utcString};
    } else if(isValidDateString(requestedDate)){
        unixString = new Date(requestedDate).getTime()
        utcString = new Date(requestedDate).toUTCString();
        req.dateObj = {unix: unixString, utcDate:utcString};
    } else {
        req.dateObj = { error : "Invalid Date" };
    }
    next();
};
const isValidDateString = (str) => {
    return !isNaN(Date.parse(str));
};

const isValidUnixDateString = (str) => {
    const unixTimeMs = Number(str) * 1000;
    return !isNaN(unixTimeMs) && new Date(unixTimeMs).getTime() > 0;
}

//bodyPArser middleware
app.use(bodyParser.urlencoded({extended: false}));

//middleware to log all requests 
app.use(function(req, res, next) {
    console.log(`${req.method} ${req.path} - ${req.ip}`);
    next();
});

app.use("/public", express.static(__dirname+"/public"));

app.get("/", (req,res) => {
    res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/:date?", dateFormateHandler, (req,res) => {
    let jsonRes;
    if(req.dateObj && req.dateObj.error){
        jsonRes = req.dateObj
    } else {
        jsonRes = { unix: req.dateObj.unix, utc: req.dateObj.utcDate }
    }
    res.json(jsonRes);
});



const listener = app.listen(process.env.PORT || 5000, function () {
    console.log("Your app is listening on port " + listener.address().port);
});
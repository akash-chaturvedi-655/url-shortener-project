//require(dotenv) not required below since replit has secrets!
//require('dotenv').config({path : 'sample.env' });
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser=require('body-parser');
const dns=require('dns');
const dnsPromises = require('dns').promises;
var mongoose=require("mongoose");
var validUrl = require('valid-url');
require('mongoose-type-url');

try {
const mySecret = process.env['URI']
mongoose.connect(process.env.URI);
}
catch(e){
   console.log(e);
}
mongoose.connection.on('error', function (err) 
{
  console.log(err);
});

app.use(bodyParser.urlencoded({ extended: "true" }));
app.use(bodyParser.json());


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

var urlSchema=new mongoose.Schema({
  id : Number,
  url_posted : mongoose.SchemaTypes.Url
});

const url_obj=mongoose.model("url_obj",urlSchema);

let flag=0;
if(flag==1)
{
url_obj.find({ url_posted:"https://www.facebook.com/" }).remove().exec();
console.log("removed successfully");
}

app.post("/api/shorturl/", function(req,res,next)
{
  var url=req.body["url"];
  console.log(url);

  const REPLACE_REGEX = /^https?:\/\//i 
  let rep_url=url.replace(REPLACE_REGEX, '');
  console.log("URL after removing http/https is :  "+rep_url);
  const urlExist = require("url-exist");

(async () => {
    const exists = await urlExist(url);
    // Handle result
    console.log(exists);
    if(!exists) return res.json({"error":"invalid url"});
})();

url_obj.findOne({url_posted:url},function(err,urlfound)
{
  if(err) return console.log(err);
  if(urlfound)
  {
    console.log("This already exists in the Database. Taking no action");
    //res.redirect("/");
  let id=urlfound["id"];
  console.log("Id is :" +id);
  return res.send({ "original_url": req.body["url"],
              "short_url" : id});   
        //next();
  }
  else
  {
    const myurl=new url_obj(
    {
      id: returnId(),
      url_posted: url
    }
  ).save(function(err,result)
    {
    if(err)  return console.log(err);
    console.log("Saved successfully : "+result);
   res.json({"original_url": req.body["url"],
              "short_url" : result["id"]})
    });
}
})
});
  
app.get("/api/shorturl/:short_url", function(req,res)
{
  let shorturl = req.params.short_url;
  console.log("ShortUrl value is : "+shorturl);

url_obj.find({id:shorturl},function(err, found)
{
  if(err) return console.log("Error : "+err);

  let final_url= found[0]["url_posted"];

  console.log("URL Found in Database : "+final_url);

res.redirect(final_url);
//return;
})

})

function returnId(param)
{
  return Math.floor(Math.random() * 100); 
}

async function hostnameExists(hostname) {
  try {
    await dnsPromises.lookup(hostname);
    return { hostname, exists: true };
  } catch (_) {
    return { hostname, exists: false };
  }
}

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

module.exports=urlSchema;
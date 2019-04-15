var bodyParser    = require("body-parser"),
    express       = require("express"),
    app           = express(),
    mongoose      = require("mongoose"),
    request       = require("request");
    // seedDB        = require("./seeds");
    
// seedDB();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.db_url, {useNewUrlParser: true});

var newsSchema = new mongoose.Schema({
    title: String,
    image: String,
    uuid: String,
    content: String,
    published: String
});

var News = mongoose.model("new", newsSchema);

// to display top headlines
app.get("/", function(req, res){
    res.redirect("/news");
});

app.get("/news", function(req, res){
    var link = "http://webhose.io/filterWebContent?token=36e79f1b-b639-46ee-921b-d052527e951e&format=json&ts=1539883490141&sort=published&q=india%20language%3Aenglish%20thread.country%3AIN%20site_type%3Anews%20is_first%3Atrue%20site%3Aindiatimes.com";
    request(link, function(err, response, body){
        // console.log(response.statusCode);
        if (!err && response.statusCode==200){
            var data = JSON.parse(body);
            for (var i=0; i<12; i++){
                var title = data["posts"][i]["title"];
                var image = data["posts"][i]["thread"]["main_image"];
                var uuid = data["posts"][i]["uuid"];
                var content = data["posts"][i]["text"];
                var published = data["posts"][i]["published"];
                var news_object = {title: title, image: image, uuid: uuid, content: content, published: published};
                News.create(news_object, function(err, new_news){
                    if (err){
                        console.log(err);
                    }
                });
            }
            res.render("index", {data: data});
        }
    });
});

// to display news from different categories
app.get("/news/misc", function(req, res){
    var link = "http://webhose.io/filterWebContent?token=36e79f1b-b639-46ee-921b-d052527e951e&format=json&ts=1539582191499&sort=published&q=food%20OR%20fashion%20OR%20travel%20language%3Aenglish%20thread.country%3AIN%20is_first%3Atrue%20site_type%3Ablogs%20site%3Adigit.in";
    request(link, function(err, response, body){
        if (!err && response.statusCode==200){
            var data = JSON.parse(body);
            for (var i=0; i<12; i++){
                var title = data["posts"][i]["title"];
                var image = data["posts"][i]["thread"]["main_image"];
                var uuid = data["posts"][i]["uuid"];
                var content = data["posts"][i]["text"];
                var published = data["posts"][i]["published"];
                var news_object = {title: title, image: image, uuid: uuid, content: content, published: published};
                News.create(news_object, function(err, new_news){
                    if (err){
                        console.log(err);
                    }
                });
            }
            res.render("misc", {data: data});
        }
    });
});

app.get("/news/:category", function(req, res){
    var category = req.params.category.toLowerCase();
    var link = "http://webhose.io/filterWebContent?token=36e79f1b-b639-46ee-921b-d052527e951e&format=json&ts=1539883490141&sort=published&q=" +category+ "%20language%3Aenglish%20thread.country%3AIN%20site_type%3Anews%20is_first%3Atrue%20site%3Aindiatimes.com";
    request(link, function(err, response, body){
        var data = JSON.parse(body);
        if (!err && response.statusCode==200 && data.totalResults != 0){
            for (var i=0; i<12; i++){
                var title = data["posts"][i]["title"];
                var image = data["posts"][i]["thread"]["main_image"];
                var uuid = data["posts"][i]["uuid"];
                var content = data["posts"][i]["text"];
                var published = data["posts"][i]["published"];
                var news_object = {title: title, image: image, uuid: uuid, content: content, published: published};
                News.create(news_object, function(err, new_news){
                    if (err){
                        console.log(err);
                    }
                });
            }
            res.render("template", {data: data, title: category});
        }
        else{
            res.render("error");
        }
    });
});

app.get("/news/content/:id", function(req, res){
    var id = req.params.id;
    News.find({uuid: id}, function(err, foundNews){
        if (err){
            res.render("error");
        }
        else{
            if (foundNews.length != 0){
                res.render("show", {news: foundNews});
            }
            else{
                res.render("error");
            }
        }
    });
});

app.get("*", function(req, res){
    res.render("error");
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("News App server started...");
});
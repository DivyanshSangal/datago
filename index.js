var express= require('express');
var mongoose=require('mongoose');
var bodyParser= require('body-parser');
var multer=require('multer');

var app=express();

var htmlfile1="<!DOCTYPE html><html lang=\"en\"><head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1, shrink-to-fit=no\"> <link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css\" integrity=\"sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm\" crossorigin=\"anonymous\"> <title>Your Text</title></head> <body><div class=\"jumbotron\"> <h2>Your Text is :</h2></div><div class=\"jumbotron\"><h1> ";
var htmlfile2="</h1></div></body></html>";

app.use(express.static('public'));

//DATABASE CONNECTION
mongoose.connect('mongodb://divyansh:password@ds123499.mlab.com:23499/divi');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
      console.log("Connected To MongoLab Cloud Database :p");
});

//DEFINING SCHEMA OF DATABASE TABLE
var urlSchema = mongoose.Schema({
    url: String,
    key: String,
    hits: Number,
	dataType: String,
    created: String
});
var Url = mongoose.model('Url', urlSchema);

//BODY PARSER CONNECTED TO APP
app.use(bodyParser.urlencoded({
	extended:true
}));
app.use(bodyParser.json());

//DECLARING STORAGE FOR MULTER
var Storage = multer.diskStorage({
    destination: function(req,file,callback){
        callback(null,"./Images");
    },
    fileName: function(req,file,callback){
        callback(null, file.fieldname + "_"+ Date.now()+"_"+file.orginalname);
    }
});
var upload = multer({storage: Storage}).array("imgUploader",3);
app.use(upload);

app.get('/',function(req,res){
	console.log("front");
	res.sendfile('./index.html')
    console.log("after front");
});

app.get('/profile/:user',function(req,res){
	res.send('Hi!'+req.params.user)
});

app.post('/short',function(req,res){
	var u_url = req.body.url;
	var u_key = req.body.key;
	var u_choice=req.body.urlornot;
    console.log(req.files);
	if(u_choice==="image")
    {
        u_url=req.files[0].path;
        upload(req,res,function(err){
            if(err){
                console.log(err);
            }
        });
    }
    var newUrl = new Url({url: u_url, key: u_key, dataType: u_choice, hits: 0, created: ''});
    console.log(u_key + "	" + u_url+u_choice);
    newUrl.save(function (err, data) {
        if (err) return console.error(err);
        console.log("Short Url Created");
    });

    res.send('URL HAS BEEN GENERATED');
	});

app.get('/:key',function(req,res){
	var user_key=req.params.key;
	Url.findOne({key:user_key},function(err,data){
		if(data)
        {
            if (err) console.error(err);
            var datatype = data.dataType;
            // console.log(htmlfile1+data.url+htmlfile2);

            if (datatype === 'url')
                res.redirect(data.url);
            else if(datatype==='text'){
                res.send(htmlfile1+data.url+htmlfile2);
            }
            else{
                var fname=data.url;
                console.log('./'+fname);
                res.sendfile('./'+fname);
            }
        }
        else{


        }
	})
});

app.listen(process.env.PORT || '3000',function(){
    console.log("Exress running on %d in %s mode",this.address().port,app.settings.env);
});
	
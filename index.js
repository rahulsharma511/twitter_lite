
let express = require('express');
let cors = require('cors');
require('dotenv').config();
const app = express();
let Twitter = require('twitter');
const json2html = require('node-json2html');


const client = new Twitter({
    consumer_key: process.env.API_KEY,
    consumer_secret: process.env.API_SECRET_KEY,
    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(cors())
//Define request response in root URL (/)
app.get('/', function (req, res) {
    res.sendFile(__dirname+"/views/test.html",(err)=>{
        if(err){
          console.log(err)
        }
    })
})
app.get('/test', function(req, res) {
    res.sendFile('test.html', {root: __dirname })
});


//Get tweets of specified users profile
app.get('/recent_tweets', function (req, res) {
    console.log(req.query);
    console.log("Query param = ", req.query['twitter_screen_name']);
    let params = {screen_name: req.query['twitter_screen_name'],count:15};
    client.get('statuses/user_timeline', params, function (error, tweets) {
        if (!error) {
          // console.log(tweets)
          let template = {'<>':'div','class':'card','html':[
            {'<>':'p','text':'Created at-     ${created_at}'},
            {'<>':'p','text':'id-      ${id}'},
            {'<>':'p','text':'id_str-      ${id_str}'},
            {'<>':'p','text':'Actual tweet-      ${text}'}
        ]};
          let html = json2html.render(tweets,template)
          res.send(html)
        } else {
            console.log("Error ", error);
            return res.status(500).send({error: JSON.stringify(error)});
        }
    });
});

//Post a tweet
app.post('/post_tweet', function (req, res) {
    // console.log("REQUEST BODY ", req.body);
    if (!req.body || !req.body.hasOwnProperty('actual_tweet')) {
        return res.status(400).send({error_message: "actual_tweet missing in body"});
    } else if (req.body.actual_tweet == null || req.body.actual_tweet == undefined || req.body.actual_tweet.length === 0)
        return res.status(400).send({error_message: "actual_tweet cannot be empty"});
    console.log(req.body.actual_tweet)
    client.post('statuses/update', {status: req.body.actual_tweet}, function (error, tweet, response) {
        if (error) {
            console.log(error)
            return res.status(500).send({error: JSON.stringify(error)});
        }
        // console.log(tweet);  // Tweet body.
        return res.status(200).json(tweet);
    });
});

//post_favorites api will like the tweet
app.post('/post_favorites', function (req, res) {
    //console.log("ID for the post to mark as fav", req.params.id);
    console.log(parseInt(req.body.tweet_id))
    var postID = req.body;
    console.log(postID.tweet_id)
    if (postID.tweet_id == null || postID.tweet_id == undefined ) {
        return res.status(400).send("Bad Request: Invalid Post ID");
    } else  if (!postID || !postID.hasOwnProperty('tweet_id')) {
        return res.status(400).send({error_message: "tweet_id missing in body"});
    }
    let params={id:postID.tweet_id}
    client.post('favorites/create', params, function (error, tweet, response) {
//        console.log('Response', response);
        if (error) {
            if(error.length>0) {
                var errorObj = error[0];
                if (errorObj.code == 139) {
                    return res.status(200).send("Already Liked "+errorObj.message);
                }
            }

            console.log("Got error in post fav", error);
            return res.status(500).send({error: JSON.stringify(error)});
        } else {
            // Tweet body.
            return res.status(200).json(tweet);
        }
    });


});


//post_favoritesDestroy api will unlike the tweet
app.post('/post_favoritesDestroy', function (req, res) {
    //console.log("ID for the post to mark as fav", req.params.id);

    var postID = req.body;
    if (postID.tweet_id == null || postID.tweet_id == undefined ) {
        return res.status(400).send("Bad Request: Invalid Post ID");
    } else  if (!postID || !postID.hasOwnProperty('tweet_id')) {
        return res.status(400).send({error_message: "tweet_id missing in body"});
    }

    client.post('favorites/destroy', {id: postID.tweet_id}, function (error, tweet, response) {
//        console.log('Response', response);
        if (error) {
            if(error.length>0) {
                var errorObj = error[0];
                if (errorObj.code == 139) {
                    return res.status(200).send("Already Disliked "+errorObj.message);
                }
            }

            //console.log("Got error in post fav", error);
            return res.status(500).send({error: JSON.stringify(error)});
        }
        //console.log(tweet);  // Tweet body.
        return res.status(200).json(tweet);
    });


});

//To get the count of tweet likes
app.get('/fav_list', function (req, res) {

    client.get('favorites/list', {}, function (error, tweets, response) {
        if (!error) {
            //console.log(tweets);
            let template = {'<>':'div','class':'card','html':[
              {'<>':'p','text':'Created at-     ${created_at}'},
              {'<>':'p','text':'id-      ${id}'},
              {'<>':'p','text':'id_str-      ${id_str}'},
              {'<>':'p','text':'Actual tweet-      ${text}'}
          ]};
            let html = json2html.render(tweets,template)
            res.send(html)
            // return res.status(200).json(tweets);
        } else {
            //console.log("Error ", error);
            return res.status(500).send({error: JSON.stringify(error)});
        }
    });

});

//To search the tweets based on user input
app.get('/searchTweets/:query', function (req, res) {
    var params = req.params.query;
    console.log(params);
    client.get('search/tweets', {q: params}, function(error, tweets, response) {
      if(error){
        console.log(error);
        return res.status(500).send({error : JSON.stringify(error)});
      }
      if (!error) {
        //console.log(tweets.statuses);
        return res.status(200).json(tweets.statuses);
      }
    });
  })

//To get the specific tweet by TweetId
app.get('/tweet', function (req, res) {
      var id = req.query.id;
      console.log(req.query.id);
      client.get('statuses/show/'+ id.toString(), function(error, tweets, response) {
        if(error){
          console.log(error);
          return res.status(500).send({error : JSON.stringify(error)});
        }
        if (!error) {
          let template = {'<>':'div','class':'card','html':[
            {'<>':'p','text':'Created at-     ${created_at}'},
            {'<>':'p','text':'id-      ${id}'},
            {'<>':'p','text':'id_str-      ${id_str}'},
            {'<>':'p','text':'Actual tweet-      ${text}'}
        ]};
          let html = json2html.render(tweets,template)
          res.send(html)
        }
      });
})


//To delete the tweet
app.post('/destroyTweet/:id', function (req, res) {
    const id= req.params.id;
    if (id == null || id == undefined ) {
      return res.status(400).send("Bad Request: Invalid Tweet Id");
    }
    client.post('statuses/destroy/'+ id, function(error, tweets, response) {
      if(error){
        console.log(error);
        return res.status(500).send({error : JSON.stringify(error)});
      }
      if (!error) {
        return res.status(200).json(tweets);
      }
    });
})


 //To Retweet a tweet
 app.post('/retweet/:id', function (req, res) {
    const id= req.params.id;
    client.post('statuses/retweet/'+ id, function(error, tweets, response) {
    if(error){
        console.log(error);
        return res.status(500).send({error : JSON.stringify(error)});
      }
      if (!error) {
        return res.status(200).json(tweets);
      }
    });
})

//To Unretweet a tweet
app.post('/unretweet/:id', function (req, res) {
    const id= req.params.id;
    client.post('statuses/unretweet/'+ id, function(error, tweets, response) {
      if(error){
        console.log(error);
        return res.status(500).send({error : JSON.stringify(error)});
      }
      if (!error) {
        return res.status(200).JSON.stringify(tweets, null, 100)
      }
    });
})

//To get most recent retweets of the tweet specified by id
app.get('/retweets/:id', function (req, res) {
    var retweetid = req.params.id;
    console.log(req.params.id);
    client.get('statuses/retweets', {id:retweetid}, function(error, tweets, response) {
      if(error){
        console.log(error);
        return res.status(500).send({error : JSON.stringify(error)});
      }
      if (!error) {
        //console.log(tweets);
        return res.status(200).json(tweets);
      }
    });
  })



app.listen(3000, function () {
    console.log('Twitter lite running on port 3000');
});

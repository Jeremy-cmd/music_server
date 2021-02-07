var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(express.urlencoded());
app.use(express.json());

var groups = [];

/* Randomize array in-place using Durstenfeld shuffle algorithm */
var shuffle = function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

class Server {
    constructor(host_user, host_tracks) {
        this.users = [host_user];
        this.each_user_tracks = [];
        this.combined_tracks = [];
        this.fill_data(host_user, host_tracks);
        this.server_id = Math.floor(Math.random() * 1000) + 1;
        groups.push(this);
    }

    fill_data(user, data){

        console.log("there should be data here " + JSON.stringify(data));
        var new_user = new User(user);

        data.forEach(function(object){
            //console.log(JSON.stringify(object));
            new_user.uri_list.push({
                'songuri': object.track.uri,
                'songname': object.track.name,
                'artist': object.track.artists[0].name,
                'songowner': user
            });

        });
        this.each_user_tracks.push(new_user);



    }

    join(user, data){
        this.users.push(user);
        this.fill_data(user, data);

    }

    music_joiner(){

        var self = this;

        // go through each user object
        for (let i = 0; i < this.each_user_tracks.length; i++) {
            // go through each track in each uri_list of a user object
            this.each_user_tracks[i].uri_list.forEach(function(track){
                self.combined_tracks.push(track);

            });
            

        }

        shuffle(this.combined_tracks);
        console.log("music_joiner_songs " + JSON.stringify(this.combined_tracks));




    }

}

class User {
    constructor(user){
        this.user = user;
        this.uri_list = [];
    }
}





// http.createServer(function (req, res) {
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.end('Hello World!');
// }).listen(8080);

app.get('/', function(req, res){
    res.end("hello world");
});

app.post('/host', function(req, res){
    var user = req.body.user;
    var data = req.body.data;
    //console.log(user + " " + JSON.stringify(data));

    console.log("the data is " + JSON.stringify(req.body.data[0].track.name));
    var server = new Server(user, data);
    res.json({'serverid': server.server_id});

});

app.post('/join', function(req, res){
    var user = req.body.user;
    var serverid = req.body.serverid;
    var data = req.body.data;
    var success = {'success': 'false'};

    groups.forEach(function(server){
        if(server.server_id == serverid){
            server.join(user, data);
            success = {'success': 'true'};
            res.json(success);
        }
    });

    res.json(success);

});

app.post('/start', function(req, res){
    var serverid = req.body.serverid;
    groups.forEach(function(server){
        if(server.server_id == serverid){
            server.music_joiner();
            console.log("the combined tracks " + JSON.stringify(server.combined_tracks));
            res.json(server.combined_tracks);
        }
    });
    console.log("reaches here");
    res.send("no server");

});

var server = app.listen(process.env.PORT || 5000, function () {
    var port = server.address().port;
    console.log("Express is working on port " + port);
});
var http = require('http');
var fs = require('fs');
var url = require('url');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var title = queryData.id;
    if(_url == '/'){
      title = 'Welcome';
    }
    if(_url == '/favicon.ico'){
      return response.writeHead(404);
    }
    response.writeHead(200);
    fs.readFile(`data/${queryData.id}`, 'utf8', function(err, story){
    var template = `
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
      <script src="colors.js"></script>
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      <input id="night_day" type="button" value="night" onclick="
        nightDayHandler(this);
      ">
      <ul>
        <li><a href="/?id=html">HTML</a></li>
        <li><a href="/?id=css">CSS</a></li>
        <li><a href="/?id=js">JavaScript</a></li>
      </ul>
      <h2>${title}</h2>
      <p>
      ${story}
      </p>
    </body>
    </html>
    `;

    response.end(template);
    console.log(story);
});

});
app.listen(3000);

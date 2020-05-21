var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    
    if (pathname === '/') {
        if (queryData.id === undefined) {

            fs.readdir('./data', function (error, filelist) {
                var title = 'Welcome';
                var description = 'Hello, Node.js';
                var list = template.list(filelist);
                var html = template.html(title, list, description, `<a href="/create">create</a>`);
                response.writeHead(200);
                response.end(html);
            });



        } else {
            fs.readdir('./data', function (error, filelist) {
                var filterId = path.parse(queryData.id).base;
                fs.readFile(`data/${filterId}`, 'utf8', function (err, description) {
                    var title = queryData.id;
                    var list = template.list(filelist);
                    var sanitizedTitle = sanitizeHtml(title);
                    var sanitizedDescription = sanitizeHtml(description);
                    console.log(list);
                    var html = template.html(sanitizedTitle, list, sanitizedDescription,
                        `<a href="/create">create</a> <a href="/update?id=${sanitizedTitle}">update</a>
                         <form action = "delete_process" method = "post">
                            <input type = "hidden" name = "id" value = "${sanitizedTitle}">
                            <input type = "submit" value = "delete">
                        </form>`
                    );
                    console.log(sanitizedTitle);
                    console.log(sanitizedDescription);
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if (pathname === '/create') {
        fs.readdir('./data', function (error, filelist) {
            var title = 'WEB - create';
            var list = template.list(filelist);
            var html = template.html(title, list,
                `<form action="http://localhost:3001/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                        <p>
                            <textarea name="description" placeholder="description"></textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                </form>`
            );
            response.writeHead(200);
            response.end(html);
        });
    } else if (pathname === '/create_process') {
                var body = '';

                request.on('data', function (data) {
                    body += data;
                });

                request.on('end', function () {
                    var post = qs.parse(body);
                    var title = post.title;
                    var description = post.description;
                    fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
                        response.writeHead(302, {Location : `/?id=${title}`});
                        response.end('success');
                        
                    });
                });
    } else if (pathname === '/update') {
        fs.readdir('./data', function (error, filelist) {
            var filterId = path.parse(queryData.id).base;
            fs.readFile(`data/${filterId}`, 'utf8', function (err, description) {
                var title = queryData.id;
                var list = template.list(filelist);
                console.log(list);
                var html = template.html(title, list,
                    `<form action="http://localhost:3001/update_process" method="post">
                    <p><input type="hidden" name="id" value="${title}"></p>
                    <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p>
                            <textarea name="description" placeholder="description">${description}</textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                </form>`

                );
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if (pathname === '/update_process') {
        var body = '';

        request.on('data', function (data) {
            body += data;
        });

        request.on('end', function () {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            var id = post.id;
            console.log(post);
            fs.rename(`data/${id}`, `data/${title}`, function (err) {
                fs.writeFile(`data/${title}`, description,   'utf8', function (err) {
                    response.writeHead(302, { Location: `/?id=${title}` });
                    response.end('success');
                });
            });
        });
    } else if (pathname === '/delete_process') {
        var body = '';

        request.on('data', function (data) {
            body += data;
        });

        request.on('end', function () {
            var post = qs.parse(body);
            var id = post.id;
            console.log(post);
            fs.unlink(`data/${id}`, function (err) {
                response.writeHead(302, { Location: `/` });
                response.end();
            });
        });
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3001);
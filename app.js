var path = require('path'),
    express = require('express'),
    nunjucks = require('nunjucks'),
    favicon = require('serve-favicon'),
    morgan = require('morgan'),
    rfs = require('rotating-file-stream'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),

    routes = require('./routes/index.js'),
    settings = require('./settings'),

    MongoStore = require('connect-mongo')(session),
    uri = `mongodb://${settings.host}:${settings.port}/${settings.db}`,

    logDirectory = path.join(__dirname, 'log'),
    fs = require('fs'),

    app = express();

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
var accessLogStream = rfs('access.log', {
        size: '500M',
        interval: '1d', // rotate daily
        path: logDirectory
    }),
    errorLog = fs.createWriteStream(path.join(logDirectory, 'error.log'), {
        flags: 'a'
    });
app.use(morgan('combined', {
    stream: accessLogStream
}));

app.set('port', process.env.PORT || 2300);
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.use(favicon(path.join(__dirname, 'public', '/default/assets/images/favicon.ico')));
// app.use(logger('dev'));
// app.use(logger('combined', {
//     stream: accessLog
// }));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cookieParser());
//session could save in mongo store, but sometimes it doesn't work
app.use(session({
    secret: settings.cookieSecret,
    key: settings.db, //cookie name
    cookie: {
        maxAge: 1000 * 60 * 60 * 60 * 1
    }, //1 days
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
        url: uri
    })
}));
//app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

routes(app);

//error log in the file
app.use(function (err, req, res, next) {
    // console.log(err);
    var meta = '[' + new Date() + '] ' + req.url + '\n';
    errorLog.write(meta + err.stack + '\n');
    next();
});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

process.on('uncaughtException', function (err) {
    //打印出错误
    // console.log(err);
    //打印出错误的调用栈方便调试
    // console.log(err.stack);

    var meta = '[' + new Date() + '] ' + err.message + '\n';
    errorLog.write(meta + err.stack + '\n');
});
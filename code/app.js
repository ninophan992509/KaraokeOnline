var express = require('express');
var exphbs = require('express-handlebars');
var flash = require('connect-flash');
const path = require('path');
const session = require('express-session');
const hbs_sections = require('express-handlebars-sections');
const restrict = require('./middlewares/auth.mdw');
const bodyParser = require('body-parser');

var app = express();



app.use(express.json());
app.use(express.urlencoded({
extended: true
}));


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    // cookie: {
    //     secure: true
    // }
}))
app.engine('hbs', exphbs({
    defaultLayout: 'main.hbs',
    layoutsDir: 'views/layouts',
    helpers:{
        section: hbs_sections(),
    }
    //helpers: {
      //  section: function (name, options) {
        //    if (!this._sections) this._sections = {};
          //  this._sections[name] = options.fn(this);
            //return null;
        //}
    //},
}));

// for parsing application/json
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
 
// parse application/json

 

app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine', 'hbs');

require('./middlewares/locals.mdw')(app);
require('./middlewares/routes.mdw')(app);


app.get('/', (req, res) => {
    res.render('home')
});



app.listen(3000, () => {
    console.log('server is running at http://localhost:3000')
})
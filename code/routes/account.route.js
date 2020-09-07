const express = require('express');
var bcrypt = require('bcryptjs');
const userModel = require('../models/user_model');
const song_userModel = require('../models/songuser_model');
const restrict = require('../middlewares/auth.mdw');

const multer = require('multer');
var path = require('path');


var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './public/user/'+req.session.authUser.ID)
    },
    filename: async function(req, file, callback) {
        //callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
                //callback(null, file.originalname)
        //rand=Date.now() + path.extname(file.originalname);

        const row = await userModel.single(req.session.authUser.ID);
        
        var im = row[0].image+1;
        var image = im.toString();
        callback(null, "image"+image+".png");
  
    }
  
  })
  var upload = multer({
    storage: storage});

var mkdirp = require('mkdirp');
var path= require('path');
const router = express.Router();
var fs = require('fs');
var util=require('util');
const e = require('express');

function readFiles(dirname, onFileContent, onError) {
    fs.readdir(dirname, function (err, filenames) {
        if (err) {
            onError(err);
            return;
        }

    });
}

router.get('/signup', async (req, res) => {
    res.render('account/signup', {
        layout: false
    });
});
router.post('/signup', async (req, res) => {
    const N = 10;
    const hash = bcrypt.hashSync(req.body.password, N);
    const entity = req.body;
    delete entity.confirm_password;
    const rows = await userModel.all();
    entity.password = hash;
    entity.ID = rows.length + 1;
    entity.image=0;
    const kt1 = await userModel.singleByUsername(entity.username);
    const kt2 = await userModel.singleByMail(entity.email);

    if(kt1!=null){
        return res.render('account/signup', {
            layout: false,
            err_message: 'the same username'
          });
    }

    if(kt2!=null){
        return res.render('account/signup', {
            layout: false,
            err_message: 'the same email'
          });
    }
    const result = await userModel.add(entity);
    var dir = './public/user/' + entity.ID;
    fs.mkdirSync(dir);
    res.redirect('/account/login');
})
router.get('/login', async (req, res) => {
    res.render('account/login', {
        layout: false
    });
})

router.post('/login', async (req, res) => {
    const user = await userModel.singleByUsername(req.body.username);
    if (user === null) {
        return res.render('account/login', {
            layout: false,
            err_message: 'Invalid username '
        });
    }

    const rs = bcrypt.compareSync(req.body.password, user.password);

    if (rs === false)
        return res.render('account/login', {
            layout: false,
            err_message: 'Login failed'
        });

    delete user.password;
    req.session.isAuthenticated = true;
    req.session.authUser = user;
    //res.locals.isAuthenticated = req.session.isAuthenticated;
    //res.locals.authUser = req.session.authUser;

    const url = "/";
   
    res.redirect(url);
})

router.get('/profile', async (req, res) => {

    var data = [];

   var filename  = "l";
     readFiles('./public/user/' + req.session.authUser.ID + '/',  function (filename, content) {

        data.push({
            name: filename,

        });
        console.log("ccccc");
    }, function (err) {
        throw err;
    })
    const user = await song_userModel.single(req.session.authUser.ID);
    const userInfo = await userModel.single(req.session.authUser.ID);
    const image = userInfo[0].image;
   
    // We replaced all the event handlers with a simple call to util.pump()
    
    res.render('./account/profile',{
        userInfo: image,
        u : user
    })

})

router.post('/profile', async (req,res)=>{

    const entity = req.body;
    console.log(req.body);
    const N = 10;
    const hash = bcrypt.hashSync(req.body.pass, N);
    entity.password=hash;
    entity.username = entity.namename;
    delete entity.namename;
    delete entity.pass;
    const rows= await userModel.single(req.session.authUser.ID);
    entity.image = rows[0].image;
    entity.ID=rows[0].ID;
    delete entity.submit;
    const kt1 = await userModel.singleByUsername(entity.username);
    const kt2 = await userModel.singleByMail(entity.email);

    if(kt1!=null){
        return res.render('account/profile', {
            layout: false,
            err_message: 'the same username'
          });
    }

    if(kt2!=null){
        return res.render('account/profile', {
            layout: false,
            err_message: 'the same email'
          });
    }

    

    const result = userModel.patch(entity);
    res.redirect('/account/login');
})

router.post('/profile/image', upload.single('Image'), async (req, res)=>{

    const entity = await userModel.single(req.session.authUser.ID);
    entity[0].image = entity[0].image +1;
    const result = await userModel.patch(entity[0]);
    console.log(result);

    const user = await song_userModel.single(req.session.authUser.ID);
    const userInfo = await userModel.single(req.session.authUser.ID);
    const image = userInfo[0].image;
    
    const url = req.query.retUrl || '/';
   
    res.redirect(url);

})

router.post('/logout', (req, res) => {

    req.session.isAuthenticated = false;
    req.session.authUser = null;
    res.redirect('/');
});

module.exports = router;
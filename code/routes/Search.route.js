const songModel = require('../models/song_model');
const song_userModel = require('../models/songuser_model');
const restrict = require('../middlewares/auth.mdw');
const moment = require('moment');
const express = require('express');
const multer = require('multer');
var path = require('path');
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const { ENGINE_METHOD_PKEY_ASN1_METHS } = require('constants');
var rand;
var storage = multer.diskStorage({
  destination: function(req, file, callback) {
      callback(null, './public/user/'+req.session.authUser.ID)
  },
  filename: function(req, file, callback) {
      //callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
              //callback(null, file.originalname)
      //rand=Date.now() + path.extname(file.originalname);

      callback(null, req.params.id+".mp3");

  }

})
var upload = multer({
  storage: storage});
const router = express.Router();

router.get('/', async (req, res) => {
  
    try {

        res.render('Search')
      } catch (err) {
        console.log(err);
        res.end('View error log in console.');
      }
})
router.get('/sing/:id', async (req, res) => {
  
  try {
    const id=req.params.id;
      res.render('ViDu',{
        id : id
      })
    } catch (err) {
      console.log(err);
      res.end('err');
    }
})

router.post('/sing/:id', upload.single('userFile'),async (req, res)=> {

  
  const en1=new Object();
  const en2=new Object();
  
  en1.id_bai_hat=req.params.id;
  en1.ten_bai_hat='';
  en1.ca_si='';
  en1.the_loai='';
  en1.anh='';
  en1.luot_truy_cap=1;
  en1.ngay=new Date().toISOString().slice(0, 19).replace('T', ' ');
  const row = await songModel.singleByUsername(req.params.id);
  
  en2.id_bai_hat=req.params.id;
  en2.id_nguoi_hat=req.session.authUser.ID;

  if(row===null){
  const result1 = await songModel.add(en1);}
  else{

    const ro=await songModel.singleByUsername(req.params.id);
    en1.luot_truy_cap=ro.luot_truy_cap+1;
    const c = await songModel.patch(en1);
    console.log(c);
  }
  const result2 = await song_userModel.add(en2);
  res.redirect('/account/profile');
})

router.get('/:id', async (req, res) => {
  
  try {
    const id=req.params.id;
      res.render('listSong',{
        id : id
      })
    } catch (err) {
      console.log(err);
      res.end('View error log in console.');
    }
})
module.exports = router;
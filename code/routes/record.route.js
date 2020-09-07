const express = require('express');
const router = express.Router();


router.get('/record-video', async (req, res) => {
     if( req.session.isAuthenticated){
     try {
       res.render('record/recordVideo');
      } catch (err) {
        console.log(err);
        res.end('View error log in console.');
      }
     }else{
       res.redirect('/account/login');
     }

});

router.get('/record-audio', async (req, res) => {
    if( req.session.isAuthenticated){
     try {
        res.render('record/recordAudio');
      } catch (err) {
        console.log(err);
        res.end('View error log in console.');
      }
       }else{
       res.redirect('/account/login');
     }
});

module.exports = router;
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    if( req.session.isAuthenticated){
     try {
        res.render('mediaPlayer');
      } catch (err) {
        console.log(err);
        res.end('View error log in console.');
      }
        }else{
       res.redirect('/account/login');
     }
});


module.exports = router;
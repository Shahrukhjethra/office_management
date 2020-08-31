const express = require ('express');
const {
  create,
  read,
  updateByid,
  deleteByid,
} = require ('../controllers/employee');

const router = express.Router ();

router
  .post ('/', create)
  .get ('/', read)
  .put ('/:id', updateByid)
  .delete ('/:id', deleteByid);

module.exports = router;
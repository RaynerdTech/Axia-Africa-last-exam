// route/user.js
const express = require('express');
const route = express.Router();
const { getUser, /*editUser,*/ deleteUser, updateUserInfo, updatePassword, updateRole } = require('../controllers/users');
const {verify} = require('../middleware/verify')


route.get('/users/:id', getUser);
// route.put('/users/:id', editUser);
route.delete('/users', verify, deleteUser);
route.put('/update', verify, updateUserInfo);
route.put('/password', verify, updatePassword);
route.put('/change-role', verify, updateRole);
//route.put('/change-role', verify, updateRole);


module.exports = route;   
  
//#region imports
const mongoose = require("mongoose");
const express = require("express");
const winston = require("winston/lib/winston/transports");
const { isAdmin, isSuperAdmin } = require("../middleware/authorize");

const { User: UserModel } = require("../models/user");
const UsersController = require("../controllers/usersController");
//#endregion imports

//#region fields
const router = express.Router();
const usersController = new UsersController();
//#endregion fields

//#region endpoints
// get authorized user information --> every logged-in user can see his info
router.get("/me/:id", async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  res.send(user);
});

//list users
router.post("/", isAdmin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // Define the query object based on req.body.roleInDepartment
  const queryObject = {};
  if (req.body.roleInDepartment) {
    queryObject.roleInDepartment = req.body.roleInDepartment;
  }
  if (req.body.role) {
    queryObject.role = req.body.role;
  }
  if (req.body.status) {
    queryObject.status = req.body.status;
  }


  const users = await UserModel.find(queryObject)
    .skip(startIndex)
    .limit(limit);
  const totalUsers = await UserModel.countDocuments(queryObject);
  const totalPages = Math.ceil(totalUsers / limit);

  try {
    res.send({
      users: users,
      totalUsers: totalUsers,
      totalPages: totalPages,
      currentPage: page
    });
  } catch (error) {
    res.status(500).send(error);
  }
});


router.post("/addSPOCs", isAdmin, async (req, res) => {
  try {
    const result = await usersController.addUsersWithRoleInDepartmentOrRole(req.body, "SPOC");
    if (result.success === true) {
      res
        .status(200);
      res
        .send(result.users);
    }
    else
      res.status(400).send("something went wrong");
  } catch (ex) {
    console.log(ex);
    res.status(400).send("something went wrong");
  }
});

router.post("/addManagers", isAdmin, async (req, res) => {
  try {
    const result = await usersController.addUsersWithRoleInDepartmentOrRole(req.body, "Manager");
    if (result.success === true) {
      res
        .status(200);
      res
        .send(result.users);
    }
    else
      res.status(400).send("something went wrong");
  } catch (ex) {
    console.log(ex);
    res.status(400).send("something went wrong");
  }
});

router.post("/addAdmins", isSuperAdmin, async (req, res) => {
  try {
    const result = await usersController.addUsersWithRoleInDepartmentOrRole(req.body, "", "admin");
    if (result.success === true) {
      res
        .status(200);
      res
        .send(result.users);
    }
    else
      res.status(400).send("something went wrong");
  } catch (ex) {
    console.log(ex);
    res.status(400).send("something went wrong");
  }
});

router.post("/edit", isSuperAdmin, async (req, res) => {
  try {
    const result = await usersController.edit(req.body);
    if (result.success === true) {
      res
        .status(200);
      res
        .send(result.userEdited);
    }
    else
      res.status(400).send("something went wrong");
  } catch (ex) {
    console.log(ex);
    res.status(400).send("something went wrong");
  }
});

router.post("/updatestatus", isSuperAdmin, async (req, res) => {
  try {
    const result = await usersController.updatestatus(req.body);
    if (result.success === true) {
      res
        .status(200);
      res
        .send(result.updatedUsers);
    }
    else
      res.status(400).send("something went wrong");
  } catch (ex) {
    console.log(ex);
    res.status(400).send("something went wrong");
  }
});

router.post("/delete", isSuperAdmin, async (req, res) => {
  try {
    const result = await usersController.deleteone(req.body);
    if (result.success === true) {
      res
        .status(200);
      res
        .send(result.userDeleted);
    }
    else
      res.status(400).send("something went wrong");
  } catch (ex) {
    console.log(ex);
    res.status(400).send("something went wrong");
  }
});

router.post("/deleteusers", isSuperAdmin, async (req, res) => {
  try {
    const result = await usersController.deleteusers(req.body);
    if (result.success === true) {
      res
        .status(200);
      res
        .send(result.userDeleted);
    }
    else
      res.status(400).send("something went wrong");
  } catch (ex) {
    console.log(ex);
    res.status(400).send("something went wrong");
  }
});

router.post("/authenticate", async (req, res) => {
  try {
    const result = await usersController.authenticate(req.body.email);
    if (result.success === true) {
      res
        .status(200);
      res
        .send(result.userExists);
    }
    else
      res.status(400).send("something went wrong");
  } catch (ex) {
    console.log(ex);
    res.status(400).send("something went wrong");
  }
});




module.exports = router;
//#endregion endpoints

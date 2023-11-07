//#region imports
const mongoose = require("mongoose");
const express = require("express");
const winston = require("winston/lib/winston/transports");
//const winston = require("winston/lib/winston/config");
const { isAdmin } = require("../middleware/authorize");
const { Department: DepartmentModel } = require("../models/department");
const DepartmentsController = require("../controllers/departmentsController");
//#endregion imports

//#region fields
const router = express.Router();
const departmentsController = new DepartmentsController();
//#endregion fields

//#region endpoints
//list departments
router.post("/", isAdmin, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const departments = await DepartmentModel.find({})
        .skip(startIndex)
        .limit(limit);
    const totalDepartments = await DepartmentModel.countDocuments({});
    const totalPages = Math.ceil(totalDepartments / limit);
    try {
        res.send({
            departments: departments,
            totalDepartments: totalDepartments,
            totalPages: totalPages,
            currentPage: page
        });
    } catch (ex) {
        console.log(ex);
        res.status(500).send(ex);
    }
});


// create new department
router.post("/add", isAdmin, async (req, res) => {
    try {
        const result = await departmentsController.addone(req.body);
        if (result.success === true) {
            res
                .status(200);
            res
                .send({
                    _id: result.departmentNew._id,
                    name: result.departmentNew.name,
                    GSLName: result.departmentNew.GSLName,
                });
        }
        else
            res.status(400).send("something went wrong");
    } catch (ex) {
        console.log(ex);
        res.status(400).send("something went wrong");
    }
});

router.post("/edit", isAdmin, async (req, res) => {
    try {
        const result = await departmentsController.edit(req.body);
        if (result.success === true) {
            res
                .status(200);
            res
                .send(result.departmentEdited);
        }
        else
            res.status(400).send("something went wrong");
    } catch (ex) {
        console.log(ex);
        res.status(400).send("something went wrong");
    }
});

router.post("/delete", isAdmin, async (req, res) => {
    try {
        const result = await departmentsController.deleteone(req.body._id);
        if (result.success === true) {
            res
                .status(200);
            res
                .send(result.departmentDeleted);
        }
        else
            res.status(400).send("something went wrong");
    } catch (ex) {
        console.log(ex);
        res.status(400).send("something went wrong");
    }
});

router.post("/deleteSPOCs", isAdmin, async (req, res) => {
    try {
        const departmentId = req.body.departmentId;
        const SPOCIds = req.body.SPOCIds;
        const result = await departmentsController.deleteDepartmentInfoFromASubsetOfItsUsers(departmentId, SPOCIds);
        if (result.success === true) {
            res
                .status(200);
            res
                .send(result.departmentWithDeletedSPOCs);
        }
        else
            res.status(400).send("something went wrong");
    } catch (ex) {
        console.log(ex);
        res.status(400).send("something went wrong");
    }
});

router.post("/deleteManagers", isAdmin, async (req, res) => {
    try {
        const departmentId = req.body.departmentId;
        const ManagerIds = req.body.ManagerIds;
        const result = await departmentsController.deleteDepartmentInfoFromASubsetOfItsUsers(departmentId, ManagerIds);
        if (result.success === true) {
            res
                .status(200);
            res
                .send(result.departmentWithDeletedManagers);
        }
        else
            res.status(400).send("something went wrong");
    } catch (ex) {
        console.log(ex);
        res.status(400).send("something went wrong");
    }
});

//#endregion endpoints


module.exports = router;

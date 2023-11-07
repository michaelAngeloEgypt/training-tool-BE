//#region imports
const mongoose = require("mongoose");
const express = require("express");
const winston = require("winston/lib/winston/transports");
//const winston = require("winston/lib/winston/config");
const { isAdmin, isAdminOrSPOC, isManager } = require("../middleware/authorize");
const TrainingRequest = require("../models/trainingRequest");
const TrainingRequestsController = require("../controllers/trainingRequestsController");
//#endregion imports


//#region fields
const router = express.Router();
const trainingRequestsController = new TrainingRequestsController();
//#endregion fields

//#region endpoints
router.post("/", isAdminOrSPOC, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const queryObject = {};
    if (req.body.isAdmin) {
        queryObject.status = 'approved-SPOC';
    } else {
        if (req.body.status) {
            queryObject.status = { $regex: `^${req.body.status}` };
        }
    }
    if (req.body.requestType) {
        queryObject.requestType = req.body.requestType;
    }
    if (req.body.createdOnDateFrom) {
        queryObject.createdon = { $gte: req.body.createdOnDateFrom };
    }
    if (req.body.createdOnDateTo) {
        queryObject.createdon = { $lte: req.body.createdOnDateTo };
    }

    const trainingRequests = await TrainingRequest
        .find(queryObject)
        .skip(startIndex)
        .limit(limit);
    const totalRequests = await TrainingRequest.countDocuments(queryObject);
    const totalPages = Math.ceil(totalRequests / limit);

    try {
        res.send({
            trainingRequests: trainingRequests,
            totalRequests: totalRequests,
            totalPages: totalPages,
            currentPage: page
        });
    } catch (ex) {
        console.log(ex);
        res.status(500).send(ex);
    }
});


router.get("/:id", async (req, res) => {
    const trainingRequest = await TrainingRequest.findById(req.params.id);
    res.send(trainingRequest);
});


router.post("/addstandard", isAdmin, (req, res) => trainingRequestsController.addEndpointCodeBehind(req, res));

router.post("/addadhoc", isAdmin, (req, res) => trainingRequestsController.addEndpointCodeBehind(req, res, "adhoc"));

router.post("/edit", isAdmin, async (req, res) => {
    try {
        const result = await trainingRequestsController.edit(req.body);
        if (result.success === true) {
            res
                .status(200)
                .send(result.trainingRequestEdited);
        }
        else
            res.status(400).send("something went wrong");
    } catch (ex) {
        console.log(ex);
        res.status(400).send("something went wrong");
    }
});

router.post("/updatestatus", isAdmin, async (req, res) => {
    try {
        const result = await trainingRequestsController.updatestatus(req.body);
        if (result.success === true) {
            res
                .status(200);
            res
                .send(result.updatedRequests);
        }
        else
            res.status(400).send("something went wrong");
    } catch (ex) {
        console.log(ex);
        res.status(400).send("something went wrong");
    }
});



router.post("/approve", isAdminOrSPOC, (req, res) => trainingRequestsController.handleApproveOrReject(req, res, true));

router.post("/reject", isAdminOrSPOC, (req, res) => trainingRequestsController.handleApproveOrReject(req, res, false));


router.post("/delete", isAdmin, async (req, res) => {
    try {
        const result = await trainingRequestsController.deleteone(req.body._id);
        if (result.success === true) {
            res
                .status(200);
            res
                .send(result.trainingRequestDeleted);
        }
        else
            res.status(400).send("something went wrong");
    } catch (ex) {
        console.log(ex);
        res.status(400).send("something went wrong");
    }
});

router.post("/setcycle", isAdmin, async (req, res) => {
    try {
        const result = await trainingRequestsController.setcycle(req.body);
        if (result.success === true) {
            res
                .status(200);
            res
                .send(result.cycleData);
        }
        else
            res.status(400).send("something went wrong");
    } catch (ex) {
        console.log(ex);
        res.status(400).send("something went wrong");
    }
});

router.post("/IsTodayValidForStandardTrainingRequest", isManager, async (req, res) => {
    try {
        const result = await trainingRequestsController.IsTodayValidForStandardTrainingRequest();
        if (result.success === true) {
            res
                .status(200);
            res
                .send(result);
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

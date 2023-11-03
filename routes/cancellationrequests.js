//#region imports
const mongoose = require("mongoose");
const express = require("express");
const winston = require("winston/lib/winston/transports");
//const winston = require("winston/lib/winston/config");
const { isAdmin, isAdminOrSPOC } = require("../middleware/authorize");
const CancellationRequest = require("../models/cancellationRequest");
const CancellationRequestsController = require("../controllers/cancellationRequestsController");
//#endregion imports


//#region fields
const router = express.Router();
const cancellationRequestsController = new CancellationRequestsController();
//#endregion fields


//#region endpoints
//list trainingRequests
router.post("/", isAdmin, async (req, res) => {
    const queryObject = {};
    if (req.body.status) {
        queryObject.status = { $regex: `^${req.body.status}` };
    }

    const cancellationRequests = await CancellationRequest
        .find(queryObject)
        .populate('originalRequestId', 'GSLName trainingName')
    try {
        res.send(cancellationRequests);
    } catch (ex) {
        console.log(ex);
        res.status(500).send(ex);
    }
});


router.get("/:id", async (req, res) => {
    const cancellationRequest = await CancellationRequest.findById(req.params.id);
    res.send(cancellationRequest);
});

router.post("/add", isAdmin, async (req, res) => {
    try {
        console.log(req.body)
        let loggerMail = req.headers['loggerMail'.toLowerCase()];
        if (!loggerMail) {
            loggerMail = req.body.loggerMail;
        }

        const result = await cancellationRequestsController.addone(req.body, loggerMail);
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

router.post("/edit", isAdmin, async (req, res) => {
    try {
        const result = await cancellationRequestsController.edit(req.body);
        if (result.success === true) {
            res
                .status(200)
                .send(result.cancellationRequestEdited);
        }
        else
            res.status(400).send("something went wrong");
    } catch (ex) {
        console.log(ex);
        res.status(400).send("something went wrong");
    }
});

async function handleApproveOrReject(req, res, doApprove) {
    try {
        const result = await cancellationRequestsController.approveOrReject(req.body, doApprove);
        if (result.success === true) {
            res
                .status(200)
                .send(result.approvedOrRejectedRequest);
        }
        else
            res.status(400).send("something went wrong");
    } catch (ex) {
        console.log(ex);
        res.status(400).send("something went wrong");
    }
}

router.post("/approve", isAdminOrSPOC, (req, res) => handleApproveOrReject(req, res, true));

router.post("/reject", isAdminOrSPOC, (req, res) => handleApproveOrReject(req, res, false));

router.post("/delete", isAdmin, async (req, res) => {
    try {
        const result = await cancellationRequestsController.deleteone(req.body._id);
        if (result.success === true) {
            res
                .status(200);
            res
                .send(result.cancellationRequestDeleted);
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

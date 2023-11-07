const TrainingRequest = require("../models/trainingRequest");
const SubmissionCycle = require("../models/submissionCycle");

class TrainingRequestController {

    async addone(trainingRequestDto, loggerMail) {
        try {
            // let trainingRequestExisting = await TrainingRequest.findOne({ GSLName: trainingRequestDto.GSLName });
            // console.log(trainingRequestExisting);
            // if (trainingRequestExisting) throw new Error("trainingRequest already exists");

            trainingRequestDto.mangerName = loggerMail;
            let trainingRequestNew = new TrainingRequest(trainingRequestDto);
            await trainingRequestNew.save();
            return { result: trainingRequestNew, success: true };
        } catch (error) {
            console.log(error);
            return { success: false };
        }
    }

    async edit(trainingRequestUpdateDto) {
        try {
            let trainingRequestEdited = await TrainingRequest.findById(trainingRequestUpdateDto.Id);

            let updateFields = {};
            if (trainingRequestUpdateDto.costcenter) updateFields.costcenter = trainingRequestUpdateDto.costcenter;
            if (trainingRequestUpdateDto.GSLName) updateFields.GSLName = trainingRequestUpdateDto.GSLName;
            if (trainingRequestUpdateDto.trainingUrl) updateFields.trainingUrl = trainingRequestUpdateDto.trainingUrl;
            if (trainingRequestUpdateDto.ceretfication) updateFields.ceretfication = trainingRequestUpdateDto.ceretfication;
            if (trainingRequestUpdateDto.labrequired) updateFields.labrequired = trainingRequestUpdateDto.labrequired;
            if (trainingRequestUpdateDto.noparticipants) updateFields.noparticipants = trainingRequestUpdateDto.noparticipants;
            if (trainingRequestUpdateDto.trainingDays) updateFields.trainingDays = trainingRequestUpdateDto.trainingDays;
            if (trainingRequestUpdateDto.priority) updateFields.priority = trainingRequestUpdateDto.priority;
            if (trainingRequestUpdateDto.proficiencylevel) updateFields.proficiencylevel = trainingRequestUpdateDto.proficiencylevel;
            if (trainingRequestUpdateDto.skillscategory) updateFields.skillscategory = trainingRequestUpdateDto.skillscategory;
            if (trainingRequestUpdateDto.trainingtype) updateFields.trainingtype = trainingRequestUpdateDto.trainingtype;
            if (trainingRequestUpdateDto.businessjustification) updateFields.businessjustification = trainingRequestUpdateDto.businessjustification;
            if (trainingRequestUpdateDto.deliverytype) updateFields.deliverytype = trainingRequestUpdateDto.deliverytype;
            if (trainingRequestUpdateDto.quarter) updateFields.quarter = trainingRequestUpdateDto.quarter;
            if (trainingRequestUpdateDto.status) updateFields.status = trainingRequestUpdateDto.status;

            Object.assign(trainingRequestEdited, updateFields);
            await trainingRequestEdited.save();
            trainingRequestEdited = await TrainingRequest.findById(trainingRequestUpdateDto.id);
            return { trainingRequestEdited, success: true };
        } catch (ex) {
            console.log(ex);
            return { success: false };
        }
    }

    async approveOrReject(approveOrRejectRequestDto, approveOrReject) {
        try {
            let approvedOrRejectedRequest = await TrainingRequest.findById(approveOrRejectRequestDto.id);

            let loggerRole = this.getLoggerRole(approveOrRejectRequestDto);
            let prefix = approveOrReject === true ? "approved" : "rejected";
            approvedOrRejectedRequest.status = `${prefix}-${loggerRole}`
            await approvedOrRejectedRequest.save();
            approvedOrRejectedRequest = await TrainingRequest.findById(approveOrRejectRequestDto.id);

            return { approvedOrRejectedRequest: approvedOrRejectedRequest, success: true };
        }
        catch (ex) {
            console.log(ex);
            return { success: false };
        }
    }

    getLoggerRole(postRequestBody) {
        let loggerRole = "";
        if (postRequestBody.isAdmin)
            loggerRole = 'admin';
        else if (postRequestBody.isSPOC)
            loggerRole = 'SPOC';
        return loggerRole;
    }


    async updatestatus(trainingRequestStatusDto) {
        try {
            const results = [];
            let loggerRole = this.getLoggerRole(trainingRequestStatusDto);
            for (const trainingRequestId of trainingRequestStatusDto.requestIds) {
                try {
                    let trainingRequest = await TrainingRequest.findById(trainingRequestId);
                    const trainingRequestResult = await TrainingRequest.updateOne(
                        { _id: trainingRequestId },
                        {
                            $set: {
                                status: `${trainingRequestStatusDto.newStatus}-${loggerRole}`
                            }
                        }
                    );
                    if (trainingRequestResult.acknowledged === true) {
                        trainingRequest = await TrainingRequest.findById(trainingRequestId);
                        results.push(trainingRequest);
                    }
                } catch (error) {
                    console.log(error);
                    return false;
                }
            }

            return { updatedRequests: results, success: true };
        } catch (ex) {
            console.log(ex);
            return { success: false };
        }
    }

    async deleteone(id) {
        try {
            let trainingRequestDeleted = await TrainingRequest.deleteOne({ _id: id });
            return { trainingRequestDeleted, success: true };
        }
        catch (ex) {
            //logger.error(ex)
            console.log(ex);
            return { success: false };
        }
    }

    async setcycle(cycleDto) {
        try {
            let cycleStart = new Date(cycleDto.CycleStart);
            let cycleEnd = new Date(cycleDto.CycleEnd);

            cycleStart.setHours(0, 0, 0, 0);
            cycleEnd.setHours(0, 0, 0, 0);

            if (cycleEnd < cycleStart) {
                throw new Error("cycleEnd date cannot be less than cycleStart date");
            }

            let cycleData = await SubmissionCycle.findOneAndUpdate({},
                {
                    $set: {
                        CycleStart: cycleDto.CycleStart,
                        CycleEnd: cycleDto.CycleEnd
                    }
                },
                {
                    new: true,  // return the updated document
                    upsert: true  // create the document if it doesn't exist
                }
            );
            return { cycleData, success: true };
        }
        catch (ex) {
            console.log(ex);
            return { success: false };
        }
    }

    async IsTodayValidForStandardTrainingRequest() {
        try {
            let cycleData = await SubmissionCycle.findOne();
            if (!cycleData) {
                throw new Error("The request cycle info has not been set. Please set it first.");
            }
            let today = new Date();
            today.setHours(0, 0, 0, 0);
            let isWithinCycle = (today >= cycleData.CycleStart && today <= cycleData.CycleEnd);
            return { isWithinCycle, success: true };
        }
        catch (ex) {
            //logger.error(ex)
            console.log(ex);
            return { success: false };
        }
    }


    async handleApproveOrReject(req, res, doApprove) {
        try {
            const result = await this.approveOrReject(req.body, doApprove);
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

    async addEndpointCodeBehind(req, res, requestType = null) {
        try {
            if (requestType) req.body.requestType = requestType;
            console.log(req.body)
            let loggerMail = req.headers['loggerMail'.toLowerCase()];
            if (!loggerMail) {
                loggerMail = req.body.loggerMail;
            }

            const result = await this.addone(req.body, loggerMail);
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
    }
}

module.exports = TrainingRequestController;
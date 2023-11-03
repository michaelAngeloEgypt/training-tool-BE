const CancellationRequest = require("../models/cancellationRequest");
const TrainingRequest = require("../models/trainingRequest");

class CancellationRequestController {

    async addone(cancellationRequestDto, loggerMail) {
        try {
            cancellationRequestDto.mangerName = loggerMail;
            let cancellationRequestNew = new CancellationRequest(cancellationRequestDto);
            await cancellationRequestNew.save();
            return { result: cancellationRequestNew, success: true };
        } catch (error) {
            console.log(error);
            return { success: false };
        }
    }

    async edit(cancellationRequestUpdateDto) {
        try {
            let cancellationRequestEdited = await CancellationRequest.findById(cancellationRequestUpdateDto.Id);

            let updateFields = {};
            if (cancellationRequestUpdateDto.cancellationReason) updateFields.cancellationReason = cancellationRequestUpdateDto.cancellationReason;
            if (cancellationRequestUpdateDto.status) updateFields.status = cancellationRequestUpdateDto.status;

            Object.assign(cancellationRequestEdited, updateFields);
            await cancellationRequestEdited.save();
            cancellationRequestEdited = await CancellationRequest.findById(cancellationRequestUpdateDto.id);
            return { cancellationRequestEdited: cancellationRequestEdited, success: true };
        } catch (ex) {
            console.log(ex);
            return { success: false };
        }
    }

    async approveOrReject(approveOrRejectCancellationRequestDto, approveOrReject) {
        try {
            let approvedOrRejectedRequest = await CancellationRequest.findById(approveOrRejectCancellationRequestDto.id);
            let originalRequest = await TrainingRequest.findById(approveOrRejectCancellationRequestDto.id);

            let loggerRole = "";
            if (approveOrRejectCancellationRequestDto.isAdmin)
                loggerRole = 'admin';

            let prefixForCancellationRequest = approveOrReject === true ? "approved" : "rejected";
            approvedOrRejectedRequest.status = `${prefixForCancellationRequest}-${loggerRole}`
            await approvedOrRejectedRequest.save();

            if (approveOrReject === true) {
                originalRequest.status = `cancelled-${loggerRole}`
                await approvedOrRejectedRequest.save();
            }

            approvedOrRejectedRequest = await CancellationRequest.findById(approveOrRejectCancellationRequestDto.id);

            return { approvedOrRejectedRequest: approvedOrRejectedRequest, success: true };
        }
        catch (ex) {
            console.log(ex);
            return { success: false };
        }
    }

    async deleteone(id) {
        try {
            await this.deletetrainingRequestInfoFromItsUsers(id);
            let cancellationRequestDeleted = await CancellationRequest.deleteOne({ _id: id });
            return { cancellationRequestDeleted: cancellationRequestDeleted, success: true };
        }
        catch (ex) {
            //logger.error(ex)
            console.log(ex);
            return { success: false };
        }
    }
}

module.exports = CancellationRequestController;
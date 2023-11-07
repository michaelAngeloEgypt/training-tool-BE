const mongoose = require('mongoose');

const cancellationRequestSchema = new mongoose.Schema({
    originalRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TrainingRequest", // Reference the TrainingRequest model
        required: true
    },
    cancellationReason: String,
    mangerName: String,        //the manager who requested the cancellation, he might be a different manager than the manager who created the request
    status: String,
    createdon: { type: Date, default: Date.now },
    // Reference to TrainingRequest for GSLName and trainingName
    GSLName: String,
    trainingName: String,
}, { strictPopulate: false });

const CancellationRequest = new mongoose.model("CancellationRequest", cancellationRequestSchema);
module.exports = CancellationRequest;

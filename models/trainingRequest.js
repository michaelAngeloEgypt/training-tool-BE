const mongoose = require('mongoose');

const trainingRequestSchema = new mongoose.Schema({
    requestType: { type: String, default: "standard" },
    costcenter: String,
    GSLName: String,
    mangerName: String,
    trainingName: String,
    trainingUrl: String,
    ceretfication: Boolean,
    labrequired: Boolean,
    noparticipants: Number,
    trainingDays: Number,
    priority: String,
    proficiencylevel: String,
    skillscategory: String,
    trainingtype: String,
    businessjustification: String,
    deliverytype: String,
    quarter: String,
    status: { type: String, default: "new" },
    createdon: { type: Date, default: Date.now },
    startDate: { type: Date },
    endDate: { type: Date },
});

const TrainingRequest = new mongoose.model("TrainingRequest", trainingRequestSchema);
module.exports = TrainingRequest;

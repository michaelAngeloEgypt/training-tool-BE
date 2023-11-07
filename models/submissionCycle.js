const mongoose = require('mongoose');

const submissionCycleSchema = new mongoose.Schema({
    CycleStart: { type: Date },
    CycleEnd: { type: Date }
});

const SubmissionCycle = new mongoose.model("SubmissionCycle", submissionCycleSchema);
module.exports = SubmissionCycle;

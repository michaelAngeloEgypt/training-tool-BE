const config = require("config");
const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
    },
    GSLName: {
        type: String,
        required: false,
        minlength: 5,
        maxlength: 150,
    },
});

const Department = new mongoose.model("Department", departmentSchema);
exports.Department = Department;

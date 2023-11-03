const { checkRole } = require("./checkRole");
const isSPOC = async (req, res, next) => {
    return checkRole(req, res, next, "SPOC");
};

const isManager = async (req, res, next) => {
    return checkRole(req, res, next, "Manager");
};
const isAdmin = async (req, res, next) => {
    return checkRole(req, res, next, "admin");
};

const isSuperAdmin = async (req, res, next) => {
    return checkRole(req, res, next, "superAdmin");
};

const isAdminOrSPOC = async (req, res, next) => {
    return checkRole(req, res, next, ["admin", "SPOC"]);
};

exports.isAdmin = isAdmin;
exports.isSuperAdmin = isSuperAdmin;
exports.isAdminOrSPOC = isAdminOrSPOC;
exports.isSPOC = isSPOC;
exports.isManager = isManager;
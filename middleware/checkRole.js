const { User: UserModel } = require("../models/user");

const checkRole = async (req, res, next, roles) => {
    // Check if roles is not an array. If it's a string, create an array with roles as the only element
    if (!Array.isArray(roles)) {
        roles = [roles];
    }

    let loggerMail = req.headers['loggerMail'.toLowerCase()];
    if (!loggerMail) {
        loggerMail = req.body.loggerMail;
    }

    if (loggerMail) {
        let userToAuthorize = await UserModel.findOne({
            email: loggerMail,
        });

        if (userToAuthorize === null) {
            res.status(401).send("Non-existing user");
        }
        else if (!roles.includes(userToAuthorize.role) &&
            !roles.includes(userToAuthorize.roleInDepartment))
            res.status(401).send("Unauthorized user");
        else {
            let finalRole = userToAuthorize.role != 'user' && userToAuthorize.role != ''
                ? userToAuthorize.role : userToAuthorize.roleInDepartment;
            switch (finalRole) {
                case 'admin':
                    req.body.isAdmin = true;
                    break;
                case 'superAdmin':
                    req.body.superAdmin = true;
                    break;
                case 'SPOC':
                    req.body.isSPOC = true;
                    break;
                case 'Manager':
                    req.body.isManager = true;
                    break;
                default:
                    break;
            }
            next();
        }
    }
    else {
        return res.status(400).send("Missing loggerMail both from request header and from request body.");
    }
};
exports.checkRole = checkRole;

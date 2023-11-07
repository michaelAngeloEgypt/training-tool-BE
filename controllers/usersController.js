const { error } = require("winston");
const bcrypt = require("bcrypt");
const { User: UserModel, validate } = require("../models/user");
const DepartmentsController = require('./departmentsController');

const departmentsController = new DepartmentsController();

class UsersController {

    constructor() { }


    async authenticate(email) {
        try {
            let userExists = await UserModel.findOne({ email: email });
            if (userExists)
                //UserModel.GenerateToken
                return { userExists, success: true };
            else
                ;
            //401
        }
        catch (ex) {
            console.log(ex);
            return { success: false };
        }
    }

    async add(userDto) {
        try {
            // validate the request by JOI
            const { error } = validate(userDto);
            if (error) throw error;

            // validate if the user already register
            let userExisting = await UserModel.findOne({ email: userDto.email });
            if (userExisting) throw new Error("User already registered");
            console.log(userDto);

            let insertFields = {};
            if (userDto.name) insertFields.name = userDto.name;
            if (userDto.email) insertFields.email = userDto.email;
            if (userDto.status) insertFields.status = userDto.status;
            else
                insertFields.status = "active";
            if (userDto.role) insertFields.role = userDto.role;
            else
                insertFields.role = "user";

            if (userDto.roleInDepartment) insertFields.roleInDepartment = userDto.roleInDepartment;

            // Add department if not there
            if (userDto.departmentName) {
                try {
                    let departmentId = await departmentsController.addoneOrGetExistingId(userDto.departmentName);
                    insertFields.departmentId = departmentId;
                } catch (error) {
                    throw error;
                }
            }

            // save the user in the database
            let userAdded = new UserModel(insertFields);
            await userAdded.save();
            console.log(userAdded);
            return userAdded;

        } catch (error) {
            console.log(error);
            //winston.Console(error);
        }
    }

    async addUsersWithRoleInDepartmentOrRole(usersDtos, roleInDepartment, role) {
        try {
            const results = [];
            for (const userDto of usersDtos) {
                try {
                    if (roleInDepartment)
                        userDto.roleInDepartment = roleInDepartment;
                    if (role)
                        userDto.role = role;
                    const result = await this.add(userDto);
                    results.push(JSON.stringify(result));
                } catch (error) {
                    console.log(error);
                    return false;
                }
            }
            return { users: results, success: true };
        } catch (error) {
            console.log(error);
            return { success: false };
        }
    }


    async edit(user) {
        try {
            const userExisting = await UserModel.findById(user.id);
            if (!userExisting) throw new Error('User not found');

            await UserModel.updateOne(
                { _id: user.id },
                { name: user.name, status: user.status, departmentId: user.departmentId, roleInDepartment: user.roleInDepartment, role: user.role }
            );
            let userEdited = await UserModel.findById(user.id);
            return { userEdited: userEdited, success: true };
        } catch (ex) {
            console.log(ex);
            return { success: false };
        }
    }

    async updatestatus(userStatusDto) {
        try {
            const results = [];
            for (const userId of userStatusDto.userIds) {
                try {
                    let user = await UserModel.findById(userId);
                    const userUpdateResult = await UserModel.updateOne(
                        { _id: userId },
                        { $set: { status: userStatusDto.newStatus } }
                    );
                    if (userUpdateResult.acknowledged === true) {
                        user = await UserModel.findById(userId);
                        results.push(user);
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
            let userDeleted = await UserModel.deleteOne({ _id: id });
            return { userDeleted, success: true };
        }
        catch (ex) {
            console.log(ex);
            return { success: false };
        }
    }

    async deleteusers(userIdsToDelete) {
        try {
            const results = [];
            for (const id of userIdsToDelete) {
                try {
                    const userDeleteResult = await UserModel.deleteOne(
                        { _id: id }
                    );
                    if (userDeleteResult.acknowledged === true) {
                        results.push(id);
                    }
                } catch (error) {
                    console.log(error);
                    return false;
                }
            }

            return { deletedUsers: results, success: true };
        } catch (ex) {
            console.log(ex);
            return { success: false };
        }
    }
}

module.exports = UsersController;

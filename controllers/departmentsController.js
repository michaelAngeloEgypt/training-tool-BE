const { error } = require("winston");
const { Department: DepartmentModel } = require("../models/department");
const { User: UserModel } = require("../models/user");

class DepartmentsController {
    async addoneOrGetExistingId(departmentName) {
        let departmentNameNoSpaces = departmentName.replace(/\s/g, '').toLowerCase();
        let departments = await DepartmentModel.find();
        let departmentExisting = departments.find(dept => dept.name.replace(/\s/g, '').toLowerCase() === departmentNameNoSpaces);
        let insertFields = {};
        if (departmentExisting)
            return departmentExisting.id;
        else {
            insertFields.name = departmentExisting.name;
            let departmentNew = new DepartmentModel(insertFields);
            await departmentNew.save();
            return departmentNew.id;
        }
    }

    async addone(departmentDto) {
        try {
            let departmentExisting = await DepartmentModel.findOne({ name: departmentDto.name });
            if (departmentExisting) throw new Error("Department already exists");

            let insertFields = {};
            if (departmentDto.name) insertFields.name = departmentDto.name;
            if (departmentDto.GSLName) insertFields.GSLName = departmentDto.GSLName;

            if (departmentDto.SPOCs) {
                let SPOCsExistOrAreEmpty = await this.validateUsersExist(departmentDto.SPOCs);
                let SPOCsAreNotAssignedToOtherDepartmentsOrAreEmpty = await this.validateUsersAreNotAssignedToOtherDepartmentsOrAreEmpty(departmentDto.SPOCs, null);
                if (SPOCsExistOrAreEmpty === true && SPOCsAreNotAssignedToOtherDepartmentsOrAreEmpty === true);
                else
                    return { success: false };
            }

            if (departmentDto.Managers) {
                let ManagersExistOrAreEmpty = await this.validateUsersExist(departmentDto.Managers);
                let ManagersAreNotAssignedToOtherDepartmentsOrAreEmpty = await this.validateUsersAreNotAssignedToOtherDepartmentsOrAreEmpty(departmentDto.Managers, null);
                if (ManagersExistOrAreEmpty === true && ManagersAreNotAssignedToOtherDepartmentsOrAreEmpty === true);
                else
                    return { success: false };
            }

            let departmentNew = new DepartmentModel(insertFields);
            await departmentNew.save();
            if (departmentDto.SPOCs)
                await this.assignDepartmentToSPOCs(departmentNew._id, departmentDto.SPOCs);
            if (departmentDto.Managers)
                await this.assignDepartmentToManagers(departmentNew._id, departmentDto.Managers);
            return { departmentNew, success: true };
        } catch (error) {
            console.log(error);
            return { success: false };
        }
    }

    async edit(departmentDto) {
        try {
            const departmentExisting = await DepartmentModel.findById(departmentDto.id);
            if (!departmentExisting) throw new Error('Department not found');

            let updateFieldsLocal = {};
            if (departmentDto.name) updateFieldsLocal.name = departmentDto.name;
            if (departmentDto.GSLName) updateFieldsLocal.GSLName = departmentDto.GSLName;
            if (Object.keys(updateFieldsLocal).length > 0) {
                await DepartmentModel.updateOne(
                    { _id: departmentDto.id },
                    updateFieldsLocal
                );
            }

            if (departmentDto.SPOCs) {
                let SPOCsExistOrAreEmpty = await this.validateUsersExist(departmentDto.SPOCs);
                let SPOCsAreNotAssignedToOtherDepartmentsOrAreEmpty = await this.validateUsersAreNotAssignedToOtherDepartmentsOrAreEmpty(departmentDto.SPOCs, departmentDto.id);
                if (SPOCsExistOrAreEmpty === true && SPOCsAreNotAssignedToOtherDepartmentsOrAreEmpty === true) {
                    if (departmentDto.SPOCs.length > 0) {
                        await this.assignDepartmentToSPOCs(departmentDto.id, departmentDto.SPOCs)
                    }
                }
                else
                    return { success: false };
            }



            if (departmentDto.Managers) {
                let ManagersExistOrAreEmpty = await this.validateUsersExist(departmentDto.Managers);
                let ManagersAreNotAssignedToOtherDepartmentsOrAreEmpty = await this.validateUsersAreNotAssignedToOtherDepartmentsOrAreEmpty(departmentDto.Managers, departmentDto.id);
                if (ManagersExistOrAreEmpty === true && ManagersAreNotAssignedToOtherDepartmentsOrAreEmpty === true) {
                    if (departmentDto.Managers.length > 0) {
                        await this.assignDepartmentToManagers(departmentDto.id, departmentDto.Managers)
                    }
                }
                else
                    return { success: false };
            }


            let departmentEdited = await DepartmentModel.findById(departmentDto.id);
            return { departmentEdited, success: true };
        } catch (ex) {
            console.log(ex);
            return { success: false };
        }
    }

    async deleteone(id) {
        try {
            await this.deleteDepartmentInfoFromItsUsers(id);
            let departmentDeleted = await DepartmentModel.deleteOne({ _id: id });
            return { departmentDeleted, success: true };
        }
        catch (ex) {
            //logger.error(ex)
            console.log(ex);
            return { success: false };
        }
    }

    async deleteDepartmentInfoFromASubsetOfItsUsers(departmentId, UserIdsToDeleteThisDepartmentFrom) {
        try {
            let users = await UserModel.find({
                departmentId: departmentId,
                _id: { $in: UserIdsToDeleteThisDepartmentFrom }
            });
            for (const user of users) {
                await this.deleteDepartmentInfoFromUser(user.id);
            }

            return { success: true };
        } catch (ex) {
            //logger.error(ex)
            console.log(ex);
            return { success: false };
        }
    }



    async validateUsersExist(userIds) {
        try {
            if (userIds.length > 0) {
                for (const userId of userIds) {
                    let userExists = await UserModel.findOne({ _id: userId });
                    if (userExists === null)
                        throw new Error(`User does not exist with id: ${userId}`);
                }
                return true;
            }
            else
                return true;
        } catch (error) {
            console.log(`Error occurred while validating Users: `, departmentSPOCs);
            throw error;
        }
    }


    async validateUsersAreNotAssignedToOtherDepartmentsOrAreEmpty(userIds, departmentId) {
        try {
            if (userIds.length > 0) {
                //validate that no users are already assigned as SPOCs/admins to other departments
                for (const userId of userIds) {
                    try {
                        let userWithId = await UserModel.findOne({ _id: userId });
                        if (userWithId.departmentId != null && userWithId.departmentId != departmentId)
                            throw new Error(`User ${userWithId._id} is already assigned to another department.`);
                    } catch (error) {
                        console.log(error);
                        return false;
                    }
                }
                return true;
            }
            else
                return true;
        } catch (error) {
            console.log(`Error occurred while validating SPOCs/Admins for department ${departmentId}:`, userIds);
            throw error;
        }
    }


    async assignDepartmentToSPOCs(departmentId, SPOCs) {
        await this.assignDepartmentToUsers(departmentId, SPOCs, "SPOC")
    }

    async assignDepartmentToManagers(departmentId, Managers) {
        await this.assignDepartmentToUsers(departmentId, Managers, "Manager")
    }

    async assignDepartmentToUsers(departmentId, targetUsersCollection, roleInDepartment) {
        for (const userId of targetUsersCollection) {
            let existingUser = await UserModel.findOne({ _id: userId });
            existingUser.departmentId = departmentId;
            existingUser.roleInDepartment = roleInDepartment;
            existingUser.save();
        }
    }

    async deleteDepartmentInfoFromItsUsers(departmentId) {
        let users = await UserModel.find({ departmentId: departmentId });
        for (const user of users) {
            await this.deleteDepartmentInfoFromUser(user.id);
        }
    }

    async deleteDepartmentInfoFromUser(userId) {
        await UserModel.updateOne(
            { _id: userId },
            { $unset: { departmentId: 1, roleInDepartment: 1 } }
        );
    }
}

module.exports = DepartmentsController;
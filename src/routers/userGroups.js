const express = require('express')
const validator = require('validator')
const userGroupsDB = require('../db/userGroupsDB')
const usersDB = require('../db/usersDB')
//const associationsDB = require('../db/associationsDB')
const associationsDB = require('../dummy/treeAssociationDB')
const activityRBACDB = require('../db/roleBasedActivitiesDB')
const router = new express.Router()

/************ User Groups API's ******************/
router.get('/getUserGroups', async (req, res) => {
    try{
        const result = await userGroupsDB.getUserGroups()
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.post('/getUserGroups', async (req, res) => {
    try{
        const { userRole, userEmailID  } = req.body
        const data = { userRole, userEmailID }
        const result = await userGroupsDB.getAllUserGroupsByRole(data)
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.post('/getAllUserGroupsNotAssociatedForCurrentEntity', async (req, res) => {
    try{
        const { entityID, entityName, entityType } = req.body
        const data = { entityID, entityName, entityType }
        const result = await userGroupsDB.getAllUserGroupsNotAssociatedForCurrentEntity(data)
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getUserGroupsByID', async (req, res) => {
    try {
        const id = req.query.id

        req.checkQuery("id", "Please provide valid 'id' value ").notEmpty().isNumeric()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const result = await userGroupsDB.getUserGroupsByID(id)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.get('/getUserGroupByUserGroupName', async (req, res) => {
    try {
        const userGroupName = req.query.userGroupName

        req.checkQuery("userGroupName", "Please provide valid 'userGroupName' value ").notEmpty().isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const result = await userGroupsDB.getUserGroupByUserGroupName(userGroupName)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.get('/getUserGroupsByAppID', async (req, res) => {
    try {
        const appID = req.query.appID

        req.checkQuery("appID", "Please provide valid 'appID' value ").notEmpty().isNumeric()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const result = await userGroupsDB.getUserGroupsByAppID(appID)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/createUserGroups', async (req, res) => {
    try {
        const { userGroupName, createdBy } = req.body

        req.checkBody("userGroupName", "Please provide valid 'name' value should be min 1 and max 100 chars long").notEmpty().isLength({ min: 1, max: 100 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("createdBy", "Please provide valid 'createdBy' value should be min 1 and max 100 chars long.").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_@.\s]+$/i)

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const data = { userGroupName, createdBy }
        await userGroupsDB.createUserGroups(data)

        res.status(200).json({ status: 200, result: `User Group added successfully.` })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.patch('/updateUserGroups', async (req, res) => {
    try {
        const { id, userGroupName, modifiedBy } = req.body

        req.checkBody("id", "Please provide valid 'id' value").notEmpty().isNumeric()
        req.checkBody("userGroupName", "Please provide valid 'name' value should be min 1 and max 100 chars long").notEmpty().isLength({ min: 1, max: 100 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("modifiedBy", "Please provide valid 'modifiedBy' value should be min 1 and max 100 chars long.").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_@.\s]+$/i)

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const data = { id, userGroupName, modifiedBy }
        await userGroupsDB.updateUserGroups(data)
        res.status(200).json({ status: 200, result: 'User Group updated successfully.' })

    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.delete('/deleteUserGroup', async (req, res) => {
    try {
        const { id } = req.query

        req.checkQuery("id", "Please provide valid 'id' value").notEmpty().isNumeric()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        await userGroupsDB.deleteUserGroup(id)
        res.status(200).json({ status: 200, result: 'User Group deleted successfully.' })

    } catch (e) {
        res.status(400).json({ status: 500, error: e.toString() })
    }
})


router.patch('/associateUserGroups', async (req, res) => {
    try{
        const { userGroupID, appID }  = req.body

        req.checkBody("userGroupID", "Please provide valid 'User Group ID' value").notEmpty().isNumeric()
        req.checkBody("appID", "Please provide valid 'Application ID' value").notEmpty().isNumeric()
        
        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const data = { userGroupID, appID }

        await userGroupsDB.associateUserGroups(data)
        res.status(200).json({ status : 200, result : 'User Group updated successfully.'})

    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.post('/associateUserGroup', async (req, res) => {
    try{
        const { userGroupID, userGroupName, parentID, parentName, parentType }  = req.body

        req.checkBody("userGroupID", "Please provide valid 'User Group ID' value").notEmpty().isNumeric()
        req.checkBody("userGroupName", "Please provide valid 'userGroupName' value").notEmpty()
        req.checkBody("parentID", "Please provide valid 'parentID' value").notEmpty().isNumeric()
        req.checkBody("parentName", "Please provide valid 'parentName' value").notEmpty()
        req.checkBody("parentType", "Please provide valid 'parentType' value").notEmpty()
        
        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const ugAssocData = { userGroupID, userGroupName, parentID, parentName, parentType, grandParentID : null, grandParentName : null, grandParentType : null }
        
        await userGroupsDB.associateUserGroup(ugAssocData)

        const roleResult = await activityRBACDB.getRoleIDByRoleName('Default App User Role')

        if(roleResult.length > 0) {
            const roleID = roleResult[0].id

            const roleMappingResult = await activityRBACDB.getRoleMappingToUserGroup(roleID, userGroupID)

            if(roleMappingResult.length < 1) {
                const roleMapData = { roleID : roleID, userGroupID : userGroupID, createdBy : 'Admin' }
                await activityRBACDB.createRoleMappingToUserGroup(roleMapData)
            }
        }

        const getData = { entityID : parentID, entityName : parentName, entityType : parentType }
        const resultData = await associationsDB.getParentsAppIDAndBuID(getData)

        let appID = null
        let buID = null
        if(resultData.length > 0){

            for (let i = 0; i < resultData.length; i++) {
                let resultDataEntityType = resultData[i].entity_type
                if(resultDataEntityType == 'Application') {
                    appID = resultData[i].entity_id
                } 
                if (resultDataEntityType == 'Business Unit') {
                    buID = resultData[i].entity_id
                }
            }
        }

        const usersData = await usersDB.getUsersByUserGroupID(userGroupID)
        if(usersData.length > 0) {
            const users = usersData[0].users

            if(users != null && users != 'undefined'){
                for(let i = 0; i < users.length; i++) {

                    const userID = users[i].id
                    const result = await usersDB.getUserAssocByUserandUserGroupID(userID, userGroupID)
                    let userAssocData = { userGroupID, userID, appID, buID }
        
                    if(result.length > 0){
                        await usersDB.updateUserAssociationByUserAndUserGroupID(userAssocData)
                    } else {
                        await usersDB.createUserAssociations(userAssocData)
                    }
                }
            }
        }
        
        res.status(200).json({ status : 200, result : 'User Group Associated successfully.'})

    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.post('/deleteAssociatedUserGroup', async (req, res) => {
    try {
        const { userGroupID, userGroupName } = req.query

        req.checkQuery("userGroupID", "Please provide valid 'user Group ID' value").notEmpty().isNumeric()
        req.checkQuery("userGroupName", "Please provide valid 'userGroupName' value").notEmpty()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        await userGroupsDB.deleteAssociatedUserGroup(userGroupID)
        res.status(200).json({ status: 200, result: 'User Group de-associated successfully.' })

    } catch (e) {
        res.status(400).json({ status: 500, error: e.toString() })
    }
})


/************ User Groups API's ******************/

router.get('/getUserGroupAssociations', async (req, res) => {
    try{
        const result = await userGroupsDB.getUserGroupAssociations()
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.post('/createUserGroupAssociations', async (req, res) => {
    try {
        const { userGroupID, userID } = req.body

        req.checkBody("userGroupID", "Please provide valid 'id' value").notEmpty().isNumeric()
        req.checkBody("userID", "Please provide valid 'id' value").notEmpty().isNumeric()

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const data = { userGroupID, userID }
        await userGroupsDB.createUserGroupAssociations(data)

        res.status(200).json({ status: 200, result: `User Group Associations added  successfully.` })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.patch('/updateUserGroupAssociations', async (req, res) => {
    try {
        const { id, userGroupID, userID } = req.body

        req.checkBody("id", "Please provide valid 'id' value").notEmpty().isNumeric()
        req.checkBody("userGroupID", "Please provide valid 'id' value").notEmpty().isNumeric()
        req.checkBody("userID", "Please provide valid 'id' value").notEmpty().isNumeric()

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const data = { id, userGroupID, userID }
        await userGroupsDB.updateUserGroupAssociations(data)
        res.status(200).json({ status: 200, result: 'User Group Associations updated successfully.' })

    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.delete('/deleteUserGroupAssociation', async (req, res) => {
    try {
        const { id } = req.query

        req.checkQuery("id", "Please provide valid 'id' value").notEmpty().isNumeric()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        await userGroupsDB.deleteUserGroupAssociation(id)
        res.status(200).json({ status: 200, result: 'User Group Association deleted successfully.' })

    } catch (e) {
        res.status(400).json({ status: 500, error: e.toString() })
    }
})

router.patch('/associateUserGroups', async (req, res) => {
    try {
        const { appID, userGroupID  } = req.body

        req.checkBody("appID", "Please provide valid 'Application ID' value").notEmpty().isNumeric()
        req.checkBody("userGroupID", "Please provide valid 'User Group ID' value").notEmpty().isNumeric()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const data = { appID, userGroupID  } 
        await userGroupsDB.associateUserGroups(data)
        res.status(200).json({ status: 200, result: 'User Group Association deleted successfully.' })

    } catch (e) {
        res.status(400).json({ status: 500, error: e.toString() })
    }
})


/************ User App Roles  API's ******************/
router.get('/getUserAppRoles', async (req, res) => {
    try{
        const result = await userGroupsDB.getUserAppRoles()
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getUserAppRolesByID', async (req, res) => {
    try {
        const id = req.query.id

        req.checkQuery("id", "Please provide valid 'id' value ").notEmpty().isNumeric()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const result = await userGroupsDB.getUserAppRolesByID(id)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/createUserAppRoles', async (req, res) => {
    try {
        const { userID, appID, roleID } = req.body

        req.checkBody("userID", "Please provide valid 'id' value").notEmpty().isNumeric()
        req.checkBody("appID", "Please provide valid 'id' value").notEmpty().isNumeric()
        req.checkBody("roleID", "Please provide valid 'id' value").notEmpty().isNumeric()

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const data = { userID, appID, roleID }
        await userGroupsDB.createUserAppRoles(data)

        res.status(200).json({ status: 200, result: `User App Roles added successfully.` })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.patch('/updateUserAppRoles', async (req, res) => {
    try {
        const { id, userID, appID, roleID } = req.body

        req.checkBody("id", "Please provide valid 'id' value").notEmpty().isNumeric()
        req.checkBody("userID", "Please provide valid 'id' value").notEmpty().isNumeric()
        req.checkBody("appID", "Please provide valid 'id' value").notEmpty().isNumeric()
        req.checkBody("roleID", "Please provide valid 'id' value").notEmpty().isNumeric()

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const data = { id, userID, appID, roleID }
        await userGroupsDB.updateUserAppRoles(data)
        res.status(200).json({ status: 200, result: 'User Appication Roles updated successfully.' })

    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.delete('/deleteUserAppRoles', async (req, res) => {
    try {
        const { id } = req.query

        req.checkQuery("id", "Please provide valid 'id' value").notEmpty().isNumeric()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        await userGroupsDB.deleteUserAppRoles(id)
        res.status(200).json({ status: 200, result: 'User Group deleted successfully.' })

    } catch (e) {
        res.status(400).json({ status: 500, error: e.toString() })
    }
})


/************ User Group App Roles API's ******************/

router.get('/getUserGroupAppRoles', async (req, res) => {
    try{
        const result = await userGroupsDB.getUserGroupAppRoles()
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getUserGroupAppRolesByID', async (req, res) => {
    try {
        const id = req.query.id

        req.checkQuery("id", "Please provide valid 'id' value ").notEmpty().isNumeric()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const result = await userGroupsDB.getUserGroupAppRolesByID(id)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/createUserGroupAppRoles', async (req, res) => {
    try {
        const { userGroupID, appID, roleID } = req.body

        req.checkBody("userGroupID", "Please provide valid 'id' value").notEmpty().isNumeric()
        req.checkBody("appID", "Please provide valid 'id' value").notEmpty().isNumeric()
        req.checkBody("roleID", "Please provide valid 'id' value").notEmpty().isNumeric()

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const data = { userGroupID, appID, roleID }
        await userGroupsDB.createUserGroupAppRoles(data)

        res.status(200).json({ status: 200, result: `User App Roles added successfully.` })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.patch('/updateUserGroupAppRoles', async (req, res) => {
    try {
        const { id, userGroupID, appID, roleID } = req.body

        req.checkBody("id", "Please provide valid 'id' value").notEmpty().isNumeric()
        req.checkBody("userGroupID", "Please provide valid 'id' value").notEmpty().isNumeric()
        req.checkBody("appID", "Please provide valid 'id' value").notEmpty().isNumeric()
        req.checkBody("roleID", "Please provide valid 'id' value").notEmpty().isNumeric()

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const data = { id, userGroupID, appID, roleID }
        await userGroupsDB.updateUserGroupAppRoles(data)
        res.status(200).json({ status: 200, result: 'User Appication Roles updated successfully.' })

    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.delete('/deleteUserGroupAppRoles', async (req, res) => {
    try {
        const { id } = req.query

        req.checkQuery("id", "Please provide valid 'id' value").notEmpty().isNumeric()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        await userGroupsDB.deleteUserGroupAppRoles(id)
        res.status(200).json({ status: 200, result: 'User Group deleted successfully.' })

    } catch (e) {
        res.status(400).json({ status: 500, error: e.toString() })
    }
})
module.exports = router
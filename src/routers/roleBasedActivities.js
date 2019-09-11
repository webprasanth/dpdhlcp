const express = require('express')
const activityRBACDB = require('../db/roleBasedActivitiesDB')
const router = new express.Router()

router.get('/getRoles', async (req, res) => {
    try {
        const category = req.query.category
        const result = await activityRBACDB.getRoles(category)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.get('/getRolePrivilegesMappingByRoleID', async (req, res) => {
    try {
        const roleID = req.query.roleID
        const result = await activityRBACDB.getRolePrivilegesMappingByRoleID(roleID)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/saveRolePrivilegesMapping', async (req, res) => {
    try {
        let { roleID, roleName, userGroupIDs, privileges, createdBy } = req.body

        if(roleID == null) {
            const data = { roleName, roleCategory : 'Platform', privileges }
            roleID = await activityRBACDB.addRoles(data)
        } else {
            const data = { roleID, roleName, roleCategory : 'Platform', privileges }
            await activityRBACDB.updateRoles(data)
        }

        const deleteData = { roleID }
        await activityRBACDB.deleteRoleMappingByRoleID(deleteData)

        if(typeof userGroupIDs != 'undefined' && userGroupIDs != null) {
            
            for( let i =0; i < userGroupIDs.length; i++ ) {

                const data = { roleID, userGroupID : userGroupIDs[i], createdBy }
                await activityRBACDB.createRoleMappingToUserGroup(data)
            }
        }

        res.status(200).json({ status: 200, result : 'RBAC configuration added Successfully' })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.get('/getUserGroupsWhichMappedAndNotAssociated', async (req, res) => {
    try {
        const result = await activityRBACDB.getUserGroupsWhichMappedAndNotAssociated()
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.get('/getRolesByAppID', async (req, res) => {
    try {
        const appID = req.query.appID
        const result = await activityRBACDB.getRolesByAppID(appID)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.get('/getActivities', async (req, res) => {
    try {
        const activityType = req.query.activityType
        const result = await activityRBACDB.getActivities(activityType)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.get('/getActivitiesByAppID', async (req, res) => {
    try {
        const appID = req.query.appID
        const result = await activityRBACDB.getActivitiesByAppID(appID)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/addRoles', async (req, res) => {
    try {
        const { roleName, roleCategory } = req.body
        const data = { roleName, roleCategory }
        const result = await activityRBACDB.addRoles(data)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/addActivities', async (req, res) => {
    try {
        const { activityName, appID, activityType } = req.body
        const data = { activityName, appID, activityType }

        await activityRBACDB.addActivities(data)

        res.status(200).json({ status: 200, result : 'Activity added Successfully' })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/addSubActivities', async (req, res) => {
    try {
        const { activityName, subActivity, appID, activityType } = req.body
        const data = { activityName, subActivity, appID, activityType }

        await activityRBACDB.addSubActivities(data)

        res.status(200).json({ status: 200, result : 'Sub Activity added Successfully' })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/saveRBACConfiguration', async (req, res) => {
    try {
        const { activityID, roleID, createAccess, readAccess, updateAccess, deleteAccess } = req.body
        const data = { activityID, roleID, createAccess, readAccess, updateAccess, deleteAccess }

        await activityRBACDB.saveRBACConfiguration(data)

        res.status(200).json({ status: 200, result : 'RBAC configuration added Successfully' })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/getActivityRBAC', async (req,res) => {
    try{
        const { category, roleID, appID } = req.body
        const data = { category, roleID, appID }
        const result = await activityRBACDB.getActivityRBAC(data)
        if(result) {
            res.status(200).json({ status : 200, result })
        } else {
            res.status(200).json({ status : 200, result : "No Activity RBAC Found" })
        }
    } catch (e) {
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

router.post('/getRBACByRBACID', async (req,res) => {
    try{
        const { rbacID } = req.body

        const result = await activityRBACDB.getRBACByRBACID(rbacID)
        
        res.status(200).json({ status : 200, result })

    } catch (e) {
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

router.patch('/updateActivityRBAC', async (req, res) => {
    try{
        
        const { rbacID, createAccess, readAccess, updateAccess, deleteAccess } = req.body
        const data = { rbacID, createAccess, readAccess, updateAccess, deleteAccess  }

        await activityRBACDB.updateActivityRBAC(data) 
       

        res.status(200).json({ status : 200, result : 'Activity RBAC updated successfully.'})

    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getConfiguredRoles', async (req, res) => {
    try {
        const category = req.query.category
        const result = await activityRBACDB.getConfiguredRoles(category)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/createRoleMappingToUserGroup', async (req,res) => {
    try{
        const { roleID, userGroupID, createdBy } = req.body
        const data = { roleID, userGroupID, createdBy }

        await activityRBACDB.createRoleMappingToUserGroup(data)
        
        res.status(200).json({ status : 200, result : 'Role Mapped to User Group successfully.' })

    } catch (e) {
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

router.patch('/updateRoleMappingToUserGroup', async (req, res) => {
    try{
        
        const { userGroupID, roleID, modifiedBy } = req.body
        const data = { userGroupID, roleID, modifiedBy  }

        await activityRBACDB.updateRoleMappingToUserGroup(data) 
       

        res.status(200).json({ status : 200, result : 'Role Mapping updated successfully.' })

    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getTopLevelEntitiesAssociatedWithUserGroup', async (req, res) => {
    try{
        const result = await activityRBACDB.getTopLevelEntitiesAssociatedWithUserGroup()
        res.status(200).json({ status : 200, result })
    } catch (e) {
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

router.get('/getAssociatedUserGroupByEntityID', async (req, res) => {
    try{
        const entityID = req.query.entityID
        const result = await activityRBACDB.getAssociatedUserGroupByEntityID(entityID)
        res.status(200).json({ status : 200, result })
    } catch (e) {
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

router.get('/getRoleMappingByUserGroupID', async (req, res) => {
    try{
        const userGroupID = req.query.userGroupID
        const result = await activityRBACDB.getRoleMappingByUserGroupID(userGroupID)
        res.status(200).json({ status : 200, result })
    } catch (e) {
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

router.post('/saveRoleMappingToUserGroup', async (req,res) => {
    try{
        const { roleID, userGroupID, mode, createdBy } = req.body

        if( mode == 'Add' ){
            const data = { roleID, userGroupID, createdBy }
            await activityRBACDB.createRoleMappingToUserGroup(data)
        } else {
            const data = { roleID, userGroupID, modifiedBy : createdBy }
            await activityRBACDB.updateRoleMappingToUserGroup(data)    
        }
        
        res.status(200).json({ status : 200, result : 'Role Mapped to User Group successfully.' })

    } catch (e) {
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

router.delete('/deleteRBAC', async (req,res) => {
    try{
        const { rbacID } = req.query

        await activityRBACDB.deleteRBAC(rbacID)
        
        res.status(200).json({ status : 200, result : "RBAC deleted Successfully" })

    } catch (e) {
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

module.exports = router
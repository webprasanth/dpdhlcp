const express = require('express')
//const associationsDB = require('../db/associationsDB')
const associationsDB = require('../dummy/treeAssociationDB')
const businessUnitsDB = require('../db/businessUnitsDB')
const applicationsDB = require('../db/applicationsDB')
const userGroupsDB = require('../db/userGroupsDB')
const deviceGroupsDB = require('../db/deviceGroupsDB')
const entityDB = require('../db/entityDB')
const router = new express.Router()

router.get('/getAssociationsForAngular', async (req, res) => {
    try{
        const result = await associationsDB.getAssociationsForAngular()
        res.status(200).json({ status : 200, result })
    } catch (e) {
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

router.post('/getTopLevelEntities', async (req, res) => {
    try{
        const { userRole, userEmailID, userID  } = req.body

        const data = { userRole, userEmailID, userID}
        
        const result = await associationsDB.getTopLevelEntities(data)
        res.status(200).json({ status : 200, result })
    } catch (e) {
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

router.post('/getAllAssociationsByEntityID', async (req, res) => {
    try{
        const { entityID, entityName, entityType } = req.body
        const data = { entityID, entityName, entityType }
        const result = await associationsDB.getAllAssociationsByEntityID(data)
        res.status(200).json({ status : 200, result })
    } catch (e) {
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

router.post('/createAssociationsByNodeForAngular', async (req, res) => {
    try{
        const { parentName, parentType, entityName, entityID, entityType }  = req.body
        const data = { parentName, parentType, entityName, entityID, entityType }
        await associationsDB.createAssociationsByNodeForAngular( data )
        
        res.status(200).json({ status : 200, result : "Association created succesfully" })
    } catch (e) {
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

router.post('/getEntityParentsForAngular', async (req, res) => {
    try{
        const { entityID, entityName, entityType }  = req.body

        req.checkBody("entityID", "Please provide valid 'entityID' value.").notEmpty().isNumeric()
        req.checkBody("entityName", "Please provide valid 'entityName' value.").notEmpty()
        req.checkBody("entityType", "Please provide valid 'entityType' value.").notEmpty()

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str));
            return res.status(400).json({  status : 400, error : errs })
        }

        const data = { entityID, entityName, entityType } 
        const result = await associationsDB.getEntityParentsForAngular(data)
        res.status(200).json({ status : 200, result })
    } catch (e) {
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

router.post('/getEntityChildrensForAngular', async (req, res) => {
    try{
        const { entityID, entityName, entityType } = req.body
        const data = { entityID, entityName, entityType } 
        const result = await associationsDB.getEntityChildrensForAngular(data)
        res.status(200).json({ status : 200, result })
    } catch (e) {
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

router.post('/getParentsAppIDAndBuID', async (req, res) => {
    try{
        const { entityID, entityName, entityType } = req.body

        const data = { entityID, entityName, entityType }
        const result = await associationsDB.getParentsAppIDAndBuID(data)


        res.status(200).json({ status : 200, result  })
    } catch (e) {
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

router.post('/deAssociateTree', async (req, res) => {
    try{
        const { entityID, entityName, entityType } = req.body

        const data = { entityID, entityName, entityType }
        const associatedList = await associationsDB.getAllAssociatedChildrens(data)

        if(associatedList.length > 0) {
            const associatedObj = associatedList[0]

            const buIDs = associatedObj.business_unit
            const appIDs = associatedObj.application
            const userGroupIDs = associatedObj.user_group
            const deviceGroupIDs = associatedObj.device_group
            const entityIDs = associatedObj.entity

            // await applicationsDB.deAssociatedApplications(buIDs)
            // await applicationsDB.deAssociatedApplications(appIDs)
            // await applicationsDB.deAssociatedUserGroups(userGroupIDs)
            // await applicationsDB.deAssociatedDeviceGroups(deviceGroupIDs)
            // await applicationsDB.deAssociatedEntities(entityIDs)
            

        }

        const assocData = { entityID, entityName, entityType }
        await associationsDB.deleteAssociationsByNodeForAngular(assocData)

        res.status(200).json({ status : 200, result : 'De-Associated Succesfully.' })
    } catch (e) {
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

// router.post('/deAssociateChildEntities', async (req, res) => {
//     try{
//         const { entityID, entityName, entityType } = req.body

//         const data = { entityID, entityName, entityType }
//         //deAssociateImmediateChildEntities(data)

//         // const data = { entityID, entityName, entityType }
//         // const associatedList = await associationsDB.getAllAssociatedImmediateChildrensAsGroups(data)

//         // if(associatedList.length > 0) {
//         //     const associatedObj = associatedList[0]

//         //     const buIDs = associatedObj.business_unit
//         //     const appIDs = associatedObj.application
//         //     const userGroupIDs = associatedObj.user_group
//         //     const deviceGroupIDs = associatedObj.device_group
//         //     const entityIDs = associatedObj.entity

//         //     // await applicationsDB.deAssociatedApplications(buIDs)
//         //     // await applicationsDB.deAssociatedApplications(appIDs)
//         //     // await applicationsDB.deAssociatedUserGroups(userGroupIDs)
//         //     // await applicationsDB.deAssociatedDeviceGroups(deviceGroupIDs)
//         //     // await applicationsDB.deAssociatedEntities(entityIDs)
            

//         // }

//         const assocData = { entityID, entityName, entityType }
//         await associationsDB.deleteAssociationsByNodeForAngular(assocData)

//         res.status(200).json({ status : 200, result : 'De-Associated Succesfully.' })
//     } catch (e) {
//         res.status(500).json({ status : 500, error : e.toString() })
//     }
// })

router.post('/deAssociateEntity', async (req, res) => {
    try{
        const { entityID, entityName, entityType } = req.body

        if(entityType == 'Application') {

            const data = { appID : entityID }
            await applicationsDB.deAssociateApplication(data)

        } else if ( entityType == 'User Group') {

            const data = { userGroupID : entityID }
            await userGroupsDB.deAssociateUserGroup(data)

        } else if ( entityType == 'Device Group') {

            const data = { deviceGroupID: entityID }
            await deviceGroupsDB.deAssociateDeviceGroup(data)

        } else {

            const data = { entityID }
            await entityDB.deAssociateEntity(data)
        }

        
        const assocData = { entityID, entityName, entityType, parentName : null, parentType : null }
        await associationsDB.updateAssociationsByNodeForAngular(assocData)

        res.status(200).json({ status : 200, result : 'De-Associated Succesfully.' })
    } catch (e) {
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

router.post('/getParentApptoFindSiblings', async (req, res) => {
    try{
        const { entityID, entityName, entityType } = req.body
        const data = { entityID, entityName, entityType }
        const result = await associationsDB.getParentApptoFindSiblings(data)
        res.status(200).json({ status : 200, result })
    } catch (e) {
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

router.post('/getAllAssociatedChildrens', async (req, res) => {
    try{
        const { entityID, entityName, entityType } = req.body
        const data = { entityID, entityName, entityType }
        const result = await associationsDB.getAllAssociatedChildrens(data)
        res.status(200).json({ status : 200, result })
    } catch (e) {
        res.status(500).json({ status : 500, error : e.toString() })
    }
})


module.exports = router
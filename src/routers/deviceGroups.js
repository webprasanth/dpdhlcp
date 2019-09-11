const express = require('express')
const deviceGroupsDB = require('../db/deviceGroupsDB')
//const associationsDB = require('../db/associationsDB')
const associationsDB = require('../dummy/treeAssociationDB')
const router = new express.Router()

/*********************  Related to  Device Group Table  *********************/

router.get('/getDeviceGroups', async (req, res) => {
    try{

        const result = await deviceGroupsDB.getAllDeviceGroups()
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.post('/getDeviceGroups', async (req, res) => {
    try{
        const { userRole, userEmailID } = req.body
        const data = { userRole, userEmailID }

        const result = await deviceGroupsDB.getDeviceGroups(data)
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getDeviceGroupByID', async (req, res) => {
    try{
        const id = req.query.id

        req.checkQuery("id", "Please provide valid 'id' value ").notEmpty().isInt()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const result = await deviceGroupsDB.getDeviceGroupByID(id)
        res.status(200).json({ status : 200, result})
    } catch (e){
        res.status(500).json({ status : 500, error : e})
    }
})

router.get('/getDeviceGroupByDeviceGroupName', async (req, res) => {
    try {
        const deviceGroupName = req.query.deviceGroupName
  
        req.checkQuery("deviceGroupName", "Please provide valid 'deviceGroupName' value ").notEmpty().isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
        var errors = req.validationErrors()
  
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }
  
        const result = await deviceGroupsDB.getUserGroupByUserGroupName(deviceGroupName)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})
  
router.get('/getAllDeviceGroupsNotAssociated', async (req, res) => {
    try{
        const result = await deviceGroupsDB.getAllDeviceGroupsNotAssociated()
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getDeviceGroupsByAppID', async (req, res) => {
    try {
        const appID = req.query.appID

        req.checkQuery("appID", "Please provide valid 'appID' value ").notEmpty().isNumeric()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const result = await deviceGroupsDB.getDeviceGroupsByAppID(appID)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/createDeviceGroup', async (req, res) => {
    try{
        const { deviceGroupName, createdBy }  = req.body

        req.checkBody("deviceGroupName", "Please provide valid 'deviceGroupName' value should be min 1 and max 100 chars long.").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("createdBy", "Please provide valid 'createdBy' value should be min 1 and max 100 chars long").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_@.\s]+$/i)
        
        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const data = { deviceGroupName, createdBy } 

        await deviceGroupsDB.createDeviceGroup(data)
        res.status(200).json({ status : 200, result : 'Device Group added successfully.'})
    } catch (e){
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

router.patch('/updateDeviceGroup', async (req, res) => {
    try{
        const { id, deviceGroupName, modifieddBy }  = req.body

        req.checkBody("id", "Please provide valid 'id' value").notEmpty().isNumeric()
        req.checkBody("deviceGroupName", "Please provide valid 'deviceGroupName' value should be min 1 and max 100 chars long.").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("modifieddBy", "Please provide valid 'modifieddBy' value should be min 1 and max 100 chars long").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_@.\s]+$/i)
        
        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const data = { id, deviceGroupName, modifieddBy }

        await deviceGroupsDB.updateDeviceGroup(data)
        res.status(200).json({ status : 200, result : 'Device Group updated successfully.'})

    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.delete('/deleteDeviceGroup', async (req, res) => {
    try{
        const { id } = req.query

        req.checkQuery("id", "Please provide valid 'id' value").notEmpty().isNumeric()
        var errors = req.validationErrors()
        
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error: errs })
        }

        await deviceGroupsDB.deleteDeviceGroup(id)
        res.status(200).json({ status : 200, result : 'Device Group deleted successfully.' })

    } catch (e){
        res.status(400).json({ status : 500, error : e.toString() })
    }
})

router.patch('/associateDeviceGroups', async (req, res) => {
    try{
        const { deviceGroupID, appID }  = req.body

        req.checkBody("deviceGroupID", "Please provide valid 'Device Group ID' value").notEmpty().isNumeric()
        req.checkBody("appID", "Please provide valid 'Application ID' value").notEmpty().isNumeric()
        
        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const data = { deviceGroupID, appID }

        await deviceGroupsDB.associateDeviceGroups(data)
        res.status(200).json({ status : 200, result : 'Device Group updated successfully.'})

    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.post('/associateDeviceGroup', async (req, res) => {
    try{
        let { deviceGroupID, deviceGroupName, appID, buID, parentID, parentName, parentType }  = req.body

        req.checkBody("deviceGroupID", "Please provide valid 'Device Group ID' value").notEmpty().isNumeric()
        req.checkBody("deviceGroupName", "Please provide valid 'deviceGroupName' value").notEmpty()
        req.checkBody("parentID", "Please provide valid 'parentID' value").notEmpty().isNumeric()
        req.checkBody("parentName", "Please provide valid 'parentName' value").notEmpty()
        req.checkBody("parentType", "Please provide valid 'parentType' value").notEmpty()
        
        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        if(appID == null || buID == null) {

            const getData = { entityID : parentID, entityName : parentName, entityType : parentType }
            const resultData = await associationsDB.getParentsAppIDAndBuID(getData)

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
        }

        const dgAssocData = { deviceGroupID, deviceGroupName, appID, buID, parentID, parentName, parentType, grandParentID : null, grandParentName : null, grandParentType : null }
        
        await deviceGroupsDB.associateDeviceGroup(dgAssocData)

        res.status(200).json({ status : 200, result : 'Device Group Associated successfully.'})

    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.delete('/deleteAssociatedDeviceGroups', async (req, res) => {
    try {
        const { deviceGroupID } = req.query

        req.checkQuery("deviceGroupID", "Please provide valid 'device Group ID' value").notEmpty().isNumeric()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        await deviceGroupsDB.deleteAssociatedDeviceGroups(deviceGroupID)
        res.status(200).json({ status: 200, result: 'device Group de-associated successfully.' })

    } catch (e) {
        res.status(400).json({ status: 500, error: e.toString() })
    }
})


/*********************  Related to  Device Group Associations Table  *********************/

router.get('/getDeviceGroupAssociations', async (req, res) => {
    try{
        const result = await deviceGroupsDB.getDeviceGroupAssociations()
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getDeviceGroupAssociationByID', async (req, res) => {
    try{
        const id = req.query.id

        req.checkQuery("id", "Please provide valid 'id' value ").notEmpty().isInt()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const result = await deviceGroupsDB.getDeviceGroupAssociationByID(id)
        res.status(200).json({ status : 200, result})
    } catch (e){
        res.status(500).json({ status : 500, error : e})
    }
})

router.post('/createDeviceGroupAssociation', async (req, res) => {
    try{
        const { deviceGroupID, deviceID }  = req.body

        req.checkBody("deviceGroupID", "Please provide valid 'deviceGroupID' value").notEmpty().isNumeric()
        req.checkBody("deviceID", "Please provide valid 'deviceID' value").notEmpty().isNumeric()
        
        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const data = { deviceGroupID, deviceID } 

        await deviceGroupsDB.createDeviceGroupAssociation(data)
        res.status(200).json({ status : 200, result : 'Device Group Association added successfully.'})
    } catch (e){
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

router.patch('/updateDeviceGroupAssociation', async (req, res) => {
    try{
        const { deviceGroupID, deviceID, id }  = req.body

        req.checkBody("id", "Please provide valid 'id' value").notEmpty().isNumeric()
        req.checkBody("deviceGroupID", "Please provide valid 'deviceGroupID' value").notEmpty().isNumeric()
        req.checkBody("deviceID", "Please provide valid 'deviceID' value").notEmpty().isNumeric()
        
        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const data = { deviceGroupID, deviceID, id }

        await deviceGroupsDB.updateDeviceGroupAssociation(data)
        res.status(200).json({ status : 200, result : 'Device Group Association updated successfully.'})

    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.delete('/deleteDeviceGroupAssociation', async (req, res) => {
    try{
        const { id } = req.query

        req.checkQuery("id", "Please provide valid 'id' value").notEmpty().isNumeric()
        var errors = req.validationErrors()
        
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error: errs })
        }

        await deviceGroupsDB.deleteDeviceGroupAssociation(id)
        res.status(200).json({ status : 200, result : 'Device Group Association deleted successfully.' })

    } catch (e){
        res.status(400).json({ status : 500, error : e.toString() })
    }
})

/*********************  Related to  Device Group Apps Table  *********************/

router.get('/getdeviceGroupApps', async (req, res) => {
    try{
        const result = await deviceGroupsDB.getdeviceGroupApps()
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getDeviceGroupAppByID', async (req, res) => {
    try{
        const id = req.query.id

        req.checkQuery("id", "Please provide valid 'id' value ").notEmpty().isInt()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const result = await deviceGroupsDB.getDeviceGroupAppByID(id)
        res.status(200).json({ status : 200, result})
    } catch (e){
        res.status(500).json({ status : 500, error : e})
    }
})

router.post('/createDeviceGroupApp', async (req, res) => {
    try{
        const { deviceGroupID, appID }  = req.body

        req.checkBody("deviceGroupID", "Please provide valid 'deviceGroupID' value").notEmpty().isNumeric()
        req.checkBody("appID", "Please provide valid 'appID' value").notEmpty().isNumeric()
        
        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const data = { deviceGroupID, appID } 

        await deviceGroupsDB.createDeviceGroupApp(data)
        res.status(200).json({ status : 200, result : 'Device Group App added successfully.'})
    } catch (e){
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

router.patch('/updateDeviceGroupApp', async (req, res) => {
    try{
        const { deviceGroupID, appID, id }  = req.body

        req.checkBody("id", "Please provide valid 'id' value").notEmpty().isNumeric()
        req.checkBody("deviceGroupID", "Please provide valid 'deviceGroupID' value").notEmpty().isNumeric()
        req.checkBody("appID", "Please provide valid 'appID' value").notEmpty().isNumeric()
        
        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const data = { deviceGroupID, appID, id }

        await deviceGroupsDB.updateDeviceGroupApp(data)
        res.status(200).json({ status : 200, result : 'Device Group App updated successfully.'})

    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.delete('/deleteDeviceGroupApp', async (req, res) => {
    try{
        const { id } = req.query

        req.checkQuery("id", "Please provide valid 'id' value").notEmpty().isNumeric()
        var errors = req.validationErrors()
        
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error: errs })
        }

        await deviceGroupsDB.deleteDeviceGroupApp(id)
        res.status(200).json({ status : 200, result : 'Device Group App deleted successfully.' })

    } catch (e){
        res.status(400).json({ status : 500, error : e.toString() })
    }
})

module.exports = router
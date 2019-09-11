const express = require('express')
const validator = require('validator')
const devicesDB = require('../db/devicesDB')
const deviceGroupDB = require('../db/deviceGroupsDB')
//const associationsDB = require('../db/associationsDB')
const associationsDB = require('../dummy/treeAssociationDB')
const commonUtils = require('../utils/commonUtils')
const request = require('request')
const router = new express.Router()

router.post('/getDevices', async (req, res) => {
   try {
       
       let size = 10
       let page = 1
       let search = null
       let sortColumn = 'device_name'
       let sortType = 1

       if (typeof req.body.pageSize !== 'undefined' && req.body.pageSize !== null) {
           size = req.body.pageSize
       }

       if (typeof req.body.pageNumber !== 'undefined' && req.body.pageNumber !== null) {
           page = req.body.pageNumber
       }

       if (typeof req.body.search !== 'undefined' && req.body.search !== null) {
           search = req.body.search
       }

       if (typeof req.body.sortColumn !== 'undefined' && req.body.sortColumn !== null) {
           sortColumn = req.body.sortColumn
       }

       if (typeof req.body.sortType !== 'undefined' && req.body.sortType !== null) {
           sortType = req.body.sortType
       }

       const result = await devicesDB.getDevices(page, size, search, sortColumn, sortType)
       let extraPage = 0

       if ((result.totalrows) % (size) > 1) {
           extraPage = 1
       }

       let totalPages = Math.floor((result.totalrows) / (size)) + extraPage

       let outputJson = {
           "meta": {
               "totalPages": totalPages == 0 ? 1 : totalPages,
               "currentPage": parseInt(page),
               "nextPage": totalPages == 0 ? 0 : parseInt(page) + 1,
               "prevPage": (parseInt(page) - 1 < 1) ? 0 : parseInt(page) - 1
           },
           "data": result.rows
       }

       res.status(200).json({ status: 200, result: outputJson })

   } catch (e) {
       res.status(500).json({ status: 500, error: e.toString() })
   }
})

router.get('/getAllDevices', async (req, res) => {
    try{
        const result = await devicesDB.getAllDevices()
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getDeviceByID', async (req, res) => {
    try{
        const id = req.query.id

        req.checkQuery("id", "Please provide valid 'id' value ").notEmpty().isInt()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const result = await devicesDB.getDeviceByID(id)
        res.status(200).json({ status : 200, result})
    } catch (e){
        res.status(500).json({ status : 500, error : e})
    }
})

router.post('/getDevicesCount', async (req, res) => {
    try {
        const deviceGroupID = req.body.deviceGroupID
        const result = await devicesDB.getDevicesCount(deviceGroupID)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.get('/getDevicesByDeviceGroupID', async (req, res) => {
    try {
        const deviceGroupID = req.query.deviceGroupID

        req.checkQuery("deviceGroupID", "Please provide valid 'deviceGroupID' value ").notEmpty().isNumeric()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const result = await devicesDB.getDevicesByDeviceGroupID(deviceGroupID)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/createDeviceInfo', async (req, res) => {
    try{
        const { dhlDeviceID, uuID, serialNumber, macAddress, deviceName, status, protocol, deviceHealth, powerType, onboardedBy, deviceOwner, iotReady, deviceSpecID }  = req.body

        req.checkBody("dhlDeviceID", "Please provide valid 'dhlDeviceID' value should be min 1 and max 50 chars long.").notEmpty().isLength({ min: 1, max:50 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("uuID", "Please provide valid 'uuID' value should be min 1 and max 50 chars long").notEmpty().isLength({ min: 1, max:50 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("serialNumber", "Please provide valid 'serialNumber' value should be min 1 and max 50 chars long.").notEmpty().isLength({ min: 1, max:50 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("macAddress", "Please provide valid 'macAddress' value should be min 1 and max 100 chars long").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_.\s]+$/i)
        req.checkBody("deviceName", "Please provide valid 'deviceName' value should be min 1 and max 50 chars long.").notEmpty().isLength({ min: 1, max:50 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("status", "Please provide valid 'status' value should be min 1 and max 30 chars long.").notEmpty().isLength({ min: 1, max:30 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("protocol", "Please provide valid 'protocol' value should be min 1 and max 50 chars long").notEmpty().isLength({ min: 1, max:50 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("deviceHealth", "Please provide valid 'deviceHealth' value should be min 1 and max 30 chars long.").notEmpty().isLength({ min: 1, max:30 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("onboardedBy", "Please provide valid 'onboardedBy' value should be min 1 and max 30 chars long").notEmpty().isLength({ min: 1, max:30 }).matches(/^[a-z\d\-_.@\s]+$/i)
        req.checkBody("deviceOwner", "Please provide valid 'deviceOwner' value should be min 1 and max 30 chars long.").notEmpty().isLength({ min: 1, max:30 }).matches(/^[a-z\d\-_.@s]+$/i)
        req.checkBody("powerType", "Please provide valid 'powerType' value should be min 1 and max 30 chars long").notEmpty().isLength({ min: 1, max:30 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("iotReady", "Please provide valid 'iotReady' value as 'Y' or 'N'").notEmpty().isBoolean()
        req.checkBody("deviceSpecID", "Please provide valid 'deviceSpecID' value").isNumeric()
        
        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const data = { 
            dhlDeviceID, 
            uuID, 
            serialNumber,
            macAddress, 
            deviceName,
            status, 
            protocol, 
            deviceHealth, 
            powerType, 
            onboardedBy, 
            deviceOwner, 
            iotReady, 
            deviceSpecID,
        } 

        await devicesDB.createDeviceInfo(data)
        res.status(200).json({ status : 200, result : 'Device added successfully.'})
    } catch (e){
        res.status(500).json({ status : 500, error : e.toString() })
    }
})

/* Not Used
router.post('/createDevicesWithDeviceGroups', async (req, res) => {
    try {
        const { buID, appID, deviceGroups } = req.body

        if(typeof deviceGroups !== "undefined" && deviceGroups !== null && deviceGroups !== "") {
            for(let i = 0; i < deviceGroups.length; i++) {

                let { deviceGroupID, deviceGroupName, createdBy, devices } = deviceGroups[i]

                if(deviceGroupID != '' && deviceGroupID != null){
                    
                    //const deviceGroupResult = await deviceGroupDB.getDeviceGroupByDeviceGroupName(deviceGroupName)

                    //const dgData = { deviceGroupID : deviceGroupResult[0].id, appID }

                    const checkEntity = await associationsDB.getAssociationsByEntity(deviceGroupID, 'Device Group')
                    if(checkEntity.length > 0){
                        if(appID != null && appID != "") { 

                            const dgData = { deviceGroupID, appID }
                            await deviceGroupDB.updateAssociatedDeviceGroups(dgData)

                        } else {
                            const dgData = { deviceGroupID, buID }
                            await deviceGroupDB.updateAssociatedDeviceGroupForBu(dgData)
                        }
                        

                    } else {
                        if(appID != null && appID != "") { 
                            const assocDGData = { appID, deviceGroupID }
                            await deviceGroupDB.associateDeviceGroups(assocDGData)

                        } else {
                            const assocDGData = { buID, deviceGroupID }
                            await deviceGroupDB.associateDeviceGroupForBu(assocDGData)

                        }
                    }
                    
                } else {

                    const dgData = { deviceGroupName, createdBy, appID }
                    deviceGroupID = await deviceGroupDB.createDeviceGroup(dgData)
                    const assocDGData = { appID, deviceGroupID }
                    await deviceGroupDB.associateDeviceGroups(assocDGData)
                }


                if(typeof devices !== "undefined" && devices !== null && devices !== "") {

                    for(let j = 0; j < devices.length; j++) {

                        const { dhlDeviceID, uuID, serialNumber, macAddress, deviceName, status, protocol, deviceHealth, powerType, onboardedBy, deviceOwner, iotReady, deviceSpecID } = devices[j]
                        const deviceResult = await devicesDB.getDeviceBySerialNumber(serialNumber)
                        let deviceID = 0

                        const deviceData = { 
                            dhlDeviceID, uuID, serialNumber, macAddress, deviceName, status, protocol, deviceHealth, powerType, onboardedBy, deviceOwner, iotReady, deviceSpecID 
                         }

                        if(deviceResult.length > 0) {

                            deviceID = deviceResult[0].id
                            deviceData.id = deviceID
                            await devicesDB.updateDeviceInfo(deviceData)
                        } else {
                            
                            deviceID = await devicesDB.createDeviceInfo(deviceData)
                        }

                        const result = await devicesDB.getDeviceAssocByDeviceAndDeviceGroupID(deviceID, deviceGroupID)

                        let deviceAssocData = { deviceGroupID, deviceID, appID, buID }

                        if(result.length > 0){
                            deviceAssocData.id = result[0].id
                            await devicesDB.updateDeviceAssociation(deviceAssocData)

                        } else {
                            await devicesDB.createDeviceAssociation(deviceAssocData)
                        }
                    }
                }
            }
            res.status(200).json({ status: 200, result: `Devices added successfully With DeviceGroups` })
        }
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})*/

router.post('/createDevicesWithDeviceGroupsForAngular', async (req, res) => {
    try {

        let { deviceGroupID, deviceGroupName, deviceTypeName, serviceProviderID, deviceMetadata, newDeviceMetadata, removedDeviceMetadata, username, password, email, token, project, createdBy, parentID, parentName, parentType } = req.body

        req.checkBody("deviceGroupName", "Please provide valid 'deviceGroupName' value should be min 1 and max 100 chars long").notEmpty().isLength({ min: 1, max: 100 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("deviceTypeName", "Please provide valid 'deviceTypeName' value should be min 1 and max 100 chars long").notEmpty().isLength({ min: 1, max: 100 }).matches(/^[a-z\d\-_\s]+$/i)

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const deviceTypeResult = await devicesDB.getDeviceTypeBydeviceTypeName(deviceTypeName)

        let keys = []

        if(deviceMetadata !== null && typeof deviceMetadata != 'undefined'  ) {
            if(deviceMetadata.length > 0){
                for(let key in deviceMetadata[0]) keys.push(key)
            }

        }

        let deviceTypeID = 0
        if(deviceTypeResult.length > 0 ) {

            let savedKeys = deviceTypeResult[0].keys 

            const newKeys = commonUtils.mergeTwoArraysRemoveDuplicates(savedKeys, keys)
            deviceTypeID = deviceTypeResult[0].id
            const data = { deviceTypeID, deviceTypeName, keys : newKeys, modifieldBy : createdBy }
            await devicesDB.updateDeviceType(data)

        } else {

            const data = { deviceTypeName, keys, createdBy }
            deviceTypeID =  await devicesDB.createDeviceType(data)
        }

        if(deviceGroupID != null) {

            const dgData = { deviceGroupID, deviceGroupName, deviceTypeID, serviceProviderID, username, password, email, token, project, modifieldBy : createdBy }
            await deviceGroupDB.updateDeviceGroupForAngular(dgData)

            if(removedDeviceMetadata !== null && typeof removedDeviceMetadata != 'undefined' ) {
                for(let k = 0; k < removedDeviceMetadata.length ; k++ ) {
                    await devicesDB.deleteDeviceMetaData(removedDeviceMetadata[k].device_metadata_id)
                }
            }

            if(newDeviceMetadata !== null && typeof newDeviceMetadata != 'undefined' ) {
    
                for(let i = 0; i < newDeviceMetadata.length ; i++ ) {
                    
                    const data = {  deviceGroupID, deviceMetadata : newDeviceMetadata[i], createdBy }
                    await devicesDB.createDeviceMetadata(data)
                }
            }

        } else {

            const dgData = { deviceGroupName, deviceTypeID, serviceProviderID, username, password, email, token, project, createdBy }
            deviceGroupID = await deviceGroupDB.createDeviceGroupForAngular(dgData)

            if(deviceMetadata !== null && typeof deviceMetadata != 'undefined' ) {
            
                for(let j = 0; j < deviceMetadata.length ; j++ ) {
                    
                    const data = {  deviceGroupID, deviceMetadata : deviceMetadata[j], createdBy }
                    await devicesDB.createDeviceMetadata(data)
                }
            }


            if(parentID != null &&  parentID != '') {

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

                const dgAssocData = { deviceGroupID, deviceGroupName, appID, buID, parentID, parentName, parentType, grandParentID : null, grandParentName : null, grandParentType : null }
            
                await deviceGroupDB.associateDeviceGroup(dgAssocData)
            }
        }

        res.status(200).json({ status: 200, result: `Devices added successfully With DeviceGroups` })
        
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.patch('/updateDeviceInfo', async (req, res) => {
    try{
        const { id, dhlDeviceID, uuID, serialNumber, macAddress, deviceName, status, protocol, deviceHealth, powerType, onboardedBy, deviceOwner, iotReady, deviceSpecID }  = req.body

        req.checkBody("id", "Please provide valid 'id' value").notEmpty().isInt()
        req.checkBody("dhlDeviceID", "Please provide valid 'dhlDeviceID' value should be min 1 and max 50 chars long.").notEmpty().isLength({ min: 1, max:50 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("uuID", "Please provide valid 'uuID' value should be min 1 and max 50 chars long").notEmpty().isLength({ min: 1, max:50 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("serialNumber", "Please provide valid 'serialNumber' value should be min 1 and max 50 chars long.").notEmpty().isLength({ min: 1, max:50 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("macAddress", "Please provide valid 'macAddress' value should be min 1 and max 100 chars long").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_.\s]+$/i)
        req.checkBody("deviceName", "Please provide valid 'deviceName' value should be min 1 and max 50 chars long.").notEmpty().isLength({ min: 1, max:50 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("status", "Please provide valid 'status' value should be min 1 and max 30 chars long.").notEmpty().isLength({ min: 1, max:30 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("protocol", "Please provide valid 'protocol' value should be min 1 and max 50 chars long").notEmpty().isLength({ min: 1, max:50 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("deviceHealth", "Please provide valid 'deviceHealth' value should be min 1 and max 30 chars long.").notEmpty().isLength({ min: 1, max:30 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("onboardedBy", "Please provide valid 'onboardedBy' value should be min 1 and max 30 chars long").notEmpty().isLength({ min: 1, max:30 }).matches(/^[a-z\d\-_.@\s]+$/i)
        req.checkBody("deviceOwner", "Please provide valid 'deviceOwner' value should be min 1 and max 30 chars long.").notEmpty().isLength({ min: 1, max:30 }).matches(/^[a-z\d\-_.@\s]+$/i)
        req.checkBody("powerType", "Please provide valid 'powerType' value should be min 1 and max 30 chars long").notEmpty().isLength({ min: 1, max:30 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("iotReady", "Please provide valid 'iotReady' value as 'Y' or 'N'").notEmpty().matches(/^(?:Y|N)$/)
        req.checkBody("deviceSpecID", "Please provide valid 'deviceSpecID' value").isNumeric()
        
        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const data = { 
            id,
            dhlDeviceID, 
            uuID, 
            serialNumber,
            macAddress, 
            deviceName,
            status, 
            protocol, 
            deviceHealth, 
            powerType, 
            onboardedBy, 
            deviceOwner, 
            iotReady, 
            deviceSpecID,
        }

        await devicesDB.updateDeviceInfo(data)
        res.status(200).json({ status : 200, result : 'Device updated successfully.'})

    } catch (e){
        res.status(500).json({ status : 500, error : e})
    }
})

router.delete('/deleteDevice', async (req, res) => {
    try{
        const { id } = req.query

        req.checkQuery("id", "Please provide valid 'id' value").notEmpty().isInt()
        var errors = req.validationErrors()
        
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error: errs })
        }

        await devicesDB.deleteDevice(id)
        res.status(200).json({ status : 200, result : 'Device deleted successfully.' })

    } catch (e){
        res.status(400).json({ status : 500, error : e.toString() })
    }
})

router.delete('/deleteDeviceFromDeviceGroup', async (req, res) => {
    try {
        const { deviceID, deviceGroupID } = req.body

        req.checkBody("deviceID", "Please provide valid 'deviceID' value").notEmpty().isNumeric()
        req.checkBody("deviceGroupID", "Please provide valid 'deviceGroupID' value").notEmpty().isNumeric()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        await devicesDB.deleteDeviceFromDeviceGroup(deviceID, deviceGroupID)
        res.status(200).json({ status: 200, result: 'Device deleted from Device group successfully.' })

    } catch (e) {
        res.status(400).json({ status: 500, error: e.toString() })
    }
})

router.post('/createBulkDevices', async (req, res) => {
    let allSuccess = []
    let allErrors = []
    let errorCount = 0
    let successCount = 0
    let i = 0
    try {
        const data = req.body.data

        if(typeof data === 'undefined' || data === null ) {
            return res.status(400).json({ status: 400, error: 'Please provide data.' })
        }

        if(data.length == 0) {
            return res.status(200).json({ status: 200, result: { successCount, errorCount, success: allSuccess, errors: allErrors } })
        } else {
            for (i = 0; i < data.length; i++) {
                
                const { dhlDeviceID, uuID, serialNumber, macAddress, deviceName, protocol, deviceHealth, powerType, onboardedBy, deviceOwner, iotReady, status, deviceSpecID }  = data[i]

                let alphanumRex = new RegExp(/^[a-z\d\-_.@\s]+$/i)
                let errors = []

                if(typeof dhlDeviceID === 'undefined' || dhlDeviceID === null){
                    errors.push({
                        msg: "Please provide valid 'dhlDeviceID' value should be min 1 and max 50 chars long."
                    })

                } else if(!alphanumRex.test(dhlDeviceID) || !validator.isLength(dhlDeviceID, { min: 1, max: 50 })) {
                    errors.push({
                        msg: "Please provide valid 'dhlDeviceID' value should be min 1 and max 50 chars long."
                    })
                }

                if(typeof uuID === 'undefined' || uuID === null){
                    errors.push({
                        msg: "Please provide valid 'uuID' value should be min 1 and max 50 chars long."
                    })
                } else if (!alphanumRex.test(uuID) || !validator.isLength(uuID, { min: 1, max: 50 })) {
                    errors.push({
                        msg: "Please provide valid 'uuID' value should be min 1 and max 50 chars long."
                    })
                }
                if(typeof serialNumber === 'undefined' || serialNumber === null){
                    errors.push({
                        msg: "Please provide valid 'serialNumber' value should be min 1 and max 50 chars long."
                    })
                } else if (!alphanumRex.test(serialNumber) || !validator.isLength(serialNumber, { min: 1, max: 50 })) {
                    errors.push({
                        msg: "Please provide valid 'serialNumber' value should be min 1 and max 50 chars long."
                    })
                }

                if(typeof macAddress === 'undefined' || macAddress === null){
                    errors.push({
                        msg: "Please provide valid 'macAddress' value should be min 1 and max 100 chars long."
                    })
                } else if (!alphanumRex.test(macAddress) || !validator.isLength(macAddress, { min: 1, max: 100 })) {
                    errors.push({
                        msg: "Please provide valid 'macAddress' value should be min 1 and max 100 chars long."
                    })
                }
                if(typeof deviceName === 'undefined' || deviceName === null){
                    errors.push({
                        msg: "Please provide valid 'deviceName' value should be min 1 and max 30 chars long."
                    })
                } else if (!alphanumRex.test(deviceName) || !validator.isLength(deviceName, { min: 1, max: 30 })) {
                    errors.push({
                        msg: "Please provide valid 'deviceName' value should be min 1 and max 30 chars long."
                    })
                }
                if(typeof protocol === 'undefined' || protocol === null){
                    errors.push({
                        msg: "Please provide valid 'protocol' value should be min 1 and max 50 chars long."
                    })

                } else if(!alphanumRex.test(protocol) || !validator.isLength(protocol, { min: 1, max: 50 })) {
                    errors.push({
                        msg: "Please provide valid 'protocol' value should be min 1 and max 50 chars long."
                    })
                }
                if(typeof deviceHealth === 'undefined' || deviceHealth === null){
                    errors.push({
                        msg: "Please provide valid 'deviceHealth' value should be min 1 and max 50 chars long."
                    })

                } else if(!alphanumRex.test(deviceHealth) || !validator.isLength(deviceHealth, { min: 1, max: 50 })) {
                    errors.push({
                        msg: "Please provide valid 'deviceHealth' value should be min 1 and max 50 chars long."
                    })
                }
                if(typeof powerType === 'undefined' || powerType === null){
                    errors.push({
                        msg: "Please provide valid 'powerType' value should be min 1 and max 50 chars long."
                    })

                } else if(!alphanumRex.test(powerType) || !validator.isLength(powerType, { min: 1, max: 50 })) {
                    errors.push({
                        msg: "Please provide valid 'powerType' value should be min 1 and max 50 chars long."
                    })
                }
                if(typeof onboardedBy === 'undefined' || onboardedBy === null){
                    errors.push({
                        msg: "Please provide valid 'onboardedBy' value should be min 1 and max 50 chars long."
                    })

                } else if(!alphanumRex.test(onboardedBy) || !validator.isLength(onboardedBy, { min: 1, max: 50 })) {
                    errors.push({
                        msg: "Please provide valid 'onboardedBy' value should be min 1 and max 50 chars long."
                    })
                }
                if(typeof deviceOwner === 'undefined' || deviceOwner === null){
                    errors.push({
                        msg: "Please provide valid 'deviceOwner' value should be min 1 and max 50 chars long."
                    })

                } else if(!alphanumRex.test(deviceOwner) || !validator.isLength(deviceOwner, { min: 1, max: 50 })) {
                    errors.push({
                        msg: "Please provide valid 'deviceOwner' value should be min 1 and max 50 chars long."
                    })
                }

                if (errors.length > 0) {
                    let errObj = {
                        index: i,
                        errors: errors
                    }
    
                    allErrors.push(errObj)
                    errorCount = errorCount + 1

                    if (i == (data.length - 1)) {
                        res.status(200).json({ status: 200, result: { successCount, errorCount, success: allSuccess, errors: allErrors } })
                    }
                    continue
                } else {
                    const deviceData = {
                        dhlDeviceID, uuID, serialNumber, macAddress, deviceName, protocol, deviceHealth, powerType, onboardedBy, deviceOwner, iotReady, status, deviceSpecID
                    }

                    await devicesDB.createBulkDevices(deviceData)
                    .then(async (id) => {
                        let obj = {
                            index: i,
                            msg: `Device added successfully with the User ID = ${id} `,
                            deviceID: id
                        }
                        allSuccess.push(obj)
                        successCount = successCount + 1
                        if (i == (data.length - 1)) {
                            return res.status(200).json({ status: 200, result: { successCount, errorCount, success: allSuccess, errors: allErrors } })
                        }
                    }).catch(e => {
                        let obj = {
                            index: i,
                            errors: {
                                msg: e.toString()
                            }
                        }
                        allErrors.push(obj)
                        errorCount = errorCount + 1
                        if (i == (data.length - 1)) {
                            return res.status(200).json({ status: 200, result: { successCount, errorCount, success: allSuccess, errors: allErrors } })
                        }
                    })
                }
            }
        }
    } catch (e) {
        let errObj = {
            index: i,
            errors: {
                msg: e.toString()
            }
        }
        allErrors.push(errObj)
        errorCount = errorCount + 1
        return res.status(500).json({ status: 500, result: { successCount, errorCount, success: allSuccess, errors: allErrors } })
    }
})

router.get('/getDeviceTypes', async (req, res) => {
    try{
        const result = await devicesDB.getDeviceTypes()
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})


/*********************  Related to  DeviceSpec Table  *********************/

router.get('/getDeviceSpec', async (req, res) => {
    try{
        const result = await devicesDB.getDeviceSpec()
        res.status(200).json({ status : 200, result})
    } catch (e){
        res.status(500).json({ status : 500, error : e})
    }
})

router.get('/getDeviceSpecByID', async (req, res) => {
    try{
        const id = req.query.id

        req.checkQuery("id", "Please provide valid 'id' value ").notEmpty().isInt()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str));
            return res.status(400).json({  status : 400, error : errs })
        }

        const result = await devicesDB.getDeviceSpecByID(id)
        res.status(200).json({ status : 200, result})
    } catch (e){
        res.status(500).json({ status : 500, error : e})
    }
})

router.post('/createDeviceSpec', async (req, res) => {
    try{
        const { serviceProvider, apiURL, protocol, isPowerEnabled, isBatteryEnabled, isIOTEnabled, imgData, specFileData, object, intervalInSec, createdBy } = req.body

        req.checkBody("serviceProvider", "Please provide valid 'serviceProvider' value should be min 1 and max 100 chars long.").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("apiURL", "Please provide valid 'apiURL' value should be min 1 and max 200 chars long.").notEmpty().isLength({ min: 1, max:200 })

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str));
            return res.status(400).json({  status : 400, error : errs })
        }

        const data = { 
            serviceProvider, 
            apiURL, 
            protocol, 
            isPowerEnabled,
            isBatteryEnabled, 
            isIOTEnabled,
            object,
            intervalInSec,
            imgData : imgData|| '', 
            specFileData : specFileData || '',
            createdBy
        } 

        await devicesDB.createDeviceSpec(data)
        res.status(200).json({ status : 200, result : 'Device Spec added successfully.'})
    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.patch('/updateDeviceSpec', async (req, res) => {
    try{
        const { id, serviceProvider, apiURL, protocol, isPowerEnabled, isBatteryEnabled, isIOTEnabled, object, intervalInSec, imgData, specFileData, modifiedBy } = req.body

        req.checkBody("serviceProvider", "Please provide valid 'serviceProvider' value should be min 1 and max 100 chars long.").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("apiURL", "Please provide valid 'apiURL' value should be min 1 and max 200 chars long.").notEmpty().isLength({ min: 1, max:200 })
        
        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str));
            return res.status(400).json({  status : 400, error : errs })
        }
        const data = {
            id, 
            serviceProvider, 
            apiURL, 
            protocol, 
            isPowerEnabled,
            isBatteryEnabled, 
            isIOTEnabled,
            object,
            intervalInSec,
            imgData : imgData|| '', 
            specFileData : specFileData || '',
            modifiedBy
        }

        await devicesDB.updateDeviceSpec(data)
        res.status(200).json({ status : 200, result : 'Device Spec updated successfully.'})

    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getDeviceMetaDataByDeviceGroupID', async (req, res) => {
    try {
        const deviceGroupID = req.query.deviceGroupID

        req.checkQuery("deviceGroupID", "Please provide valid 'deviceGroupID' value ").notEmpty().isNumeric()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const result = await devicesDB.getDeviceMetaDataByDeviceGroupID(deviceGroupID)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/getDevicesByDeviceTypeID', async (req, res) => {
    try{
        const { deviceTypeID } = req.body

        const result = await devicesDB.getDevicesByDeviceTypeID(deviceTypeID)

        res.status(200).json({ status : 200, result })
    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.post('/getDevicesFromSigFox', async (req, res) => {
    try{

        const { username, password } = req.body

        var auth = new Buffer(username + ':' + password).toString('base64');
        var options = {
            url: 'https://api.sigfox.com/v2/devices',
            method: 'GET',
            headers: {
                Authorization: 'Basic ' + auth,
                'Content-Type': 'application/json'
            }
        };
    
        await request(options, function (error, response, body) { 
            if (error) {
                res.status(500).json({ status : 500, error : error.toString()})
            } else {
                const result = JSON.parse(body)

                res.status(200).json({ status : 200, result })
            }
        })
    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

module.exports = router
const express = require('express')
const validator = require('validator')
const applicationsDB = require('../db/applicationsDB')
const blobStorage = require('../azure/blobStorage')
const router = new express.Router()


router.post('/getApplications', async (req, res) => {
    try {

        let size = 10
        let page = 1
        let search = null
        let sortColumn = 'name'
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

        const result = await applicationsDB.getApplications(page, size, search, sortColumn, sortType)
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

router.post('/getAllApplications', async (req, res) => {
    try{
        const { userRole, userEmailID } = req.body
        const data = { userRole, userEmailID }
        const result = await applicationsDB.getAllApplications(data)
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getApplicationByID', async (req, res) => {
    try {
        const id = req.query.id

        req.checkQuery("id", "Please provide valid 'id' value ").notEmpty().isInt()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str));
            return res.status(400).json({ status: 400, error: errs })
        }

        const result = await applicationsDB.getApplicationByID(id)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.get('/getApplicationsByBuID', async (req, res) => {
    try {
        const buID = req.query.buID

        req.checkQuery("buID", "Please provide valid 'buID' value ").notEmpty().isNumeric()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str));
            return res.status(400).json({ status: 400, error: errs })
        }

        const result = await applicationsDB.getApplicationsByBuID(buID)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.get('/getApplicationsCount', async (req, res) => {
    try {
        const result = await applicationsDB.getApplicationsCount()
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/createApplication', async (req, res) => {
    try {
        const { appName, appOwner, appOwnerName, appStatus, appGroupName, appCreatedBy, resourceGroupName, appDescription, imgData, buID, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType, url } = req.body

        req.checkBody("appName", "Please provide valid 'appName' value should be min 1 and max 100 chars long").notEmpty().isLength({ min: 1, max: 100 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("appOwner", "Please provide valid 'appOwner' value should be min 1 and max 200 chars long").notEmpty().isLength({ min: 1, max: 200 }).matches(/^[a-z\d\-_.@\s]+$/i)
        req.checkBody("appOwnerName", "Please provide valid 'appOwnerName' value should be min 1 and max 100 chars long").notEmpty().isLength({ min: 1, max: 100 }).matches(/^[a-z\d\-_(),.\s]+$/i)
        req.checkBody("appStatus", "Please provide valid 'appStatus' value should be min 1 and max 30 chars long").notEmpty().isLength({ min: 1, max: 30 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("appGroupName", "Please provide valid 'appGroupName' value should be min 1 and max 30 chars long").notEmpty().isLength({ min: 1, max: 30 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("appCreatedBy", "Please provide valid 'appCreatedBy' value should be min 1 and max 200 chars long").notEmpty().isLength({ min: 1, max: 200 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("resourceGroupName", "Please provide valid 'resourceGroupName' value should be min 1 and max 200 chars long").notEmpty().isLength({ min: 1, max: 200 }).matches(/^[a-z\d\-_.(),\s]+$/i)
        req.checkBody("url", "Please provide valid 'url' value should be min 1 and max 300 chars long").notEmpty().isLength({ min: 1, max: 300 })

        if(typeof appDescription !== 'undefined' && appDescription !== null && appDescription !== ""){
            req.checkBody("appDescription", "Please provide valid 'appDescription' value should be min 1 and max 200 chars long").isLength({ min: 1, max: 200 }).matches(/^[a-z\d\-_\s]+$/i)
        }

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str));
            return res.status(400).json({ status: 400, error: errs })
        }

        let resourceGroupList = []

        await blobStorage.getAzureResourceGroups().then(async(list) => {
            resourceGroupList = list
        }).catch((e) => {
            resourceGroupList = []
        })

        if(!resourceGroupList.includes(resourceGroupName)){
            return res.status(400).json({ status: 400, error: "Invalid 'resourceGroupName' value" })
        }

        const data = {
            appName,
            appOwner,
            appOwnerName,
            appStatus,
            appGroupName,
            appCreatedBy,
            resourceGroupName,
            appDescription,
            imgData: imgData || '',
            buID, 
            parentID,
            parentName,
            parentType,
            grandParentID,
            grandParentName, 
            grandParentType,
            url
        }

        const appID = await applicationsDB.createApplication(data)
        res.status(200).json({ status: 200, result: `Application added successfully with ID = ${appID} ` })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.patch('/updateApplication', async (req, res) => {
    try {
        const { id, appName, appOwner, appOwnerName, appStatus, appGroupName, appModifiedBy, resourceGroupName, appDescription, imgData, buID, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType, url } = req.body

        req.checkBody("id", "Please provide valid 'id' value").notEmpty().isInt()
        req.checkBody("appName", "Please provide valid 'appName' value should be min 1 and max 100 chars long").notEmpty().isLength({ min: 1, max: 100 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("appOwner", "Please provide valid 'appOwner' value should be min 1 and max 200 chars long").notEmpty().isLength({ min: 1, max: 200 }).matches(/^[a-z\d\-_.@\s]+$/i)
        req.checkBody("appOwnerName", "Please provide valid 'appOwnerName' value should be min 1 and max 100 chars long").notEmpty().isLength({ min: 1, max: 100 }).matches(/^[a-z\d\-_(),.\s]+$/i)
        req.checkBody("appStatus", "Please provide valid 'appStatus' value should be min 1 and max 30 chars long").notEmpty().isLength({ min: 1, max: 30 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("appGroupName", "Please provide valid 'appGroupName' value should be min 1 and max 30 chars long").notEmpty().isLength({ min: 1, max: 30 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("appModifiedBy", "Please provide valid 'appModifiedBy' value should be min 1 and max 200 chars long").notEmpty().isLength({ min: 1, max: 200 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("resourceGroupName", "Please provide valid 'resourceGroupName' value should be min 1 and max 200 chars long").notEmpty().isLength({ min: 1, max: 200 }).matches(/^[a-z\d\-_.(),\s]+$/i)
        req.checkBody("url", "Please provide valid 'url' value should be min 1 and max 300 chars long").notEmpty().isLength({ min: 1, max: 300 })
        
        if(typeof appDescription !== 'undefined' && appDescription !== null && appDescription !== ""){
            req.checkBody("appDescription", "Please provide valid 'appDescription' value should be min 1 and max 200 chars long").isLength({ min: 1, max: 200 }).matches(/^[a-z\d\-_\s]+$/i)
        }

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        let resourceGroupList = []

        await blobStorage.getAzureResourceGroups().then(async(list) => {
            resourceGroupList = list
        }).catch((e) => {
            resourceGroupList = []
        })

        if(!resourceGroupList.includes(resourceGroupName)){
            return res.status(400).json({ status: 400, error: "Invalid 'resourceGroupName' value" })
        }

        const data = {
            id,
            appName,
            appOwner,
            appOwnerName,
            appStatus,
            appGroupName,
            appModifiedBy,
            resourceGroupName,
            appDescription,
            imgData: imgData || '',
            buID,
            parentID,
            parentName,
            parentType,
            grandParentID,
            grandParentName,
            grandParentType,
            url
        }

        await applicationsDB.updateApplication(data)
        res.status(200).json({ status: 200, result: 'Application updated successfully.' })

    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.delete('/deleteApplication', async (req, res) => {
    try {
        const { id } = req.query

        req.checkQuery("id", "Please provide valid 'id' value").notEmpty().isInt()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        await applicationsDB.deleteApplication(id)
        res.status(200).json({ status: 200, result: 'Application deleted successfully.' })

    } catch (e) {
        res.status(400).json({ status: 500, error: e.toString() })
    }
})

router.post('/createBulkApplications', async (req, res) => {
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
        
        let resourceGroupList = []

        await blobStorage.getAzureResourceGroups().then(async(list) => {
            resourceGroupList = list
        }).catch((e) => {
            resourceGroupList = []
        })

        if(data.length == 0) {
            return res.status(200).json({ status: 200, result: { successCount, errorCount, success: allSuccess, errors: allErrors } })
        } else {
            for (i = 0; i < data.length; i++) {
                const { appName, appOwner, appOwnerName, appStatus, appGroupName, appCreatedBy, resourceGroupName, appDescription, appurl } = data[i]

                let alphanumRex = new RegExp(/^[a-z\d\-_.(),@\s]+$/i)
                let errors = []

                if(typeof appName === 'undefined' || appName === null){
                    errors.push({
                        msg: "Please provide valid 'appName' value should be min 1 and max 100 chars long."
                    })

                } else if(!alphanumRex.test(appName) || !validator.isLength(appName, { min: 1, max: 100 })) {
                    errors.push({
                        msg: "Please provide valid 'appName' value should be min 1 and max 100 chars long."
                    })
                }

                if(typeof appOwner === 'undefined' || appOwner === null){
                    errors.push({
                        msg: "Please provide valid 'appOwner' value should be min 1 and max 200 chars long."
                    })
                } else if (!alphanumRex.test(appOwner) || !validator.isLength(appOwner, { min: 1, max: 200 })) {
                    errors.push({
                        msg: "Please provide valid 'appOwner' value should be min 1 and max 200 chars long."
                    })
                }
                if(typeof appOwnerName === 'undefined' || appOwnerName === null){
                    errors.push({
                        msg: "Please provide valid 'appOwnerName' value should be min 1 and max 100 chars long."
                    })

                } else if(!alphanumRex.test(appOwnerName) || !validator.isLength(appOwnerName, { min: 1, max: 100 })) {
                    errors.push({
                        msg: "Please provide valid 'appOwnerName' value should be min 1 and max 100 chars long."
                    })
                }
                if(typeof appStatus === 'undefined' || appStatus === null){
                    errors.push({
                        msg: "Please provide valid 'appStatus' value should be min 1 and max 30 chars long."
                    })
                } else if (!alphanumRex.test(appStatus) || !validator.isLength(appStatus, { min: 1, max: 30 })) {
                    errors.push({
                        msg: "Please provide valid 'appStatus' value should be min 1 and max 30 chars long."
                    })
                }

                if(typeof appGroupName === 'undefined' || appGroupName === null){
                    errors.push({
                        msg: "Please provide valid 'appGroupName' value should be min 1 and max 30 chars long."
                    })
                } else if (!alphanumRex.test(appGroupName) || !validator.isLength(appGroupName, { min: 1, max: 30 })) {
                    errors.push({
                        msg: "Please provide valid 'appGroupName' value should be min 1 and max 30 chars long."
                    })
                }
                if(typeof appCreatedBy === 'undefined' || appCreatedBy === null){
                    errors.push({
                        msg: "Please provide valid 'appCreatedBy' value should be min 1 and max 30 chars long."
                    })
                } else if (!alphanumRex.test(appCreatedBy) || !validator.isLength(appCreatedBy, { min: 1, max: 30 })) {
                    errors.push({
                        msg: "Please provide valid 'appCreatedBy' value should be min 1 and max 30 chars long."
                    })
                }

                if(typeof resourceGroupName === 'undefined' || resourceGroupName === null){
                    errors.push({
                        msg: "Please provide valid 'resourceGroupName' value should be min 1 and max 30 chars long."
                    })
                } else if(!alphanumRex.test(resourceGroupName) || !validator.isLength(resourceGroupName, { min: 1, max:200 })){
                    errors.push({
                        msg : "Please provide valid 'resourceGroupName' value should be min 1 and max 200 chars long."
                    })
                } else if(!resourceGroupList.includes(resourceGroupName)){
                    errors.push({
                        msg : "Invalid 'resourceGroupName' value"
                    })
                }

                if(typeof appDescription !== 'undefined' && appDescription !== null && appDescription !== ''){
                    if (!alphanumRex.test(appDescription) || !validator.isLength(appDescription, { min: 1, max: 200 })) {
                        errors.push({
                            msg: "Please provide valid 'appDescription' value should be min 1 and max 200 chars long."
                        })
                    }
                }

                if(typeof appurl === 'undefined' || appurl === null){
                    errors.push({
                        msg: "Please provide valid 'appurl' value should be min 1 and max 300 chars long."
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
                    const appData = {
                        appName,
                        appOwner,
                        appOwnerName,
                        appStatus,
                        appGroupName,
                        appCreatedBy,
                        resourceGroupName,
                        appDescription,
                        url : appurl
                    }

                    await applicationsDB.createBulkApplications(appData)
                    .then(async (appId) => {
                        let obj = {
                            index: i,
                            msg: `Application added successfully with ID = ${appId} `,
                            appID: appId
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

router.post('/deleteBulkApplications', async (req, res) => {
    try {
        const { appIDs } = req.body
        for(let i = 0; i < appIDs.length; i++) {
            await applicationsDB.deleteApplication(appIDs[i])
        }
        res.status(200).json({ status : 200, Result : "Applications Deleted Succesfully" })     
    
    } catch (e){
        res.status(400).json({ status : 500, error : e.toString()})
    }
})

router.get('/getWeekAppCounts', async (req, res) => {
    try{
        const result = await applicationsDB.getWeekAppCounts()
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getNotAssociatedApplications', async (req, res) => {
    try{
        const result = await applicationsDB.getNotAssociatedApplications()
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.post('/associateApplication', async (req, res) => {
    try{
        const { appID, appName, parentID, parentName, parentType }  = req.body

        req.checkBody("appID", "Please provide valid 'App ID' value").notEmpty().isNumeric()
        req.checkBody("appName", "Please provide valid 'appName' value").notEmpty()
        req.checkBody("parentID", "Please provide valid 'parentID' value").notEmpty().isNumeric()
        req.checkBody("parentName", "Please provide valid 'parentName' value").notEmpty()
        req.checkBody("parentType", "Please provide valid 'parentType' value").notEmpty()
        
        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const data = { appID, appName, parentID, parentName, parentType, grandParentID : null, grandParentName : null, grandParentType : null }
        
        await applicationsDB.associateApplication(data)

        res.status(200).json({ status : 200, result : 'Application Associated successfully.'})

    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})



module.exports = router
const express = require('express')
const validator = require('validator')
const usersDB = require('../db/usersDB')
const userGroupDB = require('../db/userGroupsDB')
//const associationsDB = require('../db/associationsDB')
const associationsDB = require('../dummy/treeAssociationDB')
const activityRBACDB = require('../db/roleBasedActivitiesDB')
const router = new express.Router()

router.post('/getUsers', async (req, res) => {
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

        console.log(search, 'search')

        const result = await usersDB.getUsers(page, size, search, sortColumn, sortType)
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

router.post('/getAllUsers', async (req, res) => {
    try{
        const { userRole, userEmailID } = req.body
        const data = { userRole, userEmailID } 
        const result = await usersDB.getAllUsers(data)
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getUserByID', async (req, res) => {
    try {
        const id = req.query.id

        req.checkQuery("id", "Please provide valid 'id' value ").notEmpty().isNumeric()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const result = await usersDB.getUserByID(id)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.get('/getUsersCount', async (req, res) => {
    try {
        const result = await usersDB.getUsersCount()
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.get('/getUserByEmail', async (req, res) => {
    try {
        const email = req.query.email

        req.checkQuery("email", "Please provide valid 'email' value ").notEmpty().isEmail().isLength({ min: 1, max: 200 })
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const result = await usersDB.getUserByEmail(email)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.get('/getUsersByUserGroupID', async (req, res) => {
    try {
        const userGroupID = req.query.userGroupID

        req.checkQuery("userGroupID", "Please provide valid 'userGroupID' value ").notEmpty().isNumeric()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const result = await usersDB.getUsersByUserGroupID(userGroupID)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/createUser', async (req, res) => {
    try {
        //const { name, email, contact, designation, address, appId, createdBy } = req.body

        //req.checkBody("name", "Please provide valid 'name' value should be min 1 and max 50 chars long").notEmpty().isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
        //req.checkBody("email", "Please provide valid 'email' value should be min 1 and max 30 chars long").notEmpty().isEmail().isLength({ min: 1, max: 30 })
        //req.checkBody("contact", "Please provide valid 'contact' value should be min 1 and max 15 chars long").notEmpty().isNumeric().isLength({ min: 1, max: 15 })
        //req.checkBody("designation", "Please provide valid 'designation' value should be min 1 and max 30 chars long").notEmpty().isLength({ min: 1, max: 30 }).matches(/^[a-z\d\-_\s]+$/i)
        //req.checkBody("address", "Please provide valid 'address' value should be min 1 and max 100 chars long").notEmpty().isLength({ min: 1, max: 100 }).matches(/^[a-z\d\-_\s]+$/i)
        //req.checkBody("createdBy", "Please provide valid 'createdBy' value should be min 1 and max 30 chars long.").notEmpty().isLength({ min: 1, max:30 }).matches(/^[a-z\d\-_@.\s]+$/i)

         const { firstName, lastName, displayName, isDislayNamePrimary, gender, email, landLine, mobile, designation, dataOfBirth, country, state, city, street, pincode, appIDs, createdBy, imgData, userGroupIDs } = req.body

         req.checkBody("firstName", "Please provide valid 'firstName' value should be min 1 and max 50 chars long").notEmpty().isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
         req.checkBody("lastName", "Please provide valid 'lastName' value should be min 1 and max 50 chars long").isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
         req.checkBody("displayName", "Please provide valid 'displayName' value should be min 1 and max 50 chars long").isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
         req.checkBody("isDislayNamePrimary", "Please provide valid 'isDislayNamePrimary' value").isBoolean()
         req.checkBody("gender", "Please provide valid 'gender' value should be min 1 and max 10 chars long").isLength({ min: 1, max: 10 }).matches(/^[a-z\d\-_\s]+$/i)
         req.checkBody("email", "Please provide valid 'email' value should be min 1 and max 100 chars long").notEmpty().isEmail().isLength({ min: 1, max: 100 })
         req.checkBody("landLine", "Please provide valid 'landLine' value should be min 1 and max 30 chars long").isLength({ min: 1, max: 30 })
         req.checkBody("mobile", "Please provide valid 'mobile' value should be min 1 and max 30 chars long").isLength({ min: 1, max: 30 })
         req.checkBody("designation", "Please provide valid 'designation' value should be min 1 and max 50 chars long").isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
         req.checkBody("dataOfBirth", "Please provide valid 'dataOfBirth' value should be min 1 and max 30 chars long").isLength({ min: 1, max: 30 }).matches(/^[a-z\d\-_\s]+$/i)
         req.checkBody("country", "Please provide valid 'country' value should be min 1 and max 50 chars long").isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
         req.checkBody("state", "Please provide valid 'state' value should be min 1 and max 50 chars long").isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
         req.checkBody("city", "Please provide valid 'city' value should be min 1 and max 50 chars long").isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
         req.checkBody("street", "Please provide valid 'street' value should be min 1 and max 50 chars long").isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
         req.checkBody("createdBy", "Please provide valid 'createdBy' value should be min 1 and max 100 chars long.").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_@.\s]+$/i)

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        //const data = { name, email, contact, designation, address, appId, createdBy }
        const data = { firstName, lastName, displayName, isDislayNamePrimary, gender, email, landLine, mobile, designation, dataOfBirth, country, state, city, street, pincode, appIDs, createdBy, imgData, userGroupIDs }
        const userId = await usersDB.createUser(data)

        res.status(200).json({ status: 200, result: `User added successfully with the User ID : ${userId}` })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

/* Not Used
router.post('/createUsersWithUserGroups', async (req, res) => {
    try {
        const { buID, appID, userGroups } = req.body

        if(typeof userGroups !== "undefined" && userGroups !== null && userGroups !== "") {
            for(let i = 0; i < userGroups.length; i++) {

                let { userGroupID, userGroupName, createdBy, users } = userGroups[i]

                if(userGroupID != '' && userGroupID != null){
                    
                    //const userGroupResult = await userGroupDB.getUserGroupByUserGroupName(userGroupName)

                    const checkEntity = await associationsDB.getAssociationsByEntity(userGroupID, 'User Group')
                    if(checkEntity.length > 0){

                        if(appID != null && appID != "") {
                            const ugData = { userGroupID, appID }
                            await userGroupDB.updateAssociatedUserGroups(ugData)

                        } else {
                            const ugData = { userGroupID, buID }
                            await userGroupDB.updateAssociatedUserGroupForBu(ugData)
                        }

                    } else {
                        if(appID != null && appID != "") {
                            const assocUGData = { appID, userGroupID }
                            await userGroupDB.associateUserGroups(assocUGData)

                        } else {
                            const assocUGData = { buID, userGroupID }
                            await userGroupDB.associateUserGroupForBu(assocUGData)
                        }
                    }
                    
                } else {

                    const ugData = { userGroupName, createdBy, appID }
                    userGroupID = await userGroupDB.createUserGroups(ugData)

                    if(appID != null && appID != "") {
                        const assocUGData = { appID, userGroupID }
                        await userGroupDB.associateUserGroups(assocUGData)

                    } else {
                        const assocUGData = { buID, userGroupID }
                        await userGroupDB.associateUserGroupForBu(assocUGData)
                    }


                }

                if(typeof users !== "undefined" && users !== null && users !== "") {

                    for(let j = 0; j < users.length; j++) {

                        const { firstname : firstName, email, createdBy, lastName, displayName, isDislayNamePrimary, gender, landLine, mobile, designation, dataOfBirth, country, state, city, street, pincode, imgData } = users[j]
                        const userResult = await usersDB.getUserByEmail(email)
                        let userID = 0

                        let userData = { 
                            firstName, 
                            lastName : lastName || '', 
                            displayName : displayName || '', 
                            isDislayNamePrimary : isDislayNamePrimary || false,
                            gender : gender || '', 
                            email, 
                            landLine : landLine || '',
                            mobile : mobile || '', 
                            designation : designation || '',
                            dataOfBirth : dataOfBirth || '', 
                            country : country || '', 
                            state : state || '', 
                            city : city || '', 
                            street : street || '', 
                            pincode : pincode || '', 
                            imgData : imgData || '', 
                            createdBy : createdBy
                         }


                        if(userResult.length > 0) {

                            userID = userResult[0].id

                            userData.id = userID
                            userData.modifiedBy = createdBy

                            await usersDB.updateUserProfile(userData)

                        } else {
                            userID = await usersDB.createUserProfile(userData)
                        }

                        const result = await usersDB.getUserAssocByUserandUserGroupID(userID, userGroupID)

                        let userAssocData = { userGroupID, userID, appID, buID }

                        if(result.length > 0){
                            userAssocData.id = result[0].id
                            await usersDB.updateUserAssociations(userAssocData)

                        } else {
                            await usersDB.createUserAssociations(userAssocData)
                        }
                    }
                }
            }
            res.status(200).json({ status: 200, result: `Users added successfully With userGroups` })
        }
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})*/

router.patch('/updateUser', async (req, res) => {
    try {
        
        const { id, firstName, email, mobile, country, state, city, street, pincode, modifiedBy, imgData } = req.body

        req.checkBody("id", "Please provide valid 'id' value").notEmpty().isNumeric()
        //req.checkBody("firstName", "Please provide valid 'firstName' value should be min 1 and max 100 chars long").notEmpty().isLength({ min: 1, max: 100 }).matches(/^[a-z\d\-_(),.\s]+$/i)
        req.checkBody("firstName", "Please provide valid 'firstName' value should be min 1 and max 100 chars long").notEmpty().isLength({ min: 1, max: 100 })
        req.checkBody("email", "Please provide valid 'email' value should be min 1 and max 30 chars long").notEmpty().isEmail().isLength({ min: 1, max: 30 })
        req.checkBody("modifiedBy", "Please provide valid 'modifiedBy' value should be min 1 and max 30 chars long.").notEmpty().isLength({ min: 1, max:30 }).matches(/^[a-z\d\-_@.\s]+$/i)

        if(typeof mobile !== 'undefined' && mobile !== null && mobile !== "") {
            req.checkBody("mobile", "Please provide valid 'mobile' value should be min 1 and max 15 chars long").isNumeric().isLength({ min: 1, max: 15 })
        }
        if(typeof country !== 'undefined' && country !== null && country !== "") {
            req.checkBody("country", "Please provide valid 'country' value should be min 1 and max 50 chars long").isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
        }
        if(typeof state !== 'undefined' && state !== null && state !== "") {
            req.checkBody("state", "Please provide valid 'state' value should be min 1 and max 50 chars long").isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
        }
        if(typeof city !== 'undefined' && city !== null && city !== "") {
            req.checkBody("city", "Please provide valid 'city' value should be min 1 and max 50 chars long").isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
        }
        if(typeof street !== 'undefined' && street !== null && street !== "") {
            req.checkBody("street", "Please provide valid 'street' value should be min 1 and max 50 chars long").isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
        }


        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const data = { id, firstName, email, mobile, country, state, city, street, pincode, modifiedBy, imgData }
        await usersDB.updateUser(data)
        res.status(200).json({ status: 200, result: 'User updated successfully.' })

    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.patch('/updateUserProfile', async (req, res) => {
    try {
        
        const { id, firstName, lastName, displayName, isDislayNamePrimary, gender, email, landLine, mobile, designation, dataOfBirth, country, state, city, street, pincode, modifiedBy, imgData } = req.body

        req.checkBody("id", "Please provide valid 'id' value").notEmpty().isNumeric()
        req.checkBody("firstName", "Please provide valid 'firstName' value should be min 1 and max 100 chars long").notEmpty().isLength({ min: 1, max: 100 }).matches(/^[a-z\d\-_(),.\s]+$/i)
        req.checkBody("email", "Please provide valid 'email' value should be min 1 and max 30 chars long").notEmpty().isEmail().isLength({ min: 1, max: 30 })
        req.checkBody("modifiedBy", "Please provide valid 'modifiedBy' value should be min 1 and max 30 chars long.").notEmpty().isLength({ min: 1, max:30 }).matches(/^[a-z\d\-_@.\s]+$/i)
        req.checkBody("isDislayNamePrimary", "Please provide valid 'isDislayNamePrimary' value").isBoolean()

        if(typeof lastName !== 'undefined' && lastName !== null && lastName !== "") {
            req.checkBody("lastName", "Please provide valid 'lastName' value should be min 1 and max 50 chars long").isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
        }
        if(typeof displayName !== 'undefined' && displayName !== null && displayName !== "") {
            req.checkBody("displayName", "Please provide valid 'displayName' value should be min 1 and max 50 chars long").isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
        }
        if(typeof gender !== 'undefined' && gender !== null && gender !== "") {
            req.checkBody("gender", "Please provide valid 'gender' value should be min 1 and max 50 chars long").isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
        }
        if(typeof landLine !== 'undefined' && landLine !== null && landLine !== "") {
            req.checkBody("landLine", "Please provide valid 'landLine' value should be min 1 and max 15 chars long").isNumeric().isLength({ min: 1, max: 15 })
        }
        if(typeof mobile !== 'undefined' && mobile !== null && mobile !== "") {
            req.checkBody("mobile", "Please provide valid 'mobile' value should be min 1 and max 15 chars long").isNumeric().isLength({ min: 1, max: 15 })
        }
        if(typeof designation !== 'undefined' && designation !== null && designation !== "") {
            req.checkBody("designation", "Please provide valid 'designation' value should be min 1 and max 30 chars long").isLength({ min: 1, max: 30 }).matches(/^[a-z\d\-_\s]+$/i)
        }
        if(typeof dataOfBirth !== 'undefined' && dataOfBirth !== null && dataOfBirth !== "") {
            req.checkBody("dataOfBirth", "Please provide valid 'dataOfBirth' value should be min 1 and max 30 chars long").isLength({ min: 1, max: 30 }).matches(/^[a-z\d\-_\s]+$/i)
        }
        if(typeof country !== 'undefined' && country !== null && country !== "") {
            req.checkBody("country", "Please provide valid 'country' value should be min 1 and max 50 chars long").isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
        }
        if(typeof state !== 'undefined' && state !== null && state !== "") {
            req.checkBody("state", "Please provide valid 'state' value should be min 1 and max 50 chars long").isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
        }
        if(typeof city !== 'undefined' && city !== null && city !== "") {
            req.checkBody("city", "Please provide valid 'city' value should be min 1 and max 50 chars long").isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
        }
        if(typeof street !== 'undefined' && street !== null && street !== "") {
            req.checkBody("street", "Please provide valid 'street' value should be min 1 and max 50 chars long").isLength({ min: 1, max: 50 }).matches(/^[a-z\d\-_\s]+$/i)
        }
        

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const data = { id, firstName, lastName, displayName, isDislayNamePrimary, gender, email, landLine, mobile, designation, dataOfBirth, country, state, city, street, pincode, modifiedBy, imgData }
        await usersDB.updateUserProfile(data)
        res.status(200).json({ status: 200, result: 'User updated successfully.' })

    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.delete('/deleteUser', async (req, res) => {
    try {
        const { id } = req.query

        req.checkQuery("id", "Please provide valid 'id' value").notEmpty().isNumeric()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        await usersDB.deleteUser(id)
        res.status(200).json({ status: 200, result: 'User deleted successfully.' })

    } catch (e) {
        res.status(400).json({ status: 500, error: e.toString() })
    }
})

router.delete('/deleteUserFromUserGroup', async (req, res) => {
    try {
        const { userID, userGroupID } = req.body

        req.checkBody("userID", "Please provide valid 'userID' value").notEmpty().isNumeric()
        req.checkBody("userGroupID", "Please provide valid 'userGroupID' value").notEmpty().isNumeric()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        await usersDB.deleteUserFromUserGroup(userID, userGroupID)
        res.status(200).json({ status: 200, result: 'User deleted from User group successfully.' })

    } catch (e) {
        res.status(400).json({ status: 500, error: e.toString() })
    }
})

router.post('/createBulkUsers', async (req, res) => {
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

                const { firstName, email, mobile, designation, country, state, city, street, createdBy } = data[i]

                let alphanumRex = new RegExp(/^[a-z\d\-_.@\s]+$/i)
                let phoneRex = new RegExp(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/)
                let errors = []

                if(typeof firstName === 'undefined' || firstName === null){
                    errors.push({
                        msg: "Please provide valid 'firstName' value should be min 1 and max 50 chars long."
                    })

                } else if(!alphanumRex.test(firstName) || !validator.isLength(firstName, { min: 1, max: 50 })) {
                    errors.push({
                        msg: "Please provide valid 'firstName' value should be min 1 and max 50 chars long."
                    })
                }

                if(typeof email === 'undefined' || email === null){
                    errors.push({
                        msg: "Please provide valid 'email' value should be min 1 and max 30 chars long."
                    })
                } else if (!alphanumRex.test(email) || !validator.isLength(email, { min: 1, max: 30 })) {
                    errors.push({
                        msg: "Please provide valid 'email' value should be min 1 and max 30 chars long."
                    })
                }
                // if(typeof mobile === 'undefined' || mobile === null){
                //     errors.push({
                //         msg: "Please provide valid 'mobile' value should be min 1 and max 15 chars long."
                //     })
                // } else if (!phoneRex.test(mobile) || !validator.isLength(mobile, { min: 1, max: 15 })) {
                //     errors.push({
                //         msg: "Please provide valid 'mobile' value should be min 1 and max 15 chars long."
                //     })
                // }

                if(typeof designation === 'undefined' || designation === null){
                    errors.push({
                        msg: "Please provide valid 'designation' value should be min 1 and max 30 chars long."
                    })
                } else if (!alphanumRex.test(designation) || !validator.isLength(designation, { min: 1, max: 30 })) {
                    errors.push({
                        msg: "Please provide valid 'designation' value should be min 1 and max 30 chars long."
                    })
                }
                if(typeof country === 'undefined' || country === null){
                    errors.push({
                        msg: "Please provide valid 'country' value should be min 1 and max 100 chars long."
                    })
                } else if (!alphanumRex.test(country) || !validator.isLength(country, { min: 1, max: 100 })) {
                    errors.push({
                        msg: "Please provide valid 'country' value should be min 1 and max 100 chars long."
                    })
                }
                if(typeof state === 'undefined' || state === null){
                    errors.push({
                        msg: "Please provide valid 'state' value should be min 1 and max 100 chars long."
                    })
                } else if (!alphanumRex.test(state) || !validator.isLength(state, { min: 1, max: 100 })) {
                    errors.push({
                        msg: "Please provide valid 'state' value should be min 1 and max 100 chars long."
                    })
                }
                if(typeof city === 'undefined' || city === null){
                    errors.push({
                        msg: "Please provide valid 'city' value should be min 1 and max 100 chars long."
                    })
                } else if (!alphanumRex.test(city) || !validator.isLength(city, { min: 1, max: 100 })) {
                    errors.push({
                        msg: "Please provide valid 'city' value should be min 1 and max 100 chars long."
                    })
                }
                if(typeof street === 'undefined' || street === null){
                    errors.push({
                        msg: "Please provide valid 'street' value should be min 1 and max 100 chars long."
                    })
                } else if (!alphanumRex.test(street) || !validator.isLength(street, { min: 1, max: 100 })) {
                    errors.push({
                        msg: "Please provide valid 'street' value should be min 1 and max 100 chars long."
                    })
                }
                if(typeof createdBy === 'undefined' || createdBy === null){
                    errors.push({
                        msg: "Please provide valid 'createdBy' value should be min 1 and max 30 chars long."
                    })
                } else if (!alphanumRex.test(createdBy) || !validator.isLength(createdBy, { min: 1, max: 30 })) {
                    errors.push({
                        msg: "Please provide valid 'createdBy' value should be min 1 and max 30 chars long."
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
                    const userData = {
                        firstName, email, mobile, designation, country, state, city, street, createdBy
                    }

                    await usersDB.createBulkUsers(userData)
                    .then(async (id) => {
                        let obj = {
                            index: i,
                            msg: `User added successfully with the User ID = ${id} `,
                            userID: id
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

router.post('/updateFavoriteMenu', async (req, res) => {
    try {
        const { userID, userfavoriteMenu } = req.body

        req.checkBody("userID", "Please provide valid 'userID' value").notEmpty().isNumeric()
        //req.checkBody("userfavoriteMenu", "Please provide valid 'userfavoriteMenu' value").notEmpty().isBoolean()

        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const data = { userID, userfavoriteMenu }
        await usersDB.updateFavoriteMenu(data)

        res.status(200).json({ status: 200, result: `Added App into favorite successfully` })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/updateUserLastLogin', async (req, res) => {
    try {
        const { userID } = req.body

        req.checkBody("userID", "Please provide valid 'userID' value").notEmpty().isNumeric()

        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        await usersDB.updateUserLastLogin(userID)

        res.status(200).json({ status: 200, result: `User last login updated successfully` })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/createUsersWithUserGroupsForAngular', async (req, res) => {
    try {

        let { userGroupID, userGroupName, parentID, parentName, parentType, createdBy, users, newUsers, removedUsers} = req.body

        let appID = null
        let buID = null
        
        if(parentID != null && parentName != "" && parentType != ""){
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
        }
        
        if(userGroupID != null) {

            if(typeof newUsers !== "undefined" && newUsers !== null && newUsers !== "") {

                await userOperation(newUsers, userGroupID, appID, buID, createdBy)
            }

            if(typeof removedUsers !== "undefined" && removedUsers !== null && removedUsers !== "") {
                for(let i = 0; i < removedUsers.length; i++){
                    if(removedUsers[i] != null) {
                     const deleteUserAssocData = { userID : removedUsers[i].id, userGroupID }
                     await usersDB.deleteUserAssociation(deleteUserAssocData)
                    }
                }
            }

        } else {

            const ugData = { userGroupName,  createdBy }
            userGroupID = await userGroupDB.createUserGroups(ugData)
            if(parentID != null && parentName != null && parentType != null){
                const ugAssocData = { userGroupID, userGroupName, parentID, parentName, parentType, grandParentID : null, grandParentName : null, grandParentType : null }
                await userGroupDB.associateUserGroup(ugAssocData)
                
                const roleResult = await activityRBACDB.getRoleIDByRoleName('Default App User Role')

                if(roleResult.length > 0) {
                    const roleID = roleResult[0].id

                    const roleMappingResult = await activityRBACDB.getRoleMappingToUserGroup(roleID, userGroupID)

                    if(roleMappingResult.length < 1){
                        const roleMapData = { roleID : roleID, userGroupID : userGroupID, createdBy : createdBy }
                        await activityRBACDB.createRoleMappingToUserGroup(roleMapData)
                    }
                    
                }
                
            }

            if(typeof users !== "undefined" && users !== null && users !== "") {

                await userOperation(users, userGroupID, appID, buID, createdBy)
            }
        }
    
      res.status(200).json({ status: 200, result: `Users added successfully With UserGroups` })
        
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

const userOperation = async (users, userGroupID, appID, buID, createdBy) => {

    for(let j = 0; j < users.length; j++) {

        const { firstname : firstName, email } = users[j]
        const userResult = await usersDB.getUserByEmail(email)
        let userID = 0

        let userData = { 
            firstName, 
            email, 
            createdBy : createdBy
         }

        if(userResult.length == 0) {

            userData.lastName = ''
            userData.displayName = ''
            userData.isDislayNamePrimary = false
            userData.gender = ''
            userData.landLine = ''
            userData.mobile = ''
            userData.designation = ''
            userData.dataOfBirth = ''
            userData.country = ''
            userData.state = ''
            userData.city = ''
            userData.street = ''
            userData.pincode = ''
            userData.imgData = ''

            userID = await usersDB.createUserProfile(userData)

        } else {
            userID = userResult[0].id
        }

        const result = await usersDB.getUserAssocByUserandUserGroupID(userID, userGroupID)
        let userAssocData = { userGroupID, userID, appID, buID }

        if(result.length > 0){
            await usersDB.updateUserAssociationByUserAndUserGroupID(userAssocData)
        } else {
            await usersDB.createUserAssociations(userAssocData)
        }
    }
}


module.exports = router
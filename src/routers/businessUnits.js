const express = require('express')
const businessUnitsDB = require('../db/businessUnitsDB')
const router = new express.Router()

router.post('/getBusinessUnits', async (req, res) => {
    try{
        let size = 10
        let page = 1
        let search = null
        let sortColumn = 'name'
        let sortType = 1

        if(typeof req.body.pageSize !== 'undefined' && req.body.pageSize !== null){
            size = req.body.pageSize
        }

        if(typeof req.body.pageNumber !== 'undefined' && req.body.pageNumber !== null){
            page = req.body.pageNumber
        }

        if(typeof req.body.search !== 'undefined' && req.body.search !== null){
            search = req.body.search
        }

        if(typeof req.body.sortColumn !== 'undefined' && req.body.sortColumn !== null){
            sortColumn = req.body.sortColumn
        }

        if(typeof req.body.sortType !== 'undefined' && req.body.sortType !== null){
            sortType = req.body.sortType
        }        

        const result = await businessUnitsDB.getBusinessUnits(page, size, search, sortColumn, sortType)
        let extraPage = 0

        if((result.totalrows)%(size) > 1){
            extraPage = 1
        }

        let totalPages = Math.floor((result.totalrows) / (size))  + extraPage

        let outputJson = {
            "meta": {
              "totalPages": totalPages == 0 ? 1 : totalPages,
              "currentPage": parseInt(page),
              "nextPage": totalPages == 0 ? 0 : parseInt(page)+1,
              "prevPage": ( parseInt(page)-1 < 1 ) ? 0 : parseInt(page)-1
            },
            "data": result.rows
        }   

        res.status(200).json({ status : 200, result: outputJson})

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getAllBusinessUnits', async (req, res) => {
    try{
        const result = await businessUnitsDB.getAllBusinessUnits()
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getBusinessUnitByID', async (req, res) => {
    try{
        const id = req.query.id

        req.checkQuery("id", "Please provide valid 'id' value ").notEmpty().isInt()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const result = await businessUnitsDB.getBusinessUnitByID(id)
        res.status(200).json({ status : 200, result})
    } catch (e){
        res.status(500).json({ status : 500, error : e})
    }
})

router.get('/getBusinessUnitsCount', async (req, res) => {
    try {
        const result = await businessUnitsDB.getBusinessUnitsCount()
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/createBusinessUnit', async (req, res) => {
    try{
        const { name, shortName, description, owner, createdBy, userGroup, imgData, createdDate }  = req.body

        req.checkBody("name", "Please provide valid 'name' value should be min 1 and max 100 chars long.").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("shortName", "Please provide valid 'shortName' value should be min 1 and max 30 chars long.").notEmpty().isLength({ min: 1, max:30 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("owner", "Please provide valid 'owner' value should be min 1 and max 100 chars long.").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_@.\s]+$/i)
        req.checkBody("createdBy", "Please provide valid 'createdBy' value should be min 1 and max 100 chars long.").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_@.\s]+$/i)
        req.checkBody("createdDate", "Please provide valid 'createdDate' value").notEmpty()

        if(typeof description !== 'undefined' && description !== null && description !== ""){
            req.checkBody("description", "Please provide valid 'description' value should be min 1 and max 200 chars long").isLength({ min: 1, max:200 }).matches(/^[a-z\d\-_\s]+$/i)
        }
        if(typeof userGroup !== 'undefined' && userGroup !== null && userGroup !== ""){
            req.checkBody("userGroup", "Please provide valid 'userGroup' value should be min 1 and max 100 chars long.").isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_\s]+$/i)
        }

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const data = { 
            name : name.trim(),
            shortName : shortName.trim(), 
            description : description || '',
            owner : owner.trim(), 
            createdBy : createdBy.trim(), 
            userGroup : userGroup || '',
            imgData : imgData || '',
            createdDate : createdDate
          } 

        const buId = await businessUnitsDB.createBusinessUnit(data)
        res.status(200).json({ status : 200, result : `Business Unit added successfully with ID : ${buId}`})
    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.patch('/updateBusinessUnit', async (req, res) => {
    try{
        const { id, name, shortName, description, owner, modifiedBy, userGroup, imgData, modifiedDate }  = req.body

        req.checkBody("id", "Please provide valid 'id' value").notEmpty().isInt()
        req.checkBody("name", "Please provide valid 'name' value should be min 1 and max 100 chars long.").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("shortName", "Please provide valid 'shortName' value should be min 1 and max 30 chars long.").notEmpty().isLength({ min: 1, max:30 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("owner", "Please provide valid 'owner' value should be min 1 and max 100 chars long.").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_@.\s]+$/i)
        req.checkBody("modifiedBy", "Please provide valid 'modifiedBy' value should be min 1 and max 100 chars long.").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_@.\s]+$/i)
        req.checkBody("modifiedDate", "Please provide valid 'modifiedDate' value").notEmpty()

        if(typeof description !== 'undefined' && description !== null && description !== ""){
            req.checkBody("description", "Please provide valid 'description' value should be min 1 and max 200 chars long").isLength({ min: 1, max:200 }).matches(/^[a-z\d\-_\s]+$/i)
        }
        if(typeof userGroup !== 'undefined' && userGroup !== null && userGroup !== ""){
            req.checkBody("userGroup", "Please provide valid 'userGroup' value should be min 1 and max 100 chars long.").isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_\s]+$/i)
        }

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const data = { 
            id : id,
            name : name.trim(), 
            shortName : shortName.trim(),
            description : description || '',
            owner : owner.trim(), 
            modifiedBy : modifiedBy.trim(), 
            userGroup : userGroup || '',
            imgData : imgData || '',
            modifiedDate : modifiedDate
          } 

        await businessUnitsDB.updateBusinessUnit(data)
        res.status(200).json({ status : 200, result : 'Business Unit updated successfully.'})

    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.delete('/deleteBusinessUnit', async (req, res) => {
    try{
        const id = req.query.id

        req.checkQuery("id", "Please provide valid 'id' value").notEmpty().isInt()
        var errors = req.validationErrors()
        
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str))
            return res.status(400).json({  status : 400, error : errs })
        }

        const result =  await businessUnitsDB.deleteBusinessUnit(id)
        res.status(200).json({ status : 200, result })

    } catch (e){
        res.status(400).json({ status : 500, error : e.toString()})
    }
})

router.post('/deleteBulkBusinessUnits', async (req, res) => {
    try {
        const { buIDs } = req.body
        for(let i = 0; i < buIDs.length; i++) {
            await businessUnitsDB.deleteBusinessUnit(buIDs[i])
        }
        res.status(200).json({ status : 200, Result : "Business Units Deleted Succesfully" })     
    
    } catch (e){
        res.status(400).json({ status : 500, error : e.toString()})
    }
})

router.get('/getWeekBuCounts', async (req, res) => {
    try{
        const result = await businessUnitsDB.getWeekBuCounts()
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

module.exports = router
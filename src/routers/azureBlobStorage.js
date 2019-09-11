const express = require('express')
const blobStorage = require('../azure/blobStorage')
const router = new express.Router()

router.post('/uploadToBlobStorage', async (req, res) => {
    try{
        const { filePath, blobName }  = req.body

        req.checkBody("blobName", "Please provide valid 'blobName' value should be min 1 and max 100 chars long.").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("filePath", "Please provide valid 'filePath' value should be min 1 and max 100 chars long.").notEmpty().isLength({ min: 1, max:100 })

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str));
            return res.status(400).json({  status : 400, error : errs })
        }

        blobStorage.uploadToBlobStorage(filePath, blobName).then(() => {
            res.status(200).json({ status : 200, result : 'File uploaded successfully.'})
        }).catch((e) => {
            res.status(500).json({ status : 500, error : e.toString()})
        })
    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.post('/deleteBlobStorage', async (req, res) => {
    try{
        const { blobName }  = req.body

        req.checkBody("blobName", "Please provide valid 'blobName' value should be min 1 and max 100 chars long.").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_\s]+$/i)

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str));
            return res.status(400).json({  status : 400, error : errs })
        }

        blobStorage.deleteBlobStorage(blobName).then(() => {
            res.status(200).json({ status : 200, result : 'File deleted successfully.'})
        }).catch((e) => {
            res.status(500).json({ status : 500, error : e.toString()})
        })
    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.post('/getBlobStorageURL', async (req, res) => {
    try{
        const { blobName }  = req.body

        req.checkBody("blobName", "Please provide valid 'blobName' value should be min 1 and max 100 chars long.").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_\s]+$/i)

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str));
            return res.status(400).json({  status : 400, error : errs })
        }
        const url = blobStorage.getBlobStorageURL(blobName)

        res.status(200).json({ status : 200, result : url })

    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.post('/uploadFileToBlobStorage', async (req, res) => {
    try{
        const { rawData, blobName }  = req.body

        req.checkBody("rawData", "Please provide valid 'rawData' value.").notEmpty()
        req.checkBody("blobName", "Please provide valid 'blobName' value should be min 1 and max 100 chars long.").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_\s]+$/i)

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str));
            return res.status(400).json({  status : 400, error : errs })
        }

        blobStorage.uploadFileToBlobStorage(rawData, blobName).then(() => {
            res.status(200).json({ status : 200, result : 'File uploaded successfully.'})
        }).catch((e) => {
            res.status(500).json({ status : 500, error : e.toString()})
        })
    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.post('/readFileFromBlobStorage', async (req, res) => {
    try{
        const { blobName }  = req.body

        req.checkBody("blobName", "Please provide valid 'blobName' value should be min 1 and max 100 chars long.").notEmpty().isLength({ min: 1, max:100 }).matches(/^[a-z\d\-_\s]+$/i)

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                 .map(str => JSON.parse(str));
            return res.status(400).json({  status : 400, error : errs })
        }

        blobStorage.readFileFromBlobStorage(blobName).then((data) => {
            res.status(200).json({ status : 200, result : data })
        }).catch((e) => {
            res.status(500).json({ status : 500, error : e.toString()})
        })

    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/fetchAccesstoken', async (req, res) => {
    try{
        blobStorage.fetchAccesstoken().then((data) => {
            res.status(200).json({ status : 200, result : data })
        }).catch((e) => {
            res.status(500).json({ status : 500, error : e.toString()})
        })

    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/fetchAccesstokenFromGraph', async (req, res) => {
    try{
        blobStorage.fetchAccesstokenFromGraph().then((data) => {
            res.status(200).json({ status : 200, result : data })
        }).catch((e) => {
            res.status(500).json({ status : 500, error : e.toString()})
        })

    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getAzureResourceGroups', async (req, res) => {
    try{
        blobStorage.getAzureResourceGroups().then((data) => {
            res.status(200).json({ status : 200, result : data })
        }).catch((e) => {
            res.status(500).json({ status : 500, error : e.toString()})
        })

    } catch (e){
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

module.exports = router
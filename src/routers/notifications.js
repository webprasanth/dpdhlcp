const express = require('express')
const validator = require('validator')
const notificationsDB = require('../db/notificationsDB')
const router = new express.Router()

router.get('/getNotifications', async (req, res) => {
    try{
        const result = await notificationsDB.getNotifications()
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getNotificationByAppID', async (req, res) => {
    try {
        const id = req.query.id

        req.checkQuery("id", "Please provide valid 'id' value ").notEmpty().isInt()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str));
            return res.status(400).json({ status: 400, error: errs })
        }

        const result = await notificationsDB.getnotificationByAppID(id)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.get('/getNotificationByBUID', async (req, res) => {
    try {
        const id = req.query.id

        req.checkQuery("id", "Please provide valid 'id' value ").notEmpty().isInt()
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str));
            return res.status(400).json({ status: 400, error: errs })
        }

        const result = await notificationsDB.getnotificationByBUID(id)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/createNotifications', async (req, res) => {
    try {
        const { NotificationType, message, appID, appGroupID, buID, buGroupID } = req.body

        req.checkBody("NotificationType", "Please provide valid 'appName' value should be min 1 and max 30 chars long").notEmpty().isLength({ min: 1, max: 30 }).matches(/^[a-z\d\-_\s]+$/i)
        req.checkBody("message", "Please provide valid 'appOwner' value should be min 1 and max 30 chars long").notEmpty().isLength({ min: 1, max: 30 }).matches(/^[a-z\d\-_.@\s]+$/i)

        var errors = req.validationErrors()
        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str));
            return res.status(400).json({ status: 400, error: errs })
        }

        const data = {

            NotificationType,
            message,
            appID,
            appGroupID,
            buID,
            buGroupID
        }

        await notificationsDB.createNotifications(data)
        res.status(200).json({ status: 200, result: `Notification Added Successfully` })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})


module.exports = router
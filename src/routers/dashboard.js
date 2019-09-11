const express = require('express')
const validator = require('validator')
const dashboardDB = require('../db/dashboardDB')
const applicationsDB = require('../db/applicationsDB')
//const treeAssociationDB = require('../dummy/treeAssociationDB')
const businessUnitsDB = require('../db/businessUnitsDB')
const usersDB = require('../db/usersDB')
const devicesDB = require('../db/devicesDB')
const router = new express.Router()

router.get('/getCounts', async (req, res) => {
    try {
        const appCount = await applicationsDB.getApplicationsCount()
        const buCount = await businessUnitsDB.getBusinessUnitsCount()
        const usersCount = await usersDB.getUsersCount()
        const devicesCount = await devicesDB.getDevicesCount()

        res.status(200).json({ status: 200, result : { appCount, buCount, usersCount, devicesCount } })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/getCountsNew', async (req, res) => {
    try {
        const { userRole, userEmailID } = req.body
        let appCount, buCount, usersCount, devicesCount = "0" 
        let userGroupIDs = []
        let deviceGroupIDs = []

        if(userRole === 'Platform Admin'){
            appCount = await applicationsDB.getApplicationsCount()
            buCount = await businessUnitsDB.getBusinessUnitsCount()
            usersCount = await usersDB.getUsersCount()
            devicesCount = await devicesDB.getDevicesCount()
            
        }
        else if (userRole == 'Application Admin' ){

            const appListResult = await usersDB.getAppByUserMailID(userEmailID)
        
            if(appListResult.length > 0){
      
              for(let i = 0; i < appListResult.length ; i++){
            
                let data2 = {  entityID : appListResult[i].appid , entityName : appListResult[i].appname, entityType: 'Application'}
                const getAllAssociatedChildrensResult = await dashboardDB.getAllAssociatedChildrens(data2)
            
                const tempData = getAllAssociatedChildrensResult[0].json_agg[0].user_group
            console.log(tempData)
                for (let i = 0; i < tempData.length ; i++){
                    if(tempData[i] !== null && typeof tempData[i] !== 'undefined') {
                    
                    userGroupIDs.push(tempData[i])  
                    }
                                    
                }
                console.log(userGroupIDs)
                const tempData1 = getAllAssociatedChildrensResult[0].json_agg[0].device_group
                for (let i = 0; i < tempData1.length ; i++){
                    if(tempData1[i] !== null && typeof tempData1[i] !== 'undefined')
                    deviceGroupIDs.push(tempData1[i])                  
                } 
              }
          }
      
          devicesCount = await devicesDB.getDevicesCount(deviceGroupIDs)
          usersCount = await usersDB.getUsersCount(userGroupIDs)
      
          }  
        
        else{
            const result = await usersDB.getUserGroupByUserEmailID(userEmailID)
            if(result.length > 0 ){                
                for(let i = 0; i<result.length; i++){
                    //console.log(result[i])
                    let {  user_group_id : entityID , user_group_name : entityName  } = result[i]
                    entityType = 'User Group'
                    let data1 = { entityID,  entityName, entityType }
                    const getParentApptoFindSiblingsResult = await dashboardDB.getParentApptoFindSiblings(data1)
                    if(getParentApptoFindSiblingsResult.length > 0) {
                        let { entity_id , entity_type , entity_name  } = getParentApptoFindSiblingsResult[0]
                        let data2 = {  entityID : entity_id , entityName : entity_name, entityType: entity_type}
                        const getAllAssociatedChildrensResult = await dashboardDB.getAllAssociatedChildrens(data2) 
                        

                        const tempData = getAllAssociatedChildrensResult[0].json_agg[0].user_group
                        const tempData1 = getAllAssociatedChildrensResult[0].json_agg[0].device_group
                        for (let i = 0; i < tempData.length ; i++){
                            if(tempData[i] !== null && typeof tempData[i] !== 'undefined') {
                            
                            userGroupIDs.push(tempData[i])  
                            }
                                            
                        }
                        
                        for (let i = 0; i < tempData1.length ; i++){
                            if(tempData1[i] !== null && typeof tempData1[i] !== 'undefined')
                            deviceGroupIDs.push(tempData1[i])                  
                        }                         
    
                    }


                    var filteredDeviceGroupIDs = deviceGroupIDs.filter(function (el) {
                        return el != null;
                    });
                      
                    if(filteredDeviceGroupIDs.length > 0){
                        devicesCount = await devicesDB.getDevicesCount(filteredDeviceGroupIDs)
                    } 

                    var filtereduserGroupIDs = userGroupIDs.filter(function (el) {
                        return el != null;
                    });

                    if(filtereduserGroupIDs.length > 0) {
                        usersCount = await usersDB.getUsersCount(filtereduserGroupIDs)
                    }
                    
                    //console.log(usersCount, devicesCount) 

                }



            }
            devicesCount = await devicesDB.getDevicesCount(deviceGroupIDs)
            usersCount = await usersDB.getUsersCount(userGroupIDs)
           
        }

        res.status(200).json({ status: 200, result : { appCount, buCount, usersCount, devicesCount } })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.get('/getMenu', async (req, res) => {
    try {
        //const roleID = req.query.roleID
        const roleID = 4
        const result = await dashboardDB.getMenu(roleID)

        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.get('/getUserDetailsByEmail', async (req, res) => {
    try {
        const email = req.query.email

        req.checkQuery("email", "Please provide valid 'email' value ").notEmpty().isEmail().isLength({ min: 1, max: 200 })
        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const result = await dashboardDB.getUserDetailsByEmail(email)
        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/updateFavoriteApp', async (req, res) => {
    try {
        const { userID, appID, isFavorite } = req.body

        req.checkBody("userID", "Please provide valid 'userID' value").notEmpty().isNumeric()
        req.checkBody("appID", "Please provide valid 'appID' value").notEmpty().isNumeric()
        req.checkBody("isFavorite", "Please provide valid 'isFavorite' value").notEmpty().isBoolean()

        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const data = { userID, appID, isFavorite }
        await dashboardDB.updateFavoriteApp(data)

        res.status(200).json({ status: 200, result: `Added App into favorite successfully` })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/getOnboardingGraph', async (req, res) => {
    try{
        const { enitityType, year, month, week } = req.body

        const data = { enitityType, year, month, week }
        const result = await dashboardDB.getOnboardingGraph(data)

        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getAppOwners', async (req, res) => {
    try {

        const result = await dashboardDB.getAppOwners()

        res.status(200).json({ status: 200, result  })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.delete('/updateFavoriteMenu', async (req, res) => {
    try {
        const { userID, favoriteMenu } = req.body

        req.checkBody("userID", "Please provide valid 'userID' value").notEmpty().isNumeric()
        req.checkBody("favoriteMenu", "Please provide valid 'favoriteMenu' value").notEmpty()

        var errors = req.validationErrors()

        if (errors) {
            const errs = [...new Set(errors.map(obj => JSON.stringify(obj)))]
                .map(str => JSON.parse(str))
            return res.status(400).json({ status: 400, error: errs })
        }

        const data = { userID, favoriteMenu  }
        await dashboardDB.updateFavoriteMenu(data)

        res.status(200).json({ status: 200, result: `User's favorite added successfully` })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/getAppUsersCountforGraph', async (req, res) => {
    try {
        const { fromDate, toDate } = req.body
        const data = { fromDate, toDate }
        const result = await dashboardDB.getAppUsersCountforGraph(data)

        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/getAppUsersCountforGraphNew', async (req, res) => {
    try {
        const { fromDate, toDate, userRole, userEmailID } = req.body
        let result = []
        let userGroupIDs = []

        if(userRole === 'Platform Admin'){
            const data = { fromDate, toDate }
            result = await dashboardDB.getAppUsersCountforGraph(data)
        }else if (userRole == 'Application Admin' ){

            const appListResult = await usersDB.getAppByUserMailID(userEmailID)
        
            if(appListResult.length > 0){
      
              for(let i = 0; i < appListResult.length ; i++){
            
                let data2 = {  entityID : appListResult[i].appid , entityName : appListResult[i].appname, entityType: 'Application'}
                const getAllAssociatedChildrensResult = await dashboardDB.getAllAssociatedChildrens(data2)
                const tempData = getAllAssociatedChildrensResult[0].json_agg[0].user_group
                
                for (let i = 0; i < tempData.length ; i++){
                    if(tempData[i] !== null && typeof tempData[i] !== 'undefined') {
                    
                    userGroupIDs.push(tempData[i])  
                    }
                                    
                } 
              }
          }
      
          const data = { fromDate, toDate, userGroupIDs }
          result = await dashboardDB.getAppDevicesCountforGraphNew(data)
      
          }  
        
        
        
        else{
           
            const getUserGroupByUserEmailIDResult = await usersDB.getUserGroupByUserEmailID(userEmailID)
            if(getUserGroupByUserEmailIDResult.length > 0 ){                
                for(let i = 0; i<getUserGroupByUserEmailIDResult.length; i++){
                  
                    let {  user_group_id : entityID , user_group_name : entityName  } = getUserGroupByUserEmailIDResult[i]
                    entityType = 'User Group'
                    let data1 = { entityID,  entityName, entityType }
            
                    const getParentApptoFindSiblingsResult = await dashboardDB.getParentApptoFindSiblings(data1)
                    if(getParentApptoFindSiblingsResult.length > 0) {
                    let { entity_id , entity_type , entity_name  } = getParentApptoFindSiblingsResult[0]
                   
                    let data2 = {  entityID : entity_id , entityName : entity_name, entityType: entity_type}
                    const getAllAssociatedChildrensResult = await dashboardDB.getAllAssociatedChildrens(data2) 
                    
                    const tempData = getAllAssociatedChildrensResult[0].json_agg[0].user_group
                    for (let i = 0; i < tempData.length ; i++){
                        if(tempData[i] !== null && typeof tempData[i] !== 'undefined') {
                        
                        userGroupIDs.push(tempData[i])  
                        }
                                        
                    }
                    

                    
                    }

                }
            }
            const data = { fromDate, toDate, userGroupIDs }
    
            result = await dashboardDB.getAppUsersCountforGraph(data)
           
        }

        res.status(200).json({ status: 200, result  })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/getAppDevicesCountforGraph', async (req, res) => {
    try {
        const { fromDate, toDate } = req.body
        const data = { fromDate, toDate }
        const result = await dashboardDB.getAppDevicesCountforGraph(data)

        res.status(200).json({ status: 200, result })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})

router.post('/getAppDevicesCountforGraphNew', async (req, res) => {
    try {
        const { fromDate, toDate, userRole, userEmailID } = req.body
        let result = []
        let deviceGroupIDs = []

        if(userRole === 'Platform Admin'){
            const data = { fromDate, toDate }
            result = await dashboardDB.getAppDevicesCountforGraphNew(data)
        }
        else if (userRole == 'Application Admin' ){

            const appListResult = await usersDB.getAppByUserMailID(userEmailID)
        
            if(appListResult.length > 0){
      
              for(let i = 0; i < appListResult.length ; i++){
            
                let data2 = {  entityID : appListResult[i].appid , entityName : appListResult[i].appname, entityType: 'Application'}
                const getAllAssociatedChildrensResult = await dashboardDB.getAllAssociatedChildrens(data2)
                const tempData1 = getAllAssociatedChildrensResult[0].json_agg[0].device_group
                for (let i = 0; i < tempData1.length ; i++){
                    if(tempData1[i] !== null && typeof tempData1[i] !== 'undefined')
                    deviceGroupIDs.push(tempData1[i])                  
                } 
              }
          }
      
          const data = { fromDate, toDate, deviceGroupIDs }
          result = await dashboardDB.getAppDevicesCountforGraphNew(data)
      
          }  
        
        
        else{
           
            const getUserGroupByUserEmailIDResult = await usersDB.getUserGroupByUserEmailID(userEmailID)
            if(getUserGroupByUserEmailIDResult.length > 0 ){                
                for(let i = 0; i<getUserGroupByUserEmailIDResult.length; i++){
                  
                    let {  user_group_id : entityID , user_group_name : entityName  } = getUserGroupByUserEmailIDResult[i]
                    entityType = 'User Group'
                    let data1 = { entityID,  entityName, entityType }
            
                    const getParentApptoFindSiblingsResult = await dashboardDB.getParentApptoFindSiblings(data1)
                    if(getParentApptoFindSiblingsResult.length > 0) {
                    let { entity_id , entity_type , entity_name  } = getParentApptoFindSiblingsResult[0]
                   
                    let data2 = {  entityID : entity_id , entityName : entity_name, entityType: entity_type}
                    const getAllAssociatedChildrensResult = await dashboardDB.getAllAssociatedChildrens(data2) 
                    //console.log('i am here again ',getAllAssociatedChildrensResult)
   
                    const tempData1 = getAllAssociatedChildrensResult[0].json_agg[0].device_group
                    for (let i = 0; i < tempData1.length ; i++){
                        if(tempData1[i] !== null && typeof tempData1[i] !== 'undefined')
                        deviceGroupIDs.push(tempData1[i])                  
                    }    


                    }
                }
            }
            const data = { fromDate, toDate, deviceGroupIDs }
            result = await dashboardDB.getAppDevicesCountforGraphNew(data)
           
        }

        res.status(200).json({ status: 200, result  })
    } catch (e) {
        res.status(500).json({ status: 500, error: e.toString() })
    }
})


module.exports = router
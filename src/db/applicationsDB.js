const db = require('../utils/postGresDB')
const blobStorage = require('../azure/blobStorage')
//const associationsDB = require('../db/associationsDB')
const associationsDB = require('../dummy/treeAssociationDB')
const notificationsDB = require('../db/notificationsDB')
const usersDB = require('../db/usersDB')

const strApplication = 'Application'

const getApplications = async (page, size, search, sortColumn, sortType) => {
  try {

    let offsetRows = (page - 1) * size
    let sortTypeValue = (sortType == 1) ? 'ASC' : 'DESC'
    let result = {}

    if (search == null) {
      const totalrows = await db.query('SELECT COUNT(*) AS total FROM applications WHERE is_exists = true')
      const appQuery = `SELECT bu.name as buName, app.* FROM applications app
      LEFT OUTER JOIN businessunits bu on app.bu_id = bu.id
      WHERE app.is_exists = true ORDER BY app.${sortColumn} ${sortTypeValue} LIMIT $1 OFFSET $2`

      const { rows } = await db.query( appQuery, [size, offsetRows])

      result = {
        totalrows: totalrows.rows[0].total,
        rows
      }

    } else {
      let searchValue = '%' + search + '%'

      const totalrows = await db.query('SELECT COUNT(*) AS total FROM applications WHERE ' + sortColumn + ' LIKE $4 AND is_exists = true ORDER BY $3 ' + sortTypeValue + ' LIMIT $1 OFFSET $2', [size, offsetRows, sortColumn, searchValue])
      const appQuery = `SELECT bu.name as buName, app.* FROM applications app
      LEFT OUTER JOIN businessunits bu on app.bu_id = bu.id
      WHERE app.${sortColumn} LIKE $4 AND app.is_exists = true
      ORDER BY $3 ${sortTypeValue} LIMIT $1 OFFSET $2`

      const { rows } = await db.query(appQuery, [size, offsetRows, sortColumn, searchValue])

      result = {
        totalrows: totalrows.rows.length == 0 ? 0 : totalrows.rows[0].total,
        rows
      }
    }
    
    return result
  } catch (e) {
    throw e
  }
}

const getAllApplications = async(data) => {
  try {
      const { userRole, userEmailID } = data
      let query = ''
      if( userRole == 'Platform Admin'){
        query = `SELECT bu.name as buName, app.* FROM applications app 
        LEFT OUTER JOIN businessunits bu on app.bu_id = bu.id 
        WHERE app.is_exists = true ORDER BY id DESC`
      } else
      {
        query = `SELECT bu.name as buName, app.* FROM applications app 
        LEFT OUTER JOIN businessunits bu on app.bu_id = bu.id 
        WHERE app.is_exists = true 
        AND app.owner = '${userEmailID}' ORDER BY id DESC`
      }

      const { rows } = await db.query(query)
      return rows
  } catch(e) {
    throw e
  } 
}

const getApplicationByID = async (id) => {
  try {
    const query = `SELECT bu.name as buName, app.*
    --,  ARRAY_AGG (role_id) as roles
    FROM PUBLIC.applications app
    --LEFT OUTER JOIN PUBLIC.approles roles on app.id = application_id
    LEFT OUTER JOIN PUBLIC.businessunits bu on app.bu_id = bu.id
    where app.id = $1
    GROUP BY app.id, bu.name`

    const { rows } = await db.query(query, [id])
    if(rows.length > 0){
      const imgData = await blobStorage.readFileFromBlobStorage(rows[0].icon_name || "")
      rows[0].imgData = imgData
    }

    return rows
  } catch (e) {
    throw e
  }
}

const getApplicationsByBuID = async(buID) => {
  try {
      const query = `SELECT  bu.id as buid, bu.name as buName, app.* FROM applications app 
      LEFT OUTER JOIN businessunits bu on app.bu_id = bu.id 
      WHERE app.is_exists = true AND app.bu_id = $1 ORDER BY app.id ASC`
      const { rows } = await db.query(query, [buID])
      return rows
  } catch(e) {
    throw e
  } 
}

const getApplicationsCount = async() => {
  try {
      const query = `SELECT  COUNT(*) as total FROM applications app  
      WHERE app.is_exists = true`
      const { rows } = await db.query(query)
      return rows[0].total
  } catch(e) {
    throw e
  } 
}

const createApplication = async (data) => {
  try {
    const { appName, appOwner, appOwnerName, appStatus, appGroupName, appCreatedBy, resourceGroupName, appDescription, imgData, buID,  parentID, parentName, parentType, grandParentID, grandParentName, grandParentType, url } = data
    const onboardedDate = new Date()
    const iconName = `App_${appName}_${onboardedDate.toDateString()}`

    const appParams = [appName, appOwner, appOwnerName, appStatus, appGroupName, appCreatedBy, resourceGroupName, appDescription, onboardedDate, buID, iconName, true, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType, url ]
    const appQuery = `INSERT INTO PUBLIC.applications(name, owner, owner_name, status, group_name, created_by, 
      resource_group_name, description, onboarded_date, bu_id, icon_name, is_exists, 
      parent_id, parent_name, parent_type, grand_parent_id, grand_parent_name, grand_parent_type, url ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`

    await db.query(appQuery, appParams)

    const query = `SELECT app.id as appid, app.icon_name as blobname, bu.name as bu FROM PUBLIC.applications as app 
    LEFT JOIN PUBLIC.businessunits bu on app.bu_id = bu.id where app.name = $1`

    const { rows } = await db.query(query, [appName])
    const { bu, appid: appId, blobname: blobName } = rows[0]

    const assocData = { parentName : parentName, parentType : parentType, entityName : appName , entityID : appId, entityType : strApplication } 
    await associationsDB.createAssociationsByNodeForAngular(assocData)

    if (imgData.trim() !== '') {
      await blobStorage.uploadFileToBlobStorage(imgData, blobName)
    }

    const title = 'New Application onboarded'
    const message = `${appName} is onboarded by ${appCreatedBy}`
    await notificationsDB.createNotifications(title, message)

    await createAppOwnerUser(appOwner, appOwnerName, appCreatedBy, appId)

    return appId

  } catch (e) {
    throw e
  }
}

const updateApplication = async (data) => {
  try {
    const { id, appName, appOwner, appOwnerName, appStatus, appGroupName, appModifiedBy, resourceGroupName, appDescription, imgData, buID, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType, url } = data
    const modifiedDate = new Date()
    const query = `SELECT bu.name as bu FROM PUBLIC.applications as app 
    LEFT JOIN PUBLIC.businessunits bu on app.bu_id = bu.id where app.id = $1`

    const appResult = await db.query(query, [id])
    const oldBuName = appResult.rows[0].bu

    const appParams = [id, appName, appOwner, appStatus, appGroupName, appModifiedBy, resourceGroupName, appDescription, modifiedDate, buID, appOwnerName, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType, url]
    const appQuery = `UPDATE PUBLIC.applications SET name = $2, owner = $3, status = $4, group_name = $5, 
    modified_by = $6, resource_group_name = $7, description = $8, modified_date = $9, bu_id = $10, owner_name = $11, 
    parent_id = $12, parent_name = $13, parent_type = $14, grand_parent_id = $15, grand_parent_name = $16, grand_parent_type = $17, url = $18
    WHERE id = $1`

    await db.query(appQuery, appParams)

    let newBuName = null
    if (buID !== null && buID !== '' && typeof buID !== 'undefined') {
      const result = await db.query('SELECT name as bu FROM PUBLIC.businessunits where id = $1', [buID])
      newBuName = result.rows[0].bu
    }

    const assocData = { parentName : parentName, parentType : parentType, entityName : appName, entityID : id, entityType : strApplication } 
    await associationsDB.updateAssociationsByNodeForAngular(assocData)

    if (imgData.trim() !== '') {
      const { rows } = await db.query('SELECT icon_name FROM PUBLIC.applications WHERE id = $1', [id])
      const blobName = rows[0].icon_name
      await blobStorage.uploadFileToBlobStorage(imgData, blobName)
    }

    const title = 'Application updated'
    const message = `${appName} is updated by ${appModifiedBy}`
    await notificationsDB.createNotifications(title, message)

    await createAppOwnerUser(appOwner, appOwnerName, appModifiedBy, id)

    return
  } catch (e) {
    throw e
  }
}

const deleteApplication = async (id) => {
  try {
    const query = `SELECT name as appname, icon_name as blobname FROM PUBLIC.applications 
    WHERE id = $1`

    const { rows } = await db.query(query, [id])

    if(rows.length > 0) {
      
      await db.query('UPDATE PUBLIC.userassociations SET app_id = null WHERE app_id =$1', [id])
      await db.query('DELETE FROM PUBLIC.usergroupassociations WHERE parent_id = $1 AND parent_name = $2', [id, rows[0].appname])
      await db.query('UPDATE PUBLIC.devicegroupassociations SET app_id = null WHERE app_id =$1', [id])
      await db.query('DELETE FROM PUBLIC.devicegroupassociations WHERE parent_id = $1 AND parent_name = $2', [id, rows[0].appname])

      const data = { entityName : rows[0].appname, entityID : id, entityType : strApplication }
      await associationsDB.deleteAssociationsByNodeForAngular( data ) 

      //const data = { entityName : rows[0].appname, entityID : id, entityType : strApplication }
      //await associationsDB.deAssociateImmediateChildEntities(data) 

      await db.query('DELETE FROM PUBLIC.applications WHERE id = $1', [id])

      //await associationsDB.deleteAssociationsByNodeForAngular( data ) 
      
      await blobStorage.deleteBlobStorage(rows[0].blobname)

      return 'Application Unit deleted successfully.'
    }

    return 'Record not found.'
  } catch (e) {
    throw e
  }
}

const createBulkApplications = async(data) => {
  try {
    return new Promise((resolve, reject) => {
      const { appName, appOwner, appOwnerName, appStatus, appGroupName, appCreatedBy, resourceGroupName, appDescription, url } = data

      const onboardedDate = new Date()
      const iconName = `App_${appName}_${onboardedDate.toDateString()}`
      const appParams = [ appName, appOwner, appOwnerName, appStatus, appGroupName, appCreatedBy, resourceGroupName, appDescription, onboardedDate, null, iconName, true, url ]
      const appQuery = `INSERT INTO PUBLIC.applications(name, owner, owner_name, status, group_name, created_by,
        resource_group_name, description, onboarded_date, bu_id, icon_name, is_exists, url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`
      db.query(appQuery, appParams)
      .then(async(result) => {

         const query = `SELECT app.id FROM PUBLIC.applications as app where app.name = $1`

          const { rows } = await db.query(query, [appName])
          const { id } = rows[0]

          resolve(id)

      })
      .catch((e) => {
        reject(e)
      })
    })
  } catch(e) {
    //throw e
  }
}

const getWeekAppCounts = async() => {
  try {
      const query = `select row_to_json(t)  as counts from 
      (
      with seven as
      (SELECT COUNT(onboarded_date) as seven
       from applications
       WHERE to_date(onboarded_date,'YYYY-MM-DD ') = (CURRENT_DATE-6)), 
      six as
      (SELECT COUNT(onboarded_date) as six
       from applications
       WHERE to_date(onboarded_date,'YYYY-MM-DD ') = (CURRENT_DATE-5)), 
      five as
      (SELECT COUNT(onboarded_date) as five
       from applications
       WHERE to_date(onboarded_date,'YYYY-MM-DD ') = (CURRENT_DATE-4)), 
      four as
      (SELECT COUNT(onboarded_date) as four
       from applications
       WHERE to_date(onboarded_date,'YYYY-MM-DD ') = (CURRENT_DATE-3)), 
      three as
      (SELECT COUNT(onboarded_date) as three
       from applications
       WHERE to_date(onboarded_date,'YYYY-MM-DD ') = (CURRENT_DATE-2)), 
      two as
      (SELECT COUNT(onboarded_date) as two
       from applications
       WHERE to_date(onboarded_date,'YYYY-MM-DD ') = (CURRENT_DATE-1)), 
      one as
      (SELECT COUNT(onboarded_date) as today
       from applications
       WHERE to_date(onboarded_date,'YYYY-MM-DD ') = (CURRENT_DATE)) 
      SELECT * from one,two,three,four,five,six,seven
      ) t `
      const { rows } = await db.query(query)
      return rows
  } catch(e) {
    throw e
  } 
}

const deAssociateApplication = async (data) => {
  try { 

      const { appID } = data 

      const query = `UPDATE PUBLIC.applications SET parent_id = null, parent_name = null, parent_type = null,
      grand_parent_id = null, grand_parent_name = null, grand_parent_type = null
      WHERE id = $1`

      await db.query(query, [appID])

      return 
  
  } catch (e) {
    throw e
  }
}

// const deAssociateApplications = async (ids) => {
//   try { 

//       const query = `UPDATE PUBLIC.applications SET parent_id = null, parent_name = null, parent_type = null,
//       grand_parent_id = null, grand_parent_name = null, grand_parent_type = null
//       WHERE id in ($1)`

//       await db.query(query, [ids])

//       return 
  
//   } catch (e) {
//     throw e
//   }
// }

const getNotAssociatedApplications = async() => {
  try {
      const query = `SELECT * FROM applications 
      WHERE is_exists = true AND parent_id is null
      ORDER BY id ASC`
      const { rows } = await db.query(query)
      return rows
  } catch(e) {
    throw e
  } 
}

const associateApplication = async (data) => {
  try {
    let { appID, appName, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType } = data
    
    if(parentID !== null && typeof parentID !== 'undefined' && parentName !== null && typeof parentName !== 'undefined') {

      if(grandParentID == null) {
          const query = `select parent_id, parent_name, parent_type
          from associations
          WHERE entity_id = $1 AND entity_name = $2
          AND entity_type = $3`
          const { rows } = await db.query(query, [ parentID, parentName, parentType ])

          if( rows.length > 0){
            grandParentID = rows[0].parent_id
            grandParentName = rows[0].parent_name
            grandParentType = rows[0].parent_type
          }
      }

      const appparams = [appID, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType]
      const appQuery = `UPDATE PUBLIC.applications SET parent_id = $2, parent_name = $3, parent_type = $4,
      grand_parent_id = $5, grand_parent_name = $6, grand_parent_type = $7
      WHERE id = $1`
  
      await db.query(appQuery, appparams)
          
      const data = { parentName : parentName, parentType : parentType, entityName : appName , entityID : appID , entityType : strApplication } 
      //await associationsDB.createAssociationsByNodeForAngular(data)
      await associationsDB.updateAssociationsByNodeForAngular(data)
    } 

  return

  } catch (e) {
    throw e
  }
}

const createAppOwnerUser = async (appOwner, appOwnerName, appCreatedBy, appId) => {
            
  const userResult = await usersDB.getUserByEmail(appOwner)
  let userID = 0

  if(userResult.length == 0) {

    const userData = {
      firstName : appOwnerName,
      email : appOwner,
      createdBy : appCreatedBy,
      lastName : '' ,
      displayName : '',
      isDislayNamePrimary : false,
      gender : '',
      landLine : '',
      mobile : '',
      designation : '',
      dataOfBirth : '',
      country : '',
      state : '',
      city : '',
      street : '',
      pincode : '',
      imgData : ''
    }

     userID = await usersDB.createUserProfile(userData)

  } else {
    userID = userResult[0].id
  }  
  
    const query = ` select * from usergroups
    WHERE user_group_name = 'Application Admin' `
    
    const { rows } = await db.query(query)
    const userGroupID = rows[0].id 
    const result = await usersDB.getUserAssocByUserandUserGroupID(userID, userGroupID)

    let userAssocData = { userGroupID, userID, appID : appId, buID : null }

    if(result.length > 0) {
        await usersDB.updateUserAssociationByUserAndUserGroupID(userAssocData)
    } else {
        await usersDB.createUserAssociations(userAssocData)
    }

}

module.exports = {
  getApplications,
  getAllApplications,
  getApplicationByID,
  getApplicationsCount,
  getApplicationsByBuID,
  createApplication,
  updateApplication,
  deleteApplication,
  createBulkApplications,
  getWeekAppCounts,
  deAssociateApplication,
  //deAssociateApplications,
  getNotAssociatedApplications,
  associateApplication
}
const db = require('../utils/postGresDB')
//const associationsDB = require('../db/associationsDB')
const associationsDB = require('../dummy/treeAssociationDB')
const usersDB = require('../db/usersDB')
const strDeviceGroup = 'Device Group'

/*********************  Related to  Device Group Table  *********************/


const getParentApptoFindSiblings = async (data) => {
  try {

      let { entityID, entityName, entityType } = data

      let a = `select t.* from (`
      let b = ''
      let c =  `)t WHERE entity_type in ('Application')`
      let interval = ''
      const { rows } = await db.query(`SELECT NLEVEL(node_path) as interval FROM associations WHERE entity_id = $1  AND entity_name = $2 AND entity_type= $3`,[entityID, entityName, entityType])

      if( rows.length >0 ) {
      interval = rows[0].interval
      }

      let condition = ''
      for (let i = 0 ; i < interval ; i++ ) {
          
          if(i !== 0){
              condition = `,-${i}`
          }
      let temp =  `SELECT number${i}.entity_id, number${i}.entity_name, number${i}.entity_type from associations x JOIN associations number${i} on number${i}.node_path = subpath(x.node_path, 0 ${condition}) WHERE x.entity_id = $1 AND x.entity_name = $2 AND x.entity_type = $3 UNION ALL `
            
      b +=  temp		   
      }
      const query = a + b.slice(0, -11) + c

      const result  = await db.query(query, [entityID, entityName, entityType]) 

      return result.rows


  } catch (e) {
      throw e
  }
}

const getAllAssociatedChildrens = async(data) => {
  const { entityID, entityName, entityType} = data
  try{
      const query = `Select json_agg(t)  FROM (
          with bu as
          (SELECT
              json_agg(a.entity_id) Business_Unit
          FROM
          associations x
          LEFT JOIN associations a ON a.node_path <@ x.node_path AND a.entity_type = 'Business Unit'
          WHERE x.entity_id = $1
          AND x.entity_type = $2
          AND x.entity_name = $3),
          app as
          (SELECT
              json_agg(b.entity_id)  Application
          FROM
          associations x
          LEFT JOIN associations b ON b.node_path <@ x.node_path AND b.entity_type = 'Application'
          WHERE x.entity_id = $1
          AND x.entity_type = $2
          AND x.entity_name = $3),
          ug as
          (SELECT
              json_agg(c.entity_id) User_Group
          FROM
          associations x
          LEFT JOIN associations c  ON c.node_path <@ x.node_path AND c.entity_type = 'User Group'
          WHERE x.entity_id = $1
          AND x.entity_type = $2
          AND x.entity_name = $3),
          dg as
          (SELECT
              json_agg(d.entity_id) Device_Group
          FROM
          associations x
          LEFT JOIN associations d  ON d.node_path <@ x.node_path AND d.entity_type = 'Device Group'
          WHERE x.entity_id = $1
          AND x.entity_type = $2
          AND x.entity_name = $3),
          entity as
          (SELECT
              json_agg(e.entity_id) entity
          FROM
          associations x
          LEFT JOIN associations e  ON e.node_path <@ x.node_path AND e.entity_type NOT IN ('Business Unit','Application','User Group','Device Group')
          WHERE x.entity_id = $1
          AND x.entity_type = $2
          AND x.entity_name = $3)
          select * from bu,app,ug,dg,entity) t`
      const  { rows }  = await db.query(query, [entityID, entityType, entityName])
      return rows
  } catch(e) {
      throw e
  }
}

const getAllDeviceGroups = async() => {
  try {

     let query = `SELECT dg.id, dg.device_group_name, dg.service_provider_id, 
      ds.service_provider, dg.device_type_id, dt.device_type_name, dg.is_exists, dg.created_by, dg.created_date,
      parent_id,parent_name, parent_type
      FROM PUBLIC.devicegroups dg
      JOIN devicetypes dt on dt.id = dg.device_type_id
      JOIN devicespec ds on ds.id = dg.service_provider_id
      LEFT JOIN devicegroupassociations dga ON dga.device_group_id = dg.id
      WHERE dg.is_exists = true ORDER BY dg.id DESC`

      const { rows } = await db.query(query)
      return rows

  } catch(e) {
    throw e
  } 
}

const getDeviceGroups = async(data) => {
  try {

    const { userRole, userEmailID } = data
    let query =''
    let deviceGroupIDs = []

    if(userRole == 'Platform Admin'){

      query = `SELECT dg.id, dg.device_group_name, dg.service_provider_id, 
      ds.service_provider, dg.device_type_id, dt.device_type_name, dg.is_exists, dg.created_by, dg.created_date,
      parent_id,parent_name, parent_type
      FROM PUBLIC.devicegroups dg
      JOIN devicetypes dt on dt.id = dg.device_type_id
      JOIN devicespec ds on ds.id = dg.service_provider_id
      LEFT JOIN devicegroupassociations dga ON dga.device_group_id = dg.id
      WHERE dg.is_exists = true ORDER BY dg.id DESC`

      const { rows } = await db.query(query)
      return rows

    } else if (userRole == 'Application Admin' ){

      const appListResult = await db.query( `SELECT id as appid, name as appname FROM PUBLIC.applications app WHERE app.owner = '${userEmailID}'`)
      //console.log(appListResult)
      if(appListResult.rowCount > 0){

        for(let i = 0; i<appListResult.rows.length ; i++){

          let data2 = {  entityID : appListResult.rows[i].appid , entityName : appListResult.rows[i].appname, entityType: 'Application'}
          const getAllAssociatedChildrensResult = await getAllAssociatedChildrens(data2)
    
          const tempData = getAllAssociatedChildrensResult[0].json_agg[0].device_group
    
          for (let i = 0; i < tempData.length ; i++){
            if(tempData[i] !== null && typeof tempData[i] !== 'undefined')
            deviceGroupIDs.push(tempData[i]) 
  
        }
        }
    }



    }  
    else {
      
      
      const result = await usersDB.getUserGroupByUserEmailID(userEmailID)
      if(result.length > 0 ){   
        for(let i = 0; i<result.length; i++){
          let {  user_group_id : entityID , user_group_name : entityName  } = result[i]
          entityType = 'User Group'
          let data1 = { entityID,  entityName, entityType }
          const getParentApptoFindSiblingsResult = await getParentApptoFindSiblings(data1)
          if(getParentApptoFindSiblingsResult.length > 0){
            let { entity_id , entity_type , entity_name  } = getParentApptoFindSiblingsResult[0]
            let data2 = {  entityID : entity_id , entityName : entity_name, entityType: entity_type}
            const getAllAssociatedChildrensResult = await getAllAssociatedChildrens(data2)

            const tempData = getAllAssociatedChildrensResult[0].json_agg[0].device_group

            for (let i = 0; i < tempData ; i++){
              if(tempData[i] !== null && typeof tempData[i] !== 'undefined')
              deviceGroupIDs.push(tempData[i]) 
            }                   
          }          
         
        } 
      
      } 
    }

    if(deviceGroupIDs.length > 0){
    query = `SELECT dg.id, dg.device_group_name, dg.service_provider_id, 
    ds.service_provider, dg.device_type_id, dt.device_type_name, dg.is_exists, dg.created_by, dg.created_date,
    parent_id,parent_name, parent_type
    FROM PUBLIC.devicegroups dg
    JOIN devicetypes dt on dt.id = dg.device_type_id
    JOIN devicespec ds on ds.id = dg.service_provider_id
    LEFT JOIN devicegroupassociations dga ON dga.device_group_id = dg.id
    WHERE dg.is_exists = true AND dg.id in (${deviceGroupIDs})  
    ORDER BY dg.id DESC`
    const { rows } = await db.query(query)
    return rows

    }


    return []

  } catch(e) {
    throw e
  } 
}

const getDeviceGroupByID = async (id) => {
  try {
    const { rows } = await db.query('SELECT * FROM PUBLIC.devicegroups WHERE id = $1', [id])
    return rows
  } catch (e) {
    throw e
  }
}

const getDeviceGroupByDeviceGroupName = async (deviceGroupName) => {
  try {

    const query = `SELECT * FROM PUBLIC.devicegroups WHERE device_group_name = $1 AND is_exists = true ORDER BY id ASC`

    const { rows } = await db.query(query, [ deviceGroupName ])
    return rows
  } catch (e) {
    throw e
  }
}

const getDeviceGroupsByAppID = async (appID) => {
  try {

    const query = `SELECT da.app_id, da.bu_id, da.device_group_id, dg.device_group_name 
    FROM deviceassociations as da 
    JOIN devicegroups as dg on da.device_group_id = dg.id
    WHERE da.app_id = $1
    GROUP BY da.app_id, da.bu_id, da.device_group_id, dg.device_group_name`

    const { rows } = await db.query(query, [ appID ])
    return rows
  } catch (e) {
    throw e
  }
}

const createDeviceGroup = async (data) => {
  try {
    const { deviceGroupName, createdBy } = data
    const createdDate = new Date()

    const deviceGroupParams = [deviceGroupName, createdBy, createdDate, true]
    const deviceGroupQuery = `INSERT INTO PUBLIC.devicegroups(device_group_name, created_by, created_date, is_exists) 
    VALUES ($1, $2, $3, $4)`

    await db.query(deviceGroupQuery, deviceGroupParams)

    const { rows } = await db.query('SELECT id FROM PUBLIC.devicegroups where device_group_name = $1', [deviceGroupName])
    const { id } = rows[0]

    return id
  } catch (e) {
    throw e
  }
}

const updateDeviceGroup = async(data) => {
  try {
    const { deviceGroupName, modifiedBy, id } = data
    const modifiedDate = new Date()

    const deviceGroupParams = [deviceGroupName, modifiedBy, modifiedDate, id]

    const deviceGroupQuery = `UPDATE PUBLIC.devicegroups SET device_group_name = $1, modified_by = $2, modified_date = $3
     WHERE id = $4`

    await db.query(deviceGroupQuery, deviceGroupParams)

    return 
  } catch(e) {
    throw e
  } 
}

const deleteDeviceGroup = async(id) => {
  try {
      await db.query('UPDATE PUBLIC.devicegroups SET is_exists = $1 WHERE id = $2' , [false, id])

      const query = `SELECT device_group_name FROM PUBLIC.devicegroups as ua WHERE ua.id = $1`

      const { rows } = await db.query(query, [ id ])
  
      if(rows.length > 0) {
  
          await db.query('DELETE FROM PUBLIC.devicegroupassociations WHERE device_group_id =$1', [ id ])
          await db.query('DELETE FROM PUBLIC.devices WHERE device_group_id =$1', [ id ])
          await db.query('DELETE FROM PUBLIC.devicegroups WHERE id = $1', [ id ])
  
          const data = { entityName : rows[0].device_group_name, entityID : id, entityType : strDeviceGroup }
          await associationsDB.deleteAssociationsByNodeForAngular( data ) 
  
          return 'Device Group Deleted Successfully.'
      }
      return 'Record not found.'

  } catch(e) {
    throw e
  }  
}

/* compare
const updateassociateDeviceGroups = async (data) => {
  try {
    const { deviceGroupID, appID } = data

    const queryOldappName = `SELECT app.name as appName FROM PUBLIC.deviceassociations d
    JOIN PUBLIC.applications app ON d.app_id = app.id  WHERE device_group_id = $1 GROUP BY device_group_id`
    const { rows: oldAppRows } = await db.query(queryOldappName, [ deviceGroupID ])
    const { appname: oldAppName } = oldAppRows[0]

    const queryNewappName = `SELECT name as appName FROM PUBLIC.applications WHERE id = $1`
    const { rows: newAppRows } = await db.query(queryNewappName, [ appID ])
    const { appname: newAppName } = newAppRows[0]

    const queryDeviceName = `SELECT device_group_name as devicegroupname FROM PUBLIC.devicegroups WHERE id = $1`
    const { rows: deviceRows } = await db.query(queryDeviceName, [ deviceGroupID ])
    const { devicegroupname : deviceGroupName } = deviceRows[0]
    
    await associationsDB.updateAssociationsByNode(deviceGroupName, deviceGroupID, strDeviceGroup, oldAppName, newAppName)

    return
  } catch (e) {
    throw e
  }
}

const deleteDeviceGroups = async (data) => {
  try {
    const { deviceGroupID } = data

    const queryappName = `SELECT app.name as appName FROM PUBLIC.deviceassociations d
    JOIN PUBLIC.applications app ON d.app_id = app.id  WHERE device_group_id = $1 GROUP BY device_group_id`
    const { rows: appRows } = await db.query(queryappName, [ deviceGroupID ])
    const { appname: appName } = appRows[0]

    const queryDeviceName = `SELECT device_group_name as devicegroupname FROM PUBLIC.devicegroups WHERE id = $1`
    const { rows: deviceRows } = await db.query(queryDeviceName, [ deviceGroupID ])
    const { devicegroupname : deviceGroupName } = deviceRows[0]
    
    await associationsDB.deleteAssociationsByNode(deviceGroupName, deviceGroupID, strDeviceGroup, appName)
    await db.query('DELETE FROM  PUBLIC.deviceassociations where device_group_id =$1',[ deviceGroupID ])

    return
  } catch (e) {
    throw e
  }
}

const associateDeviceGroups = async (data) => {
  try {
    const { appID, deviceGroupID } = data

    const queryappName = `SELECT name as appName FROM PUBLIC.applications WHERE id = $1`

    const { rows: appRows } = await db.query(queryappName, [ appID ])
    const { appname: appName } = appRows[0]

    const queryDeviceName = `SELECT device_group_name as devicegroupname FROM PUBLIC.devicegroups WHERE id = $1`
    const { rows: deviceRows } = await db.query(queryDeviceName, [ deviceGroupID ])
    const { devicegroupname : deviceGroupName } = deviceRows[0]
    
    await associationsDB.createAssociationsByNode(appName, deviceGroupName, deviceGroupID, strDeviceGroup)
    //await db.query('INSERT INTO PUBLIC.deviceassociations (device_id, device_group_id, app_id, bu_id) VALUES ($1, $2, $3 )  ', [id, deviceGroupID, appId, buId ])

    return
  } catch (e) {
    throw e
  }
}

const associateDeviceGroupForBu = async (data) => {
  try {
    const { buID, deviceGroupID } = data

    const queryBuName = `SELECT name as buname FROM PUBLIC.businessUnits WHERE id = $1`

    const { rows: buRows } = await db.query(queryBuName, [ buID ])
    const { buname: buName } = buRows[0]

    const queryDeviceName = `SELECT device_group_name as devicegroupname FROM PUBLIC.devicegroups WHERE id = $1`
    const { rows: deviceRows } = await db.query(queryDeviceName, [ deviceGroupID ])
    const { devicegroupname : deviceGroupName } = deviceRows[0]
    
    await associationsDB.createAssociationsByNode(buName, deviceGroupName, deviceGroupID, strDeviceGroup)
    //await db.query('INSERT INTO PUBLIC.deviceassociations (device_id, device_group_id, app_id, bu_id) VALUES ($1, $2, $3 )  ', [id, deviceGroupID, appId, buId ])

    return
  } catch (e) {
    throw e
  }
}

const updateAssociatedDeviceGroups = async (data) => {
  try {
    const { deviceGroupID, appID } = data

    const queryOldappName = `SELECT app.name as appName FROM PUBLIC.deviceassociations d
    JOIN PUBLIC.applications app ON d.app_id = app.id  WHERE device_group_id = $1 GROUP BY device_group_id, app.name`
    const { rows: oldAppRows } = await db.query(queryOldappName, [ deviceGroupID ])

    let oldAppName = null

    if(oldAppRows.length > 0) {
      oldAppName = oldAppRows[0].appname
    }

    const queryNewappName = `SELECT name as appName FROM PUBLIC.applications WHERE id = $1`
    const { rows: newAppRows } = await db.query(queryNewappName, [ appID ])
    const { appname: newAppName } = newAppRows[0]

    const queryDeviceName = `SELECT device_group_name as devicegroupname FROM PUBLIC.devicegroups WHERE id = $1`
    const { rows: deviceRows } = await db.query(queryDeviceName, [ deviceGroupID ])

    let deviceGroupName = ''
    if(deviceRows.length > 0) {
      deviceGroupName = deviceRows[0].devicegroupname
    }
    
    await associationsDB.updateAssociationsByNode(deviceGroupName, deviceGroupID, strDeviceGroup, oldAppName, newAppName)

    return
  } catch (e) {
    throw e
  }
}

const updateAssociatedDeviceGroupForBu = async (data) => {
  try {
    const { deviceGroupID, buID } = data

    const queryOldBuName = `SELECT bu.name as buname FROM PUBLIC.deviceassociations d
    JOIN PUBLIC.businessUnits bu ON d.app_id = bu.id  WHERE device_group_id = $1 GROUP BY device_group_id, bu.name`
    const { rows: oldBuRows } = await db.query(queryOldBuName, [ deviceGroupID ])

    let oldBuName = null

    if(oldBuRows.length > 0) {
      oldBuName = oldBuRows[0].buname
    }

    const queryNewBuName = `SELECT name as buname FROM PUBLIC.businessUnits WHERE id = $1`
    const { rows: newBuRows } = await db.query(queryNewBuName, [ buID ])
    const { buname: newBuName } = newBuRows[0]

    const queryDeviceName = `SELECT device_group_name as devicegroupname FROM PUBLIC.devicegroups WHERE id = $1`
    const { rows: deviceRows } = await db.query(queryDeviceName, [ deviceGroupID ])

    let deviceGroupName = ''
    if(deviceRows.length > 0) {
      deviceGroupName = deviceRows[0].devicegroupname
    }
    
    await associationsDB.updateAssociationsByNode(deviceGroupName, deviceGroupID, strDeviceGroup, oldBuName, newBuName)

    return
  } catch (e) {
    throw e
  }
}

const deleteAssociatedDeviceGroups = async (deviceGroupID) => {
  try {

    const queryappName = `SELECT app.name as appName FROM PUBLIC.deviceassociations d
    JOIN PUBLIC.applications app ON d.app_id = app.id  WHERE device_group_id = $1 GROUP BY device_group_id, appName`
    const { rows: appRows } = await db.query(queryappName, [ deviceGroupID ])
    const { appname: appName } = appRows[0]

    const queryDeviceName = `SELECT device_group_name as devicegroupname FROM PUBLIC.devicegroups WHERE id = $1`
    const { rows: deviceRows } = await db.query(queryDeviceName, [ deviceGroupID ])
    const { devicegroupname : deviceGroupName } = deviceRows[0]
    //console.log(deviceGroupName, deviceGroupID, strDeviceGroup, appName)
    await associationsDB.deleteAssociationsByNode(deviceGroupName, deviceGroupID, strDeviceGroup, appName)
    //await db.query('DELETE FROM  PUBLIC.deviceassociations where device_group_id =$1', [ deviceGroupID ])

    return
  } catch (e) {
    throw e
  }
}*/

/*********************  Related to  Device Group Association Table  *********************/

const getDeviceGroupAssociations = async() => {
    try {
        const { rows } = await db.query('SELECT * FROM PUBLIC.deviceGroupAssociations ORDER BY id ASC')
        return rows
    } catch(e) {
      throw e
    } 
}

const getDeviceGroupAssociationsByDeviceID = async(id) => {
  try {
    const { rows } = await db.query(`SELECT array_agg(device_group_id) AS current_device_groups FROM PUBLIC.deviceGroupAssociations
    WHERE device_id = $1 GROUP BY device_id`, [id])
    return rows
  } catch(e) {
    throw e
  } 
}
  
const getDeviceGroupAssociationByID = async (id) => {
try {
    const { rows } = await db.query('SELECT * FROM PUBLIC.deviceGroupAssociations WHERE id = $1', [id])
    return rows
} catch (e) {
    throw e
}
}

const createDeviceGroupAssociation = async (data) => {
try {
    const { deviceGroupID, deviceID } = data

    const params = [deviceGroupID, deviceID]
    const query = `INSERT INTO PUBLIC.deviceGroupAssociations(device_group_id, device_id) VALUES ($1, $2)`

    await db.query(query, params)

    return
} catch (e) {
    throw e
}
}

const updateDeviceGroupAssociation = async(data) => {
    try {
        const { deviceGroupID, deviceID, id } = data

        const params = [deviceGroupID, deviceID, id]

        const query = `UPDATE PUBLIC.deviceGroupAssociations SET device_group_id = $1, device_id = $2 WHERE id = $3`

        await db.query(query, params)

        return 
    } catch(e) {
        throw e
    } 
}

const deleteDeviceGroupAssociation = async(id) => {
    try {
        await db.query('DELETE FROM PUBLIC.deviceGroupAssociations WHERE id = $1' , [id])
        return
    } catch(e) {
        throw e
    }  
}

const deleteDeviceGroupAssociationsByDeviceID = async(id) => {
  try {
      await db.query('DELETE FROM PUBLIC.deviceGroupAssociations WHERE device_group_id = $1' , [id])
      return
  } catch(e) {
      throw e
  }  
}

/*********************  Related to  Device Group Apps Table  *********************/

const getdeviceGroupApps = async() => {
    try {
        const { rows } = await db.query('SELECT * FROM PUBLIC.deviceGroupApps ORDER BY id ASC')
        return rows
    } catch(e) {
      throw e
    } 
}
  
const getDeviceGroupAppByID = async (id) => {
try {
    const { rows } = await db.query('SELECT * FROM PUBLIC.deviceGroupApps WHERE id = $1', [id])
    return rows
} catch (e) {
    throw e
}
}

const createDeviceGroupApp = async (data) => {
try {
    const { deviceGroupID, appID } = data

    const params = [deviceGroupID, appID]
    const query = `INSERT INTO PUBLIC.deviceGroupApps(device_group_id, app_id) VALUES ($1, $2)`

    await db.query(query, params)

    return
} catch (e) {
    throw e
}
}

const updateDeviceGroupApp = async(data) => {
    try {
        const { deviceGroupID, appID, id } = data

        const params = [deviceGroupID, appID, id]

        const query = `UPDATE PUBLIC.deviceGroupApps SET device_group_id = $1, app_id = $2 WHERE id = $3`

        await db.query(query, params)

        return 
    } catch(e) {
        throw e
    } 
}

const deleteDeviceGroupApp = async(id) => {
    try {
        await db.query('DELETE FROM PUBLIC.deviceGroupApps WHERE id = $1' , [id])
        return
    } catch(e) {
        throw e
    }  
}

const createDeviceGroupForAngular = async (data) => {
  try {
    const { deviceGroupName, deviceTypeID, serviceProviderID, username, password, email, token, project, createdBy } = data
    const createdDate = new Date()

    const deviceGroupParams = [deviceGroupName, deviceTypeID, serviceProviderID, username, password, email, token, project, createdBy, createdDate, true]
    const deviceGroupQuery = `INSERT INTO PUBLIC.deviceGroups(device_group_name, device_type_id, service_provider_id, user_name, password, email, token, project, created_by, created_date, is_exists) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`

    await db.query(deviceGroupQuery, deviceGroupParams)

    const { rows } = await db.query('SELECT id FROM PUBLIC.deviceGroups where device_group_name = $1', [deviceGroupName])
    const { id : deviceGroupID } = rows[0]
           
    return deviceGroupID

  } catch (e) {
    throw e
  }
}

const updateDeviceGroupForAngular = async (data) => {
  try {
    const { deviceGroupID, deviceGroupName, deviceTypeID, serviceProviderID, username, password, email, token, project, modifieldBy } = data
    const modifiedDate = new Date()

    const deviceGroupParams = [deviceGroupID, deviceGroupName, deviceTypeID, serviceProviderID, modifiedDate, modifieldBy, username, password, email, token, project]
    
    const deviceGroupQuery = `UPDATE PUBLIC.deviceGroups SET device_group_name = $2, device_type_id  = $3, service_provider_id = $4, 
     modified_date = $5, modified_by = $6, user_name = $7, password = $8, email = $9, token = $10, project = $11 WHERE id = $1`

    await db.query(deviceGroupQuery, deviceGroupParams)
    
    return 
  } catch (e) {
    throw e
  }
}

const associateDeviceGroup = async (data) => {
  try {
    let { deviceGroupID, deviceGroupName, appID, buID, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType } = data
    
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

      const deviceGroupParams = [deviceGroupID, appID, buID, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType]
      const deviceGroupQuery = `INSERT INTO PUBLIC.devicegroupassociations(device_group_id, app_id, bu_id, parent_id, parent_name, parent_type, grand_parent_id, grand_parent_name, grand_parent_type) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
  
      await db.query(deviceGroupQuery, deviceGroupParams)
          
      const data = { parentName : parentName, parentType : parentType, entityName : deviceGroupName , entityID : deviceGroupID , entityType : strDeviceGroup } 
      await associationsDB.createAssociationsByNodeForAngular(data)
    } 

  return

  } catch (e) {
    throw e
  }
}

const getAllDeviceGroupsNotAssociated = async() => {
  try {
      const query = `SELECT * FROM deviceGroups dg WHERE dg.id NOT IN
      (SELECT device_group_id FROM devicegroupassociations da)   
      AND is_exists = true`

      const { rows } = await db.query(query)
      
      return rows
  } catch(e) {
    throw e
  } 
}

const deAssociateDeviceGroup = async (data) => {
  try { 

      const { deviceGroupID } = data 

      const query = `DELETE FROM PUBLIC.devicegroupassociations 
      WHERE device_group_id = $1`

      await db.query(query, [deviceGroupID])

      return
  
  } catch (e) {
    throw e
  }
}

// const deAssociateDeviceGroups = async (deviceGroupID, parentID, parentName, parentType) => {
//   try { 

//       const query = `DELETE FROM PUBLIC.devicegroupassociations 
//       WHERE device_group_id = $1 AND parent_id = $2 AND parent_name = $3 AND parent_type = $4`

//       await db.query(query, [deviceGroupID, parentID, parentName, parentType])

//       return
  
//   } catch (e) {
//     throw e
//   }
// }


module.exports = {
  getDeviceGroups,
  getAllDeviceGroups,
  getDeviceGroupByID,
  getDeviceGroupByDeviceGroupName,
  getDeviceGroupsByAppID,
  createDeviceGroup,
  updateDeviceGroup,
  deleteDeviceGroup,
  //updateassociateDeviceGroups,
  //deleteDeviceGroups,
  //associateDeviceGroups,
  //associateDeviceGroupForBu,
  //updateAssociatedDeviceGroups,
  //updateAssociatedDeviceGroupForBu,
  //deleteAssociatedDeviceGroups,

/****************************************/
  getDeviceGroupAssociations,
  getDeviceGroupAssociationsByDeviceID,
  getDeviceGroupAssociationByID,
  createDeviceGroupAssociation,
  updateDeviceGroupAssociation,
  deleteDeviceGroupAssociation,
  deleteDeviceGroupAssociationsByDeviceID,

/****************************************/
  getdeviceGroupApps,
  getDeviceGroupAppByID,
  createDeviceGroupApp,
  updateDeviceGroupApp,
  deleteDeviceGroupApp,

  /*********************** */
  createDeviceGroupForAngular,
  updateDeviceGroupForAngular,
  associateDeviceGroup,
  getAllDeviceGroupsNotAssociated,
  deAssociateDeviceGroup
  //,
  //deAssociateDeviceGroups
}
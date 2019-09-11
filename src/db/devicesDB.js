const db = require('../utils/postGresDB')
const deviceGroupDB = require('../db/deviceGroupsDB')
//const associationsDB = require('../db/associationsDB')
const associationsDB = require('../dummy/treeAssociationDB')

const strDevice = 'Device'

const getDevices = async (page, size, search, sortColumn, sortType) => {
  try {

    let offsetRows = (page - 1) * size
    let sortTypeValue = (sortType == 1) ? 'ASC' : 'DESC'
    let result = {}

    if (search == null) {

      const totalrows = await db.query('SELECT COUNT(*) AS total FROM devices')
      const { rows } = await db.query('SELECT * FROM devices  ORDER BY ' + sortColumn + ' ' + sortTypeValue + ' LIMIT $1 OFFSET $2', [size, offsetRows])

      result = {
        totalrows: totalrows.rows[0].total,
        rows
      }

    } else {

      let searchValue = '%' + search + '%'

      const totalrows = await db.query('SELECT COUNT(*) AS total FROM devices WHERE ' + sortColumn + ' LIKE $4 ORDER BY $3 ' + sortTypeValue + ' LIMIT $1 OFFSET $2', [size, offsetRows, sortColumn, searchValue])
      const { rows } = await db.query('SELECT * FROM devices WHERE ' + sortColumn + ' LIKE $4 ORDER BY $3 ' + sortTypeValue + ' LIMIT $1 OFFSET $2', [size, offsetRows, sortColumn, searchValue])

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

const getAllDevices = async() => {
  try {
      const query = ` SELECT devices.*,dg.id as device_group_id,
      dg.device_group_name, app.id as application_id,
      app.name as application_name,
      bu.id as business_unit_id,
      bu.name as business_unit 
      FROM PUBLIC.devices 
      LEFT JOIN PUBLIC.deviceassociations da on devices.id = da.device_id
      LEFT JOIN PUBLIC.devicegroups dg on da.device_group_id = dg.id AND dg.is_exists = true
      LEFT JOIN PUBLIC.applications app on da.app_id = app.id AND app.is_exists = true
      LEFT JOIN PUBLIC.businessunits bu on da.bu_id = bu.id AND bu.is_exists = true 
      WHERE devices.is_exists = true
      ORDER BY devices.id ASC`
      const { rows } = await db.query(query)
      
      return rows
  } catch(e) {
    throw e
  } 
}

const getDeviceByID = async (id) => {
  try {
    const query = `SELECT devices.id, devices.dhl_device_id,devices.uuid,devices.serial_number,devices.mac_address,
    devices.device_name, devices.protocol, devices.status, devices.device_spec_id,
    devices.onboarded_date,devices.onboarded_by,devices.device_health, devices.power_type,
    devices.device_owner,devices.iot_ready,	   
   
    json_agg(json_build_object('groupID',ug.id, 'groupName',ug.device_group_name,
    'appID',app.id, 'appName',app.name,
    'buID',bu.id, 'buName',bu.name )) as Entities
    FROM PUBLIC.devices 
    LEFT JOIN PUBLIC.deviceassociations as ua on devices.id = ua.device_id
    LEFT JOIN PUBLIC.devicegroups as ug on ug.id = ua.device_group_id AND ug.is_exists  = true
    LEFT JOIN PUBLIC.applications as app on ua.app_id = app.id and app.is_exists  = true
    LEFT JOIN PUBLIC.businessunits as bu on ua.bu_id = bu.id and bu.is_exists  = true
    WHERE PUBLIC.devices.id = $1
   
    group by devices.id, devices.dhl_device_id,devices.uuid,devices.serial_number,devices.mac_address,
    devices.device_name, devices.protocol, devices.status, devices.device_spec_id,
    devices.onboarded_date,devices.onboarded_by,devices.device_health, devices.power_type,
    devices.device_owner,devices.iot_ready   `

    
    const { rows } = await db.query(query, [id])
    return rows
  } catch (e) {
    throw e
  }
}

const getDevicesCount = async(deviceGroupID) => {
  try {
      let query = `SELECT  COUNT(*) as total FROM devices`
      if(deviceGroupID) query += ` WHERE device_group_id in (${deviceGroupID}) `
      const { rows } = await db.query(query)
     
      return rows[0].total
  } catch(e) {
    throw e
  } 
}

const getDeviceBySerialNumber = async (serialNumber) => {
  try {
    const { rows } = await db.query('SELECT * FROM PUBLIC.Devices where serial_number = $1', [serialNumber])
    return rows
  } catch (e) {
    throw e
  }
}

const getDevicesByDeviceGroupID = async (DeviceGroupID) => {
  try {

    const query = `SELECT * FROM 
    deviceassociations AS deviceassoc JOIN devices on deviceassoc.device_id = devices.id
    WHERE deviceassoc.device_group_id = $1
    ORDER BY deviceassoc.device_id DESC`

    const { rows } = await db.query(query, [DeviceGroupID])
    return rows
  } catch (e) {
    throw e
  }
}

/* Compare
const createDevice = async (data) => {
  try {
    const { dhlDeviceID, uuID, serialNumber, macAddress, deviceName, status, protocol, deviceHealth, powerType, onboardedBy, deviceOwner, iotReady, appIDs, deviceSpecID, deviceGroupIDs } = data
    const onboardedDate = new Date()

    const deviceParams = [dhlDeviceID, uuID, serialNumber, macAddress, deviceName, status, protocol, deviceHealth, powerType, deviceOwner, iotReady, deviceSpecID, onboardedBy, onboardedDate, true]
    const deviceQuery = `INSERT INTO PUBLIC.devices(dhl_device_id, uuid, serial_number, mac_address, device_name, status, protocol, 
    device_health, power_type, device_owner, iot_ready, device_spec_id, onboarded_by, onboarded_date, is_exists) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15 )`

    const result = await db.query(deviceQuery, deviceParams)

    const queryDeviceId = `SELECT id as deviceId FROM PUBLIC.Devices where serial_number = $1`

    const { rows } = await db.query(queryDeviceId, [serialNumber])
    const { deviceid: deviceID } = rows[0]

    for(let i = 0; i < deviceGroupIDs.length; i++){
      const data = {
        deviceGroupID : deviceGroupIDs[i], 
        deviceID : deviceID
      }
      await deviceGroupDB.createDeviceGroupAssociation(data)
    }

    if (appIDs !== null && appIDs !== '' && typeof appIDs !== 'undefined') {
       
      for(let i = 0; i < appIDs.length; i++) {
        const queryappName = `SELECT app.name as appName, bu.id as buId FROM PUBLIC.applications as app 
        LEFT JOIN PUBLIC.businessunits bu on app.bu_id = bu.id where app.id = $1`

        const { rows: appRows } = await db.query(queryappName, [appIDs[i]])
        const { buid: buID } = appRows[0]

        const input = { 
          deviceID : deviceID, 
          appID : appIDs[i],
          buID : buID 
        }

        await createDeviceAssociation(input)
      }

    }

    return result
  } catch (e) {
    throw e
  }
}

const updateDevice = async(data) => {
  try {
    const { id, dhlDeviceID, uuID, serialNumber, macAddress, deviceName, status, protocol, deviceHealth, powerType, deviceOwner, iotReady, appID, appIDs, deviceSpecID, deviceGroupIDs } = data

    const query = `SELECT app.name as appName FROM PUBLIC.devices 
    LEFT JOIN PUBLIC.deviceassociations as da on  devices.id = da.device_id
    LEFT JOIN PUBLIC.applications as app on da.app_id = app.id 
    where devices.id = $1`;
    const result  = await db.query(query, [id])
    const oldAppName  = result.rows[0].appname

    const deviceParams = [ dhlDeviceID, uuID, serialNumber, macAddress, deviceName, protocol, deviceHealth, powerType,  deviceOwner, iotReady, deviceSpecID, status, id ]
    const deviceQuery = `UPDATE PUBLIC.devices SET dhl_device_id = $1, uuid = $2, serial_number = $3, 
    mac_address = $4, device_name = $5, protocol = $6, device_health = $7, power_type = $8, 
    device_owner = $9, iot_ready = $10, device_spec_id = $11, status = $12 WHERE id = $13`

    await db.query(deviceQuery, deviceParams)

    //For User Group
    const currentDeviceGroupsResult = await deviceGroupDB.getDeviceGroupAssociationsByDeviceID(id)

    let currentDeviceGroupIDs = []
    if (currentDeviceGroupsResult.rowCount > 0) {
      currentDeviceGroupIDs = currentDeviceGroupsResult[0].current_device_groups
    }

    if (currentDeviceGroupIDs.sort().toString() !== deviceGroupIDs.sort().toString()) {

      if (deviceGroupIDs !== null && deviceGroupIDs !== '' && typeof deviceGroupIDs !== 'undefined' && deviceGroupIDs.length > 0) {

        await deviceGroupDB.deleteDeviceGroupAssociationsByDeviceID(id)

        for(let i = 0; i < deviceGroupIDs.length; i++){

          const data = {
            deviceGroupID : deviceGroupIDs[i], 
            deviceID : id
          }
          
          await deviceGroupDB.createDeviceGroupAssociation(data)
        }

      } else {
        await deviceGroupDB.deleteDeviceGroupAssociationsByDeviceID(id)
      }
    }
    
    let buId, newAppName = null

    if(appID !== null && appID !== '' && typeof appID !== 'undefined') {
      const result = await db.query('SELECT name as appName,bu_id as buId FROM PUBLIC.applications where id = $1', [ appID ])   
      newAppName = result.rows[0].appname       
      buId = result.rows[0].buid
      
    }

    if ( oldAppName === null && newAppName !== null) {
      await db.query('INSERT INTO PUBLIC.deviceassociations (device_id, app_id, bu_id) VALUES ($1, $2, $3 )  ',[ id, appID, buId ])
      await associationsDB.createAssociationsByNode(newAppName, deviceName, id, strDevice)
      
    } 
    
    if ( oldAppName !== null && newAppName !== null && oldAppName !== newAppName) {
      await db.query('UPDATE PUBLIC.deviceassociations SET app_id = $2, bu_id = $3 where device_id = $1',[ id, appID, buId ])
      await associationsDB.updateAssociationsByNode(deviceName, id, strDevice, oldAppName, newAppName )
    }

    if ( oldAppName !== null && newAppName === null){
      await associationsDB.deleteAssociationsByNode( deviceName, id, strDevice, oldAppName )
      await db.query('DELETE FROM  PUBLIC.deviceassociations where device_id =$1',[ id ])
    }

    return 
  } catch(e) {
    throw e
  } 
}*/

const createDeviceInfo = async (data) => {
  try {
    const { dhlDeviceID, uuID, serialNumber, macAddress, deviceName, status, protocol, deviceHealth, powerType, onboardedBy, deviceOwner, iotReady, deviceSpecID } = data
    const onboardedDate = new Date()

    const deviceParams = [dhlDeviceID, uuID, serialNumber, macAddress, deviceName, status, protocol, deviceHealth, powerType, deviceOwner, iotReady, deviceSpecID, onboardedBy, onboardedDate, true]
    const deviceQuery = `INSERT INTO PUBLIC.devices(dhl_device_id, uuid, serial_number, mac_address, device_name, status, protocol, 
    device_health, power_type, device_owner, iot_ready, device_spec_id, onboarded_by, onboarded_date, is_exists) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15 )`

    await db.query(deviceQuery, deviceParams)

    const deviceResult = await getDeviceBySerialNumber(serialNumber)

    const deviceID = deviceResult[0].id

    return deviceID
  } catch (e) {
    throw e
  }
}

const updateDeviceInfo = async(data) => {
  try {
    const { id, dhlDeviceID, uuID, serialNumber, macAddress, deviceName, status, protocol, deviceHealth, powerType, deviceOwner, iotReady, deviceSpecID } = data

    const deviceParams = [ dhlDeviceID, uuID, serialNumber, macAddress, deviceName, protocol, deviceHealth, powerType,  deviceOwner, iotReady, deviceSpecID, status, id ]
    const deviceQuery = `UPDATE PUBLIC.devices SET dhl_device_id = $1, uuid = $2, serial_number = $3, 
    mac_address = $4, device_name = $5, protocol = $6, device_health = $7, power_type = $8, 
    device_owner = $9, iot_ready = $10, device_spec_id = $11, status = $12 WHERE id = $13`

    await db.query(deviceQuery, deviceParams)

    return 
  } catch(e) {
    throw e
  } 
}

const deleteDevice = async(id) => {
  try {
    
      await db.query('UPDATE PUBLIC.devices SET is_exists = $1 WHERE id = $2' , [false, id])
      await db.query('DELETE FROM  PUBLIC.deviceassociations where device_id =$1',[ id ])

      return
  } catch(e) {
    throw e
  }  
}

const deleteDeviceFromDeviceGroup = async (deviceID, deviceGroupID) => {
  try {
      await db.query('DELETE FROM  PUBLIC.deviceassociations where device_id = $1 AND device_group_id = $2', [deviceID, deviceGroupID])
    return
  } catch (e) {
    throw e
  }
}

const createBulkDevices = async (data) => {
  try {
    return new Promise((resolve, reject) => {
      const { dhlDeviceID, uuID, serialNumber, macAddress, deviceName, protocol, deviceHealth, powerType, onboardedBy, deviceOwner, iotReady, status, deviceSpecID } = data
      const onboardedDate = new Date()

      const deviceParams = [dhlDeviceID, uuID, serialNumber, macAddress, deviceName, protocol, deviceHealth, powerType, deviceOwner, iotReady, deviceSpecID, onboardedBy, onboardedDate, status, true]
      const deviceQuery = `INSERT INTO PUBLIC.devices(dhl_device_id, uuid, serial_number, mac_address, device_name, protocol, 
      device_health, power_type, device_owner, iot_ready, device_spec_id, onboarded_by, onboarded_date, status, is_exists) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15 )`

      db.query(deviceQuery, deviceParams)
      .then(async(result) => {
          const query = `SELECT id FROM PUBLIC.Devices where serial_number = $1`
          const { rows } = await db.query(query, [serialNumber])
          const { id } = rows[0]
          resolve(id)
      })
      .catch((e) => {
        reject(e)
      })
    })
  } catch(e) {
  }
}

/*********************  Related to  DeviceSpec Table  *********************/

const getDeviceSpec = async () => {
  try {
    const { rows } = await db.query('SELECT * FROM PUBLIC.devicespec ORDER BY id ASC')
    return rows
  } catch (e) {
    throw e
  }
}

const getDeviceSpecByID = async (id) => {
  try {
    const { rows } = await db.query('SELECT * FROM PUBLIC.devicespec WHERE id = $1', [id])
    return rows
  } catch (e) {
    throw e
  }
}

const createDeviceSpec = async (data) => {
  try {
    
    const { serviceProvider, apiURL, protocol, isPowerEnabled, isBatteryEnabled, isIOTEnabled, object, intervalInSec, imgData, specFileData, createdBy } = data

    const createdDate = new Date()
    const imageName = `Device_Img_${serviceProvider}_${createdDate.toDateString()}`
    const specName = `Device_Spec_${serviceProvider}_${createdDate.toDateString()}`

    const deviceParams = [serviceProvider, apiURL, protocol, isPowerEnabled, isBatteryEnabled, isIOTEnabled, object, intervalInSec, imageName, specName, createdBy, createdDate]
    const deviceQuery = `INSERT INTO PUBLIC.devicespec(service_provider, api_url, protocol, is_power_enabled, is_battery_enabled, is_iot_ready, object, interval_in_sec,
    device_image_name, device_spec_name, created_by, created_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`

    await db.query(deviceQuery, deviceParams)

    // if (imgData.trim() !== '') {
    //   await blobStorage.uploadToBlobStorage(imgFilePath, imageName)
    // }

    // if (specFileData.trim() !== '') {
    //   await blobStorage.uploadToBlobStorage(specFilePath, specName)
    // }

    return
  } catch (e) {
    throw e
  }
}

const updateDeviceSpec = async (data) => {
  try {
    const { id, serviceProvider, apiURL, protocol, isPowerEnabled, isBatteryEnabled, isIOTEnabled, object, intervalInSec, imgData, specFileData, modifiedBy } = data

    const modifiedDate = new Date()

    const deviceParams = [serviceProvider, apiURL, protocol, isPowerEnabled, isBatteryEnabled, isIOTEnabled, modifiedBy, modifiedDate, object, intervalInSec, id]
    const deviceQuery = `UPDATE PUBLIC.devicespec SET service_provider = $1, api_url = $2, protocol = $3, is_power_enabled = $4, 
    is_battery_enabled = $5, is_iot_ready = $6, modified_by = $7, modified_date = $8, object = $9, interval_in_sec = $10 WHERE id = $11`

   await db.query(deviceQuery, deviceParams)

    // const deviceResult = await db.query(`SELECT * FROM PUBLIC.devicespec WHERE id = $1`, [id])

    // const imageName = deviceResult.rows[0].device_image_name
    // const specName = deviceResult.rows[0].device_spec_name

    // if (imgFilePath.trim() !== '') {
    //   await blobStorage.uploadToBlobStorage(imgFilePath, imageName)
    // }

    // if (specFilePath.trim() !== '') {
    //   await blobStorage.uploadToBlobStorage(specFilePath, specName)
    // }

    return
  } catch (e) {
    throw e
  }
}

/*********************  Related to  Device Association Table  *********************/

const createDeviceAssociation = async (data) => {
  try {
    const { deviceID, deviceGroupID, appID, buID } = data

    const params = [deviceID, deviceGroupID, appID, buID]
    const query = `INSERT INTO PUBLIC.deviceassociations (device_id, device_group_id, app_id, bu_id) VALUES ($1, $2, $3, $4 )`

    await db.query(query, params)

    return

  } catch (e) {
    throw e
  }
}

const updateDeviceAssociation = async (data) => {
  try {
      const { id, deviceID, deviceGroupID, appID, buID } = data
  
      const params = [id, deviceGroupID, deviceID, appID, buID ]
      const query = `UPDATE PUBLIC.deviceassociations SET device_group_id = $2, device_id = $3, app_id = $4, bu_id = $5 WHERE id = $1`
      await db.query(query, params)
  
      return
  } catch (e) {
    throw e
  }
}

const getDeviceAssocByDeviceAndDeviceGroupID = async(deviceID, deviceGroupID) => {
  try {
      const { rows } = await db.query(`SELECT * FROM PUBLIC.deviceassociations 
      WHERE device_id = $1 AND device_group_id = $2`, [deviceID, deviceGroupID])
      return rows
  } catch(e) {
    throw e
  } 
}

const createDeviceMetadata = async( data ) => {
  try{
      const { deviceGroupID, deviceMetadata, createdBy } = data

      const createdDate = new Date()
      await db.query('INSERT INTO PUBLIC.devices(device_group_id, device_object, created_date, created_by) VALUES ($1, $2, $3, $4)',[ deviceGroupID, deviceMetadata, createdDate, createdBy ])
      return 
  } catch(e) {
      throw e
  }
}

const getDeviceMetaDataByDeviceGroupID = async (deviceGroupID) => {
  try {

    const query = `SELECT dg.id as device_group_id,device_group_name,device_type_id, device_type_name, service_provider_id,service_provider,
    user_name,password,email,token,project,
    json_agg(json_build_object('device_metadata_id',d.id)::jsonb || d.device_object::jsonb) as devicemetadata
    FROM devicegroups dg
    JOIN devicespec ds ON ds.id = dg.service_provider_id
    JOIN devices d ON d.device_group_id = dg.id
    JOIN devicetypes dt ON dt.id = dg.device_type_id
    WHERE dg.id = $1
    GROUP BY dg.id,device_group_name,device_type_id, device_type_name,service_provider_id,service_provider`

    const { rows } = await db.query(query, [deviceGroupID])
    return rows
  } catch (e) {
    throw e
  }
}

const deleteDeviceMetaDataByDeviceGroupID = async (deviceGroupID) => {
  try {

    const query = `DELETE FROM devices WHERE device_group_id = $1`

    const { rows } = await db.query(query, [deviceGroupID])
    return rows
  } catch (e) {
    throw e
  }
}

const deleteDeviceMetaData = async (deviceMetaDataID) => {
  try {

    const query = `DELETE FROM devices WHERE id = $1`

    const { rows } = await db.query(query, [deviceMetaDataID])
    return rows
  } catch (e) {
    throw e
  }
}

const getDeviceTypes = async () => {
  try {

    const query = `SELECT * from devicetypes`

    const { rows } = await db.query(query)
    return rows
  } catch (e) {
    throw e
  }
}

const getDeviceTypeBydeviceTypeName = async (deviceTypeName) => {
  try {

    const query = `SELECT * from devicetypes WHERE device_type_name = $1`

    const { rows } = await db.query(query, [deviceTypeName])
    return rows
  } catch (e) {
    throw e
  }
}

const createDeviceType = async( data ) => {
  try{
      const { deviceTypeName, keys, createdBy } = data

      const createdDate = new Date()
      await db.query('INSERT INTO PUBLIC.devicetypes(device_type_name, keys, created_date, created_by, is_exists ) VALUES ($1, $2, $3, $4, $5)',[ deviceTypeName, keys, createdDate, createdBy, true ])

      const result  = await getDeviceTypeBydeviceTypeName(deviceTypeName)
      
      const deviceTypeID = result[0].id

      return deviceTypeID
  } catch(e) {
      throw e
  }
}

const updateDeviceType = async( data ) => {
  try{
      const { deviceTypeID, deviceTypeName, keys, modifiedBy } = data

      const modifiedDate = new Date()

      const params = [deviceTypeID, deviceTypeName, keys, modifiedBy, modifiedDate ]
      const query = `UPDATE PUBLIC.devicetypes SET device_type_name = $2, keys  = $3, modified_by  = $4, modified_date  = $5 WHERE id = $1`
      await db.query(query, params)
      
      return
  } catch(e) {
      throw e
  }
}

const getDevicesByDeviceTypeID = async (deviceTypeID) => {
  try {

        let a = `SELECT dg.device_type_id, device_type_name, d.device_group_id, device_group_name, ds.service_provider,ds.interval_in_sec  `
        let b = ''
        let c =  ` FROM devicetypes dt JOIN devicegroups dg ON dg.device_type_id = dt.id LEFT JOIN devicespec ds ON ds.id = dg.service_provider_id  LEFT JOIN devices d ON dg.id = d.device_group_id WHERE dt.id = $1`
        
        const { rows } = await db.query(`SELECT keys FROM devicetypes WHERE id= $1 `,[ deviceTypeID])

        if( rows.length >0 ) {
        keys = rows[0].keys
        }

        for (let i = 0 ; i < keys.length ; i++ ) {
            
        let temp =  `, device_object ->>  '${keys[i]}' as ${(keys[i]).split(' ').join('_')} `
              
        b +=  temp		   
        }
        const query = a + b.slice(0, -2) + c
        const result  = await db.query(query, [ deviceTypeID ]) 

        const data = [{
          settings: ''
        }]

        if(result.rows.length > 0) {

          const deviceGroupID = result.rows[0].device_group_id
          const deviceGroupResult  = await db.query('SELECT * FROM devicegroups WHERE id = $1', [ deviceGroupID ]) 
          
          data[0].data = result.rows 

          if(deviceGroupResult.rows.length > 0) {

            const settings = {
              username : deviceGroupResult.rows[0].user_name,
              password : deviceGroupResult.rows[0].password,
              email : deviceGroupResult.rows[0].email,
              token : deviceGroupResult.rows[0].token,
              project : deviceGroupResult.rows[0].project,
              intervalInSec : ""

            }
            if(result.rows.length > 0 ){
              settings.intervalInSec = result.rows[0].intervalInSec
            }

            data[0].settings = settings

          } else {
            const settings = {
              username : "",
              password : "",
              email : "",
              token : "",
              project : "",
              intervalInSec : ""

            }
            data[0].settings = settings
          }
        }

        return data   

  } catch (e) {
    throw e
  }
}

module.exports = {
  getDevices,
  getAllDevices,
  getDeviceByID,
  getDevicesCount,
  getDeviceBySerialNumber,
  getDevicesByDeviceGroupID,
  //createDevice,
  //updateDevice,
  createDeviceInfo,
  updateDeviceInfo,
  deleteDevice,
  deleteDeviceFromDeviceGroup,
  createBulkDevices,
  /******************************************/
  getDeviceSpec,
  getDeviceSpecByID,
  createDeviceSpec,
  updateDeviceSpec,
  /******************************************/
  createDeviceAssociation,
  updateDeviceAssociation,
  getDeviceAssocByDeviceAndDeviceGroupID,

  /***************************************/
  createDeviceMetadata,
  getDeviceMetaDataByDeviceGroupID,
  deleteDeviceMetaDataByDeviceGroupID,
  deleteDeviceMetaData,
  getDeviceTypes,
  getDeviceTypeBydeviceTypeName,
  createDeviceType,
  updateDeviceType,
  getDevicesByDeviceTypeID
}
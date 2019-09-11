const db = require('../utils/postGresDB')
//const associationsDB = require('../db/associationsDB')
const associationsDB = require('../dummy/treeAssociationDB')
const blobStorage = require('../azure/blobStorage')
const notificationsDB = require('../db/notificationsDB')
const strBusinessUnit = 'Business Unit'

const getBusinessUnits = async(page, size, search, sortColumn, sortType) => {
  try {

    let offsetRows = ( page - 1) * size
    let sortTypeValue = ( sortType == 1 ) ? 'ASC' : 'DESC'
    let result = {}
  
    if(search == null){

      const totalrows = await db.query('SELECT COUNT(*) AS total FROM businessunits WHERE is_exists = true')
      const { rows } = await db.query('SELECT * FROM businessunits WHERE is_exists = true ORDER BY '+ sortColumn +' '+ sortTypeValue +' LIMIT $1 OFFSET $2', [size, offsetRows])

      result = {
        totalrows: totalrows.rows[0].total,
        rows
      }
    
    } else {

      let searchValue = '%' + search + '%'

      const totalrows = await db.query('SELECT COUNT(*) AS total FROM businessunits WHERE is_exists = true AND '+ sortColumn +' LIKE $4 ORDER BY $3 '+ sortTypeValue +' LIMIT $1 OFFSET $2', [size, offsetRows, sortColumn, searchValue])
      const { rows } = await db.query('SELECT * FROM businessunits WHERE is_exists = true AND '+ sortColumn +' LIKE $4 ORDER BY $3 '+ sortTypeValue +' LIMIT $1 OFFSET $2', [size, offsetRows, sortColumn, searchValue])

      result = {
        totalrows: totalrows.rows.length == 0 ? 0 : totalrows.rows[0].total,
        rows
      }
    }
    
    return result
  } catch(e) {
    throw e
  } 
}

const getAllBusinessUnits = async() => {
  try {
      const { rows } = await db.query("SELECT *, 'Business Unit' as type FROM businessunits WHERE is_exists = true ORDER BY id DESC")
      return rows
  } catch(e) {
    throw e
  } 
}

const getBusinessUnitByID = async(id) => {
  try {
    const { rows } = await db.query('SELECT * FROM PUBLIC.businessunits WHERE id = $1', [id])
    if(rows.length > 0){
      const imgData = await blobStorage.readFileFromBlobStorage(rows[0].icon_name || "")
      rows[0].imgData = imgData
    }
    return rows
  } catch(e) {
    throw e
  } 
}

const getBusinessUnitsCount = async() => {
  try {
      const query = `SELECT  COUNT(*) as total FROM businessUnits   
      WHERE is_exists = true`
      const { rows } = await db.query(query)
      return rows[0].total
  } catch(e) {
    throw e
  } 
}

const createBusinessUnit = async(data) => {
  try {
    const { name, shortName, description, owner, createdBy, userGroup, imgData, createdDate } = data
    const currentDate = new Date()
    const iconName = `BU_${name}_${currentDate.toDateString()}`

    const buParams = [name, shortName, description, owner, createdBy, createdDate, userGroup, iconName, true]
    const buQuery = `INSERT INTO PUBLIC.businessunits(name, short_name, description, owner, created_by, created_date,
                      usergroup_name, icon_name, is_exists) VALUES ($1, $2, $3, $4, $5, to_date($6,'DD-MM-YYYY'), $7, $8, $9)`

    await db.query(buQuery, buParams)

    const result = await db.query('SELECT id, icon_name FROM PUBLIC.businessunits where name = $1', [name])   
    
    const buID = result.rows[0].id

    const assocData = { parentName : null, parentType : null, entityName : name, entityID : buID , entityType : strBusinessUnit } 
    await associationsDB.createAssociationsByNodeForAngular(assocData)

    if(imgData.trim() !== ''){
      const blobName = result.rows[0].icon_name  
      await blobStorage.uploadFileToBlobStorage(imgData, blobName)
    }

    const title = 'New Businessunit onboarded'
    const message = `${name} is onboarded by ${createdBy}`
    await notificationsDB.createNotifications(title, message)
    
    return buID
  } catch(e) {
    throw e
  }
}

const updateBusinessUnit = async(data) => {
  try {
    const { id, name, shortName, description, owner, modifiedBy, userGroup, imgData, modifiedDate } = data

    const buParams = [name, description, owner, modifiedBy, modifiedDate, userGroup, shortName, id]
    const buQuery = `UPDATE PUBLIC.businessunits SET name = $1, description = $2, owner = $3, modified_by = $4, 
                      modified_date = to_date($5,'DD-MM-YYYY'), usergroup_name = $6, short_name = $7 WHERE id = $8`

    await db.query(buQuery, buParams)

    const assocData = { parentName : null, parentType : null, entityName : name, entityID : id, entityType : strBusinessUnit } 
    await associationsDB.updateAssociationsByNodeForAngular(assocData)

    if(imgData.trim() !== ''){
      const { rows } = await db.query('SELECT icon_name FROM PUBLIC.businessunits WHERE id = $1', [id])
      const blobName = rows[0].icon_name 
      await blobStorage.uploadFileToBlobStorage(imgData, blobName)
    }

    const title = 'Businessunit updated'
    const message = `${name} is updated by ${modifiedBy}`
    await notificationsDB.createNotifications(title, message)

    return
  } catch(e) {
    throw e
  } 
}

const deleteBusinessUnit = async(id) => {
  try {
    
    const { rows } = await db.query('SELECT name as bu, icon_name as blobname FROM PUBLIC.businessunits WHERE id = $1 AND is_exists = true ', [id])

    if(rows.length > 0) {

      
      await db.query(`UPDATE PUBLIC.applications SET bu_id = null,
      parent_id = null, parent_name = null, parent_type = null, grand_parent_id = null, grand_parent_name = null, grand_parent_type = null
      WHERE parent_id = $1 AND parent_type = $2 `, [ id, strBusinessUnit ])
      await db.query('UPDATE PUBLIC.userassociations SET bu_id = null WHERE bu_id = $1', [id])
      await db.query('DELETE FROM PUBLIC.usergroupassociations WHERE parent_id = $1 AND parent_name = $2', [id, rows[0].bu])
      await db.query('UPDATE PUBLIC.devicegroupassociations SET bu_id = null WHERE bu_id = $1', [id])
      await db.query('DELETE FROM PUBLIC.devicegroupassociations WHERE parent_id = $1 AND parent_name = $2', [id, rows[0].bu])
      
      const data = { entityName : rows[0].bu, entityID : id, entityType : strBusinessUnit }
      await associationsDB.deleteAssociationsByNodeForAngular( data ) 

      //const data = { entityName : rows[0].bu, entityID : id, entityType : strBusinessUnit }
      //await associationsDB.deAssociateImmediateChildEntities(data) 

      await db.query('DELETE FROM PUBLIC.businessunits WHERE id = $1', [id])

      await associationsDB.deleteAssociationsByNodeForAngular( data ) 

      await blobStorage.deleteBlobStorage(rows[0].blobname)
      return 'Business Unit deleted successfully.'

    }

    return 'Record not found.'
  } catch(e) {
    throw e
  }  
}

// const deAssociateBusinessUnits = async(ids) => {
//   try {

//     await db.query(`UPDATE PUBLIC.businesunits SET 
//       parent_id = null, parent_name = null, parent_type = null, grand_parent_id = null, grand_parent_name = null, grand_parent_type = null
//       WHERE id in ($1)`, [ ids])

//       return
    
//   } catch(e) {
//     throw e
//   }  
// }

const getWeekBuCounts = async() => {
  try {
      const query = `select row_to_json(t)  as counts from 
         (
         with seven as
         (SELECT COUNT(created_date) as seven
         from businessunits
         WHERE to_char(created_date, 'YYYY-MM-DD') = to_char(CURRENT_DATE-6,'YYYY-MM-DD')), 
         six as
         (SELECT COUNT(created_date) as six
         from businessunits
         WHERE to_char(created_date, 'YYYY-MM-DD') = to_char(CURRENT_DATE-5,'YYYY-MM-DD')), 
         five as
         (SELECT COUNT(created_date) as five
         from businessunits
         WHERE to_char(created_date, 'YYYY-MM-DD') = to_char(CURRENT_DATE-4,'YYYY-MM-DD')), 
         four as
         (SELECT COUNT(created_date) as four
         from businessunits
         WHERE to_char(created_date, 'YYYY-MM-DD') = to_char(CURRENT_DATE-3,'YYYY-MM-DD')), 
         three as
         (SELECT COUNT(created_date) as three
         from businessunits
         WHERE to_char(created_date, 'YYYY-MM-DD') = to_char(CURRENT_DATE-2,'YYYY-MM-DD')), 
         two as
         (SELECT COUNT(created_date) as two
         from businessunits
         WHERE to_char(created_date, 'YYYY-MM-DD') = to_char(CURRENT_DATE-1,'YYYY-MM-DD')), 
         one as
         (SELECT COUNT(created_date) as today
         from businessunits
         WHERE to_char(created_date, 'YYYY-MM-DD') = to_char(CURRENT_DATE,'YYYY-MM-DD')) 
         SELECT * from one,two,three,four,five,six,seven )t`
         
      const { rows } = await db.query(query)
      return rows
  } catch(e) {
    throw e
  } 
}

module.exports = {
  getBusinessUnits,
  getAllBusinessUnits,
  getBusinessUnitByID,
  getBusinessUnitsCount,
  createBusinessUnit,
  updateBusinessUnit,
  deleteBusinessUnit,
  //deAssociateBusinessUnits,
  getWeekBuCounts
}
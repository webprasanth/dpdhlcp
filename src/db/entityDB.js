const db = require('../utils/postGresDB')
//const associationsDB = require('../db/associationsDB')
const associationsDB = require('../dummy/treeAssociationDB')

const getEntity = async() => {
    try {
        const query = `SELECT e.*,a.entity_name  as parentname FROM entity e 
        LEFT JOIN associations a ON e.parent_id = entity_id
        ORDER BY id ASC`
        const { rows } = await db.query(query)
        return rows
    } catch(e) {
      throw e
    } 
}
const getEntityByName = async(name) => {
    try {
        const query = `SELECT * FROM entity WHERE entity_name = $1 ORDER BY id ASC`
        const { rows } = await db.query(query, [ name ])
        return rows
    } catch(e) {
      throw e
    } 
}

const createEntity = async( data ) => {
    try{
        let {  entityName, entityType, isShareable, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType, createdBy, isParentIsEntity, keys } = data
        const createdDate = new Date()

        if(grandParentID == null){

            const query = `SELECT parent_id, parent_name, parent_type FROM PUBLIC.entity WHERE id = $1`
            const { rows } = await db.query(query, [ parentID ])

            if( rows.length > 0){
              grandParentID = rows[0].parent_id
              grandParentName = rows[0].parent_name
              grandParentType = rows[0].parent_type
            }
        }
        const createEntityParams = [ entityName, entityType, isShareable, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType, keys, createdDate, createdBy, true ]
        const createEntityQuery = `INSERT INTO PUBLIC.entity(entity_name, entity_type, is_shareable,  parent_id, parent_name, parent_type, grand_parent_id, grand_parent_name, grand_parent_type, keys, created_date, created_by, is_exists ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`
        await db.query(createEntityQuery, createEntityParams)

        const query = `SELECT id FROM PUBLIC.entity WHERE entity_name = $1`
        const { rows } = await db.query(query, [entityName])
        let { id : entityID } = rows[0]

        if(parentID == null) {   
            const data = { parentName : null, parentType : null, entityName, entityID, entityType } 
            await associationsDB.createAssociationsByNodeForAngular(data)
        } else if(parentID !== null && typeof parentID !== 'undefined' && parentName !== null && typeof parentName !== 'undefined'){
            if(isParentIsEntity == false) {
                const data = { entityID : parentID, entityName : parentName, entityType : parentType}
                const checkEntity = await associationsDB.getAssociationsByEntityForAngular(data)
                if(checkEntity.length == 0){
                    const data = { parentName : grandParentName, parentType : grandParentType, entityName : parentName, entityID : parentID, entityType : parentType} 
                     await associationsDB.createAssociationsByNodeForAngular(data)
                }
            }
            const data = { parentName : parentName, parentType : parentType, entityName , entityID , entityType } 
            await associationsDB.createAssociationsByNodeForAngular(data)
        }        
        return entityID
    } catch(e) {
        throw e
    }
}

const deleteEntity = async( data ) => {
    try{
        let {  entityID, entityName, entityType, modifiedBy } = data
        const modifiedDate = new Date()

        await db.query(`DELETE FROM entitymetadata WHERE entity_id = $1`,[ entityID])
        await db.query(`DELETE FROM ENTITY WHERE id = $1 `,[ entityID])

        const assocData = { entityName, entityID, entityType }
        await associationsDB.deleteAssociationsByNodeForAngular( assocData )  
             
        return
    } catch(e) {
        throw e
    }
}

const activateEntity = async( data ) => {
    try{
        let {  entityID, modifiedBy } = data
        const modifiedDate = new Date()

        await db.query(`UPDATE ENTITY SET is_exists = $2 , modified_date = $3 , modified_by = $4 WHERE id = $1`,[ entityID, true, modifiedDate, modifiedBy ])
        await db.query(`UPDATE entitymetadata SET is_exists = $2 WHERE entity_id = $1`, [ entityID, true ])
             
        return
    } catch(e) {
        throw e
    }
}

const createEntityMetadata = async( data ) => {
    try{
        const {  entityID, entityName, entityType, entityMetadata } = data
        await db.query('INSERT INTO PUBLIC.entitymetadata(entity_id, entity_object,is_exists) VALUES ($1,$2, $3)',[ entityID, entityMetadata, true ])
        const { rows } = await db.query('SELECT * FROM PUBLIC.entitymetadata WHERE entity_id = $1 ORDER BY id DESC LIMIT 1',[ entityID])
        if(rows.length > 0) {

          const data = { parentName : entityName, parentType : entityType, entityName : entityMetadata.Name, entityID : rows[0].id, entityType : entityType, isEntityInstance : true } 
          await associationsDB.createAssociationsByNodeForAngular(data)
        }
        return 
    } catch(e) {
        throw e
    }
}

const getEntityMetadataByEntityID = async (entityID) => {
    try {
  
          let a = `SELECT emd.entity_id, emd.id as entity_metadata_id, e.entity_name,e.entity_type,e.parent_id,e.parent_name, e.parent_type, `
          let b = ''
          let c =  ` FROM PUBLIC.entity e JOIN entitymetadata emd ON emd.entity_id = e.id WHERE e.id = $1`
          
          const { rows } = await db.query(`SELECT keys FROM PUBLIC.entity WHERE id= $1 `,[ entityID])
          let keys = []

          if( rows.length >0 ) {
          keys = rows[0].keys
          }
  
          for (let i = 0 ; i < keys.length ; i++ ) {
              
          let temp =  `entity_object ->>  '${keys[i]}' as ${(keys[i]).split(' ').join('_')}, `
                
          b +=  temp		   
          }
          const query = a + b.slice(0, -2) + c
  
          const result  = await db.query(query, [ entityID ]) 

          return result.rows        
  
    } catch (e) {
      throw e
    }
}

const updateEntityMetadata = async( data ) => {
    try{
        const {  id, entityMetadata } = data
        await db.query('UPDATE PUBLIC.entitymetadata SET entity_object = $2 WHERE id = $1',[ id, entityMetadata ])
        return 
    } catch(e) {
        throw e
    }
}

const deleteEntityMetadata = async( id ) => {
    try{
        await db.query('DELETE FROM PUBLIC.entitymetadata WHERE id = $1',[ id ])
        return 
    } catch(e) {
        throw e
    }
}

const updateEntity = async( data ) => {
    try{
        const {  entityID, entityName, entityType, isShareable, oldParentID, oldParentType, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType, modifiedBy, isParentIsEntity, keys } = data
        const modifiedDate = new Date()
        const query = 'UPDATE PUBLIC.entity SET entity_name = $2, entity_type = $3, is_shareable = $4,  parent_id = $5, parent_name = $6, parent_type = $7, grand_parent_id = $8, grand_parent_name = $9, grand_parent_type = $10,  modified_date = $11, modified_by = $12, keys = $13 WHERE id = $1'
        const params = [ entityID, entityName, entityType, isShareable, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType, modifiedDate, modifiedBy, keys ]
        await db.query(query,params)
        
        if(oldParentID !== parentID && oldParentType !== parentType) { 
            if(parentID == null) { 
                const data = { parentName : null, parentType : null, entityName, entityID, entityType } 
                await associationsDB.updateAssociationsByNodeForAngular(data)

            } else if(parentID !== null && typeof parentID !== 'undefined' && parentName !== null && typeof parentName !== 'undefined'){
                if(isParentIsEntity == false) {
                    const data = { entityID : parentID, entityName : parentName, entityType : parentType}
                    const checkEntity = await associationsDB.getAssociationsByEntityForAngular(data)
                    if(checkEntity.length == 0){
                        const data = { parentName : grandParentName, parentType : grandParentType, entityName : parentName, entityID : parentID, entityType : parentType} 
                         await associationsDB.createAssociationsByNodeForAngular(data)
                    }
                }
                    const data1 = { entityID : entityID, entityName : entityName, entityType : entityType}
                    const checkEntity1 = await associationsDB.getAssociationsByEntityForAngular(data1)
                if(checkEntity1.length == 0) {
                    const data2 = { parentName : parentName, parentType : parentType, entityName , entityID , entityType } 
                    await associationsDB.createAssociationsByNodeForAngular(data2)
                }else {
                    const data3 = { parentName : parentName, parentType : parentType, entityName, entityID, entityType } 
                    await associationsDB.updateAssociationsByNodeForAngular(data3)
                }
            } 
        }
        return entityID
    } catch(e) {
        throw e
    }
}

const getEntityForEdit = async(entityID) => {
    try {
        const query = ` select e.id as entityid, e.entity_name as entityName, e.entity_type as entityType,
                        e.is_shareable as isShareable, e.parent_id as parentID, e.parent_name as parentName, e.parent_type as parentType,
                        e.grand_parent_id as grandParentID, e.grand_parent_name as grandParentName,
                        e.grand_parent_type as grandParentType,e.created_by as createdBy,
                        json_agg(json_build_object('entity_metadata_id',em.id,'parent_id',em.parent_id,'parent_name',
                        em.parent_name,'parent_type',em.parent_type)::jsonb ||
                        em.entity_object::jsonb) as entityMetadata
                        FROM
                        ENTITY e
                        LEFT JOIN entityMetadata em ON e.id= entity_id
                        WHERE e.id = $1
                        GROUP BY e.id,entity_name`

        const { rows } = await db.query(query, [ entityID ])
        return rows
    } catch(e) {
      throw e
    } 
}

const deAssociateEntity = async (data) => {
    try { 
  
        const { entityID } = data 

        const query = `UPDATE PUBLIC.entity SET parent_id = null, parent_name = null, parent_type = null,
        grand_parent_id = null, grand_parent_name = null, grand_parent_type = null
        WHERE id = $1`
  
        await db.query(query, [entityID])

        return
    
    } catch (e) {
      throw e
    }
}

// const deAssociateEntities = async (entityIDs) => {
//     try { 
  
//         const query = `UPDATE PUBLIC.entity SET parent_id = null, parent_name = null, parent_type = null,
//         grand_parent_id = null, grand_parent_name = null, grand_parent_type = null
//         WHERE id in ($1)`
  
//         await db.query(query, [entityIDs])

//         return
    
//     } catch (e) {
//       throw e
//     }
// }


module.exports = {
    getEntity,
    getEntityForEdit,
    createEntity,
    updateEntity,
    deleteEntity,
    activateEntity,
    createEntityMetadata,
    getEntityByName,
    getEntityMetadataByEntityID,
    updateEntityMetadata,
    deleteEntityMetadata,
    deAssociateEntity
    //,
    //deAssociateEntities
  }
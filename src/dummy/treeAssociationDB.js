const db = require('../utils/postGresDB')
//const devicesDB = require('../db/devicesDB')
// const businessUnitsDB = require('../db/businessUnitsDB')
// const applicationsDB = require('../db/applicationsDB')
// const userGroupsDB = require('../db/userGroupsDB')
// const entityDB = require('../db/entityDB')
// const deviceGroupsDB = require('../db/deviceGroupsDB')

const getTopLevelEntities = async(data) => {
    try{
        const { userRole, userID, userEmailID } = data
        const result = []

        let appData = []
       
        if(userRole == 'Platform Admin') {

            let query = `SELECT a.entity_id,a.entity_name, a.entity_type, b.entity_type as child_entity_type, COUNT(b.*)
            FROM PUBLIC.associations a
            LEFT JOIN PUBLIC.associations b ON b.node_path <@ a.node_path AND b.entity_type IN ('User Group','Device Group')
            WHERE a.entity_type = ('Application')
            GROUP BY a.entity_id,a.entity_name, a.entity_type,b.entity_type`
            
            appData  = await db.query(query)

        } else if(userRole == 'Application Admin') {
            
            let query = `SELECT a.entity_id,a.entity_name, a.entity_type, b.entity_type as child_entity_type, COUNT(b.*)
            FROM PUBLIC.associations a
            LEFT JOIN PUBLIC.associations b ON b.node_path <@ a.node_path AND b.entity_type 
			IN ('User Group','Device Group')
            WHERE a.entity_type = ('Application') AND a.entity_id in
			(SELECT id FROM applications WHERE owner = $1)
            GROUP BY a.entity_id,a.entity_name, a.entity_type,b.entity_type`

            appData  = await db.query(query,[ userEmailID ])
        } else {
          
            let query = `SELECT a.entity_id,a.entity_name, a.entity_type, b.entity_type as child_entity_type, COUNT(b.*)
            FROM PUBLIC.associations a
            LEFT JOIN PUBLIC.associations b ON b.node_path <@ a.node_path AND b.entity_type IN ('User Group','Device Group')
            WHERE a.entity_type = ('Application') AND 
            a.entity_id in (select app_id from userassociations WHERE user_id = $1)
            GROUP BY a.entity_id,a.entity_name, a.entity_type,b.entity_type`

            appData  = await db.query(query, [userID])
        }
        let rows = appData.rows
        if(rows.length > 0) {
            for(let i = 0; i < rows.length; i++) {
                if(rows[i].entity_type == 'Business Unit') {
                    let data = {
                        entity_id : rows[i].entity_id,
                        entity_name : rows[i].entity_name,
                        entity_type : rows[i].entity_type,
                        app_count : rows[i].count
                    }
                    result.push(data)
                } else {

                    let index = -1;
                    let entity_id = rows[i].entity_id
                    let filteredObj = result.find(function(item, i){
                        if(item.entity_id === entity_id){
                            index = i;
                            return i;
                        }
                    })

                    if(index == -1 ) {
                        let data = {
                            entity_id : rows[i].entity_id,
                            entity_name : rows[i].entity_name,
                            entity_type : rows[i].entity_type,
                            device_group_count : 0,
                            user_group_count : 0

                        }
                        if(rows[i].child_entity_type == 'Device Group') {
                            data.device_group_count = rows[i].count
                        } 
                        if(rows[i].child_entity_type == 'User Group') {
                            data.user_group_count = rows[i].count
                        }
                        result.push(data)
                    } else {
                        if(rows[i].child_entity_type == 'Device Group') {
                            result[index].device_group_count = rows[i].count
                        } 
                        if(rows[i].child_entity_type == 'User Group') {
                            result[index].user_group_count = rows[i].count
                        }
                    }
                }
            }
        }
        return result
    } catch(e) {
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

const getAssociationsForAngular = async() => {
    try{
        const  {rows}  = await db.query(' SELECT json_agg(t) FROM PUBLIC.associations can JOIN PUBLIC.getTree(can.id) t ON t.table_id  = can.id WHERE can.parent_id is NULL',[])
        return rows[0].json_agg
    } catch(e) {
        throw e
    }
}

const getAllAssociationsByEntityID = async(data) => {
    try{
        const { entityID, entityName, entityType } = data
        const  {rows}  = await db.query(`WITH  RECURSIVE q AS
        (
        SELECT  m.id,m.entity_name,m.entity_type,m.parent_id
        FROM    associations m
        WHERE   entity_id = $1 AND entity_name = $2
        UNION ALL
        SELECT  m.id,m.entity_name,m.entity_type,m.parent_id
        FROM    q
        JOIN    associations m
        ON      m.id = q.parent_id
        )
        SELECT json_agg(t) FROM PUBLIC.associations can
        JOIN PUBLIC.getTree(can.id) t ON t.table_id = can.id
		JOIN q ON q.id = can.id AND q.entity_name = can.entity_name AND q.parent_id IS NULL`,[ entityID, entityName ])
        /*const  {rows}  = await db.query(`SELECT json_agg(t) FROM PUBLIC.associations can
        JOIN PUBLIC.getTree(can.id) t ON t.table_id = can.id 
		WHERE entity_id = $1 AND entity_name = $2 `,[ entityID, entityName ])*/
       
       
        return rows[0].json_agg
    } catch(e) {
        throw e
    }
}

const getEntityChildrensForAngular = async(data) => {
    try{
        const { entityID, entityName, entityType } = data
        const query = `select a.entity_id as id, a.entity_name as name, a.entity_type as type, a.parent_id,
        a.parent_name, a.parent_type
        from associations a JOIN associations b 
        ON a.parent_id = b.id
        and b.entity_id = $1 and b.entity_name = $2 
        AND b.entity_type =$3`
        
        const  { rows }  = await db.query(query, [entityID, entityName, entityType])

        return rows
    } catch(e) {
        throw e
    }
}

const getAssociationsByEntityForAngular = async(data) => {
    try{
        const { entityID, entityName, entityType } = data
        const  {rows}  = await db.query('select * from associations where entity_id  = $1 AND entity_name = $2 AND entity_type = $3', [ entityID, entityName, entityType ])
        return rows
    } catch(e) {
        throw e
    }
}

const createAssociationsByNodeForAngular = async( data ) => {
    try{
        const { parentName, parentType, entityName, entityID, entityType, isEntityInstance = false } = data
        const result = await db.query('INSERT INTO PUBLIC.associations(parent_id, parent_name, parent_type, entity_name, entity_id, entity_type, is_entity_instance) VALUES (get_id($1),$1, $2, $3, $4, $5, $6)',[ parentName, parentType, entityName, entityID, entityType, isEntityInstance ])
        return result
    } catch(e) {
        throw e
    }
}

const updateAssociationsByNodeForAngular = async( data) => {
    try{
        const { entityID, entityName, entityType, parentName, parentType  } = data

        return await db.query('UPDATE PUBLIC.associations SET entity_name = $2, entity_type = $3, parent_id = get_id($4), parent_name = $4, parent_type = $5 where entity_id = $1 and entity_type = $3',[ entityID, entityName, entityType, parentName, parentType ])

    } catch(e) {
        throw e
    }
}

const getEntityParentsForAngular = async(data) => {
    try{
        const {entityID, entityName, entityType} = data

        let a = `select json_agg(t) as assoc from(`
        let b = ''
        let c =  `)t`
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
        let temp =  `SELECT number${i}.entity_id , number${i}.entity_name as parent_name, 
              number${i}.entity_type from 
              associations x
              JOIN associations number${i}
              on number${i}.node_path = subpath(x.node_path, 0 ${condition})  
              WHERE x.entity_id = $1
              AND x.entity_name = $2
              AND x.entity_type = $3 UNION ALL `
              
        b +=  temp		   
        if(i>=2) {
            break;
        }
        }
        const query = a + b.slice(0, -11) + c

        const result  = await db.query(query, [entityID, entityName, entityType]) 

        return result.rows
    } catch(e) {
        throw e
    }
}

const deleteAssociationsByNodeForAngular = async( data) => {
    try{
        const { entityName, entityID, entityType } = data
            return await db.query('DELETE FROM PUBLIC.associations where entity_name = $1 and entity_id = $2 and  entity_type = $3' ,[ entityName, entityID, entityType ])    
            
    } catch(e) {
        throw e
    }
}

const getParentsAppIDAndBuID = async (data) => {
    try {

        const {entityID, entityName, entityType} = data

        let a = `select t.* from (`
        let b = ''
        let c =  `)t WHERE entity_type in ('Business Unit','Application')`
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
        let temp =  `SELECT number${i}.entity_id, number${i}.entity_name as parent_name, number${i}.entity_type from associations x JOIN associations number${i} on number${i}.node_path = subpath(x.node_path, 0 ${condition}) WHERE x.entity_id = $1 AND x.entity_name = $2 AND x.entity_type = $3 UNION ALL `
              
        b +=  temp		   
        }
        const query = a + b.slice(0, -11) + c

        const result  = await db.query(query, [entityID, entityName, entityType]) 

        return result.rows

    } catch (e) {
        throw e
    }
}

const getAllAssociatedImmediateChildrensAsGroups = async(data) => {

    const { entityID, entityName, entityType} = data
    try{
        const query = `SELECT json_agg(t) as data FROM (
            with bu as
            (SELECT json_agg(a.entity_id) Business_Unit
            FROM associations a JOIN associations b 
            ON a.parent_id = b.id
            AND a.entity_type = 'Business Unit'
            AND b.entity_id = $1 
            AND b.entity_name = $2 
            AND b.entity_type = $3),
            app as
            (SELECT json_agg(a.entity_id) Application
            FROM associations a JOIN associations b 
            ON a.parent_id = b.id
            AND a.entity_type = 'Application'
            AND b.entity_id = $1 
            AND b.entity_name = $2 
            AND b.entity_type = $3),
            ug as
            (SELECT json_agg(a.entity_id) entity      
            FROM associations a JOIN associations b 
            ON a.parent_id = b.id
            AND a.entity_type NOT IN ('User_Group')
            AND b.entity_id = $1 
            AND b.entity_name = $2 
            AND b.entity_type = $3),
            dg as
            (SELECT json_agg(a.entity_id) Device_Group        
            FROM associations a JOIN associations b 
            ON a.parent_id = b.id
            AND a.entity_type NOT IN ('Device Group')
            AND b.entity_id = $1 
            AND b.entity_name = $2
            AND b.entity_type = $3),
            entity as
            (SELECT json_agg(a.entity_id) entity      
            FROM associations a JOIN associations b 
            ON a.parent_id = b.id
            AND a.entity_type NOT IN ('Business Unit','Application','User Group','Device Group')
            AND b.entity_id = $1 
            AND b.entity_name = $2 
            AND b.entity_type = $3)
            select * from bu,app,entity) t`
        const  { rows }  = await db.query(query, [entityID, entityName, entityType,])
        return rows
    } catch(e) {
        throw e
    }
}

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

      /*  const {   entity_id, entity_name , entity_type  } = result.rows[0]

        const data1 = { entityID : entity_id,   entityType  : entity_type, entityName }
       
        const deviceResult = await getAllAssociatedChildrens(data1)

        const deviceGroupIDs = deviceResult[0].json_agg[0].device_group

        const deviceCount = await devicesDB.getDevicesCount(deviceGroupIDs)*/

    } catch (e) {
        throw e
    }
}


// const deAssociateImmediateChildEntities = async (data) => {

//     try{

//         const { entityName, entityID, entityType } = data

//         const associatedList = await getAllAssociatedImmediateChildrensAsGroups(data)

//         if(associatedList.length > 0) {
//             const associatedObj = associatedList[0].data

//             let buIDs = associatedObj[0].business_unit
//             let appIDs = associatedObj[0].application
//             let userGroupIDs = associatedObj[0].user_group
//             let deviceGroupIDs = associatedObj[0].device_group
//             let entityIDs = associatedObj[0].entity

//             if(typeof buIDs != 'undefined' && buIDs != null ){
//                 for(let i = 0; i < buIDs.length; i++) { 
//                     await businessUnitsDB.deAssociateBusinessUnits(buIDs[i])
//                 }
                
//             }

//             if(typeof appIDs != 'undefined' && appIDs != null ){
//                 for(let i = 0; i < appIDs.length; i++) { 
//                     await applicationsDB.deAssociateApplications(appIDs[i])
//                 }
                
//             }

//             if(typeof userGroupIDs != 'undefined' && userGroupIDs != null ){

//                 for(let i = 0; i < userGroupIDs.length; i++){
//                     await userGroupsDB.deAssociateUserGroups(userGroupID[i], entityID, entityName, entityType)
//                 }
                
//             }

//             if(typeof deviceGroupIDs != 'undefined' && deviceGroupIDs != null ){

//                 for(let j = 0; j < deviceGroupIDs.length; j++){
//                     await deviceGroupsDB.deAssociateDeviceGroups(deviceGroupID[i], entityID, entityName, entityType)
//                 }
//             }

//             if(typeof entityIDs != 'undefined' && entityIDs != null ){
//                 for(let i = 0; i < entityIDs.length; i++) { 
//                     await entityDB.deAssociateEntities(entityIDs[i])
//                 }
//             }
//         }

//     } catch(e) {
//         throw e
//     }
// }

module.exports = {
    getAssociationsForAngular,
    getTopLevelEntities,
    getAllAssociationsByEntityID,
    getEntityChildrensForAngular,
    getAssociationsByEntityForAngular,
    createAssociationsByNodeForAngular,
    updateAssociationsByNodeForAngular,
    getEntityParentsForAngular,
    deleteAssociationsByNodeForAngular,
    getAllAssociatedChildrens,
    getParentsAppIDAndBuID,
    getAllAssociatedImmediateChildrensAsGroups,
    getParentApptoFindSiblings
    //,
    //deAssociateImmediateChildEntities
}
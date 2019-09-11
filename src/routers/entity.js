const express = require('express')
const entityDB = require('../db/entityDB')
const commonUtils = require('../utils/commonUtils')
const router = new express.Router()


router.get('/getEntity', async (req, res) => {
    try{
        const result = await entityDB.getEntity()
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getEntityByName', async (req, res) => {
    try{
        const name = req.query.name
        const result = await entityDB.getEntityByName(name)
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getEntityForEdit', async (req, res) => {
    try{
        let {  entityID } = req.query
        const result = await entityDB.getEntityForEdit(entityID)
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.post('/createEntity', async (req, res) => {
    try{
        let {  entityID, entityName, entityType, isShareable, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType, createdBy, entityMetadata, isParentIsEntity, newEntityMetadata, removedEntityMetadata } = req.body
        
        let keys = []

        if(entityMetadata !== null && typeof entityMetadata != 'undefined'  ) {
            if(entityMetadata.length > 0){
                for(let key in entityMetadata[0]) keys.push(key)
            }
        }

        const data = {  entityName, entityType, isShareable, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType, createdBy, entityMetadata, isParentIsEntity, keys } 

        if(entityID == null || entityID == '') {

            entityID = await entityDB.createEntity(data)

            if(entityMetadata !== null && typeof entityMetadata != 'undefined' ) {
            
                for(let i = 0; i < entityMetadata.length ; i++ ){
                    const entityData = {  entityID, entityName, entityType, entityMetadata : entityMetadata[i] }
                    await entityDB.createEntityMetadata(entityData)
                }
            }

        } else {

            if(newEntityMetadata !== null && typeof newEntityMetadata != 'undefined' ) {
            
                for(let j = 0; j < newEntityMetadata.length ; j++ ){
                    const entityData = {  entityID, entityName, entityType, entityMetadata : newEntityMetadata[j] }
                    await entityDB.createEntityMetadata(entityData)
                }
            }

            if(removedEntityMetadata !== null && typeof removedEntityMetadata != 'undefined' ) {
            
                for(let k = 0; k < removedEntityMetadata.length ; k++ ){
                    await entityDB.deleteEntityMetadata(removedEntityMetadata[k].entity_metadata_id)
                }
            }
        }

        res.status(200).json({ status : 200, result : `Entity Created with the ID ${entityID}` })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.post('/updateEntity', async (req, res) => {
    try{
        const {  entityID, entityName, entityType, isShareable, oldParentID, oldParentType, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType, modifiedBy, isParentIsEntity, entityMetadata, keys } = req.body
        
        let paresentKeys = []

        if(entityMetadata !== null && typeof entityMetadata != 'undefined'  ) {
            if(entityMetadata.length > 0){
                for(let key in entityMetadata[0]) paresentKeys.push(key)
            }
        }

        const newKeys = commonUtils.mergeTwoArraysRemoveDuplicates(keys, paresentKeys)

        const data = {  entityID, entityName, entityType, isShareable, oldParentID, oldParentType, parentID, parentName, parentType, grandParentID, grandParentName, grandParentType, modifiedBy, isParentIsEntity, keys : newKeys }         
        await entityDB.updateEntity(data)

        if(entityMetadata !== null && typeof entityMetadata != 'undefined' ) {
            
            for(let i = 0; i < entityMetadata.length ; i++ ){
                const entityData = {  entityID, entityName, entityType, entityMetadata : entityMetadata[i]}
                await entityDB.createEntityMetadata(entityData)
            }
        }
        res.status(200).json({ status : 200, result : `Entity Updated Successfully` })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.post('/deleteEntity', async (req, res) => {
    try{
        const {  entityID, entityName, entityType, modifiedBy } = req.body
        const data = {  entityID, entityName, entityType, modifiedBy } 
        
        await entityDB.deleteEntity(data)
        
        res.status(200).json({ status : 200, result : `Entity Deleted Successfully` })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})


router.post('/activateEntity', async (req, res) => {
    try{
        const {  entityID, modifiedBy } = req.body
        const data = {  entityID, modifiedBy } 
        
        await entityDB.activateEntity(data)
        
        res.status(200).json({ status : 200, result : `Entity Activated Successfully` })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.post('/createEntityMetadata', async (req, res) => {
    try{
        const {  entityID, entityName, entityType, entityMetadata } = req.body
        const data = {  entityID, entityMetadata }
        const result = await entityDB.createEntityMetadata(data)
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.get('/getEntityMetadataByEntityID', async (req, res) => {
    try{
        const entityID = req.query.entityID
        const result = await entityDB.getEntityMetadataByEntityID(entityID)
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.post('/updateEntityMetadata', async (req, res) => {
    try{
        const {  id, entityMetadata } = req.body
        const data = {  id, entityMetadata }
        const result = await entityDB.updateEntityMetadata(data)
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

router.delete('/deleteEntityMetadata', async (req, res) => {
    try{
        const id = req.query.id
        const result = await entityDB.deleteEntityMetadata(id)
        res.status(200).json({ status : 200, result })

    } catch (e){ 
        res.status(500).json({ status : 500, error : e.toString()})
    }
})

module.exports = router
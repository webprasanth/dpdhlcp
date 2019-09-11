/**
* @swagger
* paths:
*   /businessUnits/getBusinessUnits:
*     post:
*       description: ''
*       summary: getBusinessUnit
*       tags:
*       - BusinessUnits
*       operationId: GetBusinessUnitsPost
*       deprecated: false
*       produces:
*       - application/json
*       parameters:
*       - name: Content-Type
*         in: header
*         required: true
*         type: string
*         description: ''
*         default: application/json
*       - name: Body
*         in: body
*         required: true
*         description: ''
*         schema:
*           $ref: '#/definitions/getBusinessUnitRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /businessUnits/getAllBusinessUnits:
*     get:
*       description: ''
*       summary: getAllBusinessUnits
*       tags:
*       - BusinessUnits
*       operationId: GetAllBusinessUnitsGet
*       deprecated: false
*       produces:
*       - application/json
*       parameters: []
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /businessUnits/getBusinessUnitByID:
*     get:
*       description: ''
*       summary: getBusinessUnitByID
*       tags:
*       - BusinessUnits
*       operationId: GetBusinessUnitByIDGet
*       deprecated: false
*       produces:
*       - application/json
*       parameters:
*       - name: id
*         in: query
*         required: true
*         type: integer
*         format: int32
*         description: ''
*         default: application/json
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /businessUnits/createBusinessUnit:
*     post:
*       description: ''
*       summary: createBusinessUnit
*       tags:
*       - BusinessUnits
*       operationId: CreateBusinessUnitPost
*       deprecated: false
*       produces:
*       - application/json
*       parameters:
*       - name: Content-Type
*         in: header
*         required: true
*         type: string
*         description: ''
*       - name: Body
*         in: body
*         required: true
*         description: ''
*         default: application/json
*         schema:
*           $ref: '#/definitions/createBusinessUnitRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /businessUnits/updateBusinessUnit:
*     patch:
*       description: ''
*       summary: updateBusinessUnit
*       tags:
*       - BusinessUnits
*       operationId: UpdateBusinessUnitPatch
*       deprecated: false
*       produces:
*       - application/json
*       parameters:
*       - name: Content-Type
*         in: header
*         required: true
*         type: string
*         description: ''
*       - name: Body
*         in: body
*         required: true
*         description: ''
*         default: application/json
*         schema:
*           $ref: '#/definitions/updateBusinessUnitRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /businessUnits/deleteBusinessUnit:
*     delete:
*       description: ''
*       summary: deleteBusinessUnit
*       tags:
*       - BusinessUnits
*       operationId: DeleteBusinessUnitDelete
*       deprecated: false
*       produces:
*       - application/json
*       parameters:
*       - name: id
*         in: query
*         required: true
*         type: integer
*         format: int32
*         description: ''
*       - name: Content-Type
*         in: header
*         required: true
*         type: string
*         description: ''
*         default: application/json
*       responses:
*         200:
*           description: ''
*           headers: {}
* definitions:
*   getBusinessUnitRequest:
*     title: getBusinessUnitRequest
*     example:
*       pageNumber: 1
*       pageSize: 10
*       search: 
*       sortColumn: id
*       sortType: 0
*     type: object
*     properties:
*       pageNumber:
*         type: integer
*         format: int32
*       pageSize:
*         type: integer
*         format: int32
*       search:
*         type: string
*       sortColumn:
*         type: string
*       sortType:
*         type: integer
*         format: int32
*     required:
*     - pageNumber
*     - pageSize
*     - sortColumn
*     - sortType
*   createBusinessUnitRequest:
*     title: createBusinessUnitRequest
*     example:
*       name: Business unit-1
*       shortName: BU1
*       description: Global Business
*       owner: John
*       createdBy: John
*       UserGroup: GBS
*       imgName: ''
*     type: object
*     properties:
*       name:
*         type: string
*       shortName:
*         type: string
*       description:
*         type: string
*       owner:
*         type: string
*       createdBy:
*         type: string
*       UserGroup:
*         type: string
*       imgName:
*         type: string
*     required:
*     - name
*     - shortName
*     - description
*     - owner
*     - createdBy
*     - UserGroup
*     - imgName
*   updateBusinessUnitRequest:
*     title: updateBusinessUnitRequest
*     example:
*       id: 100004
*       name: Business unit-GBS
*       shortName: BUGBS
*       description: Global Business
*       owner: John
*       modifiedBy: John
*       UserGroup: GBS
*       imgName: ''
*     type: object
*     properties:
*       id:
*         type: integer
*         format: int32
*       name:
*         type: string
*       shortName:
*         type: string
*       description:
*         type: string
*       owner:
*         type: string
*       modifiedBy:
*         type: string
*       UserGroup:
*         type: string
*       imgName:
*         type: string
*     required:
*     - id
*     - name
*     - shortName
*     - description
*     - owner
*     - modifiedBy
*     - UserGroup
*     - imgName
* tags:
* - name: BusinessUnits
*   description: ''
*/ 
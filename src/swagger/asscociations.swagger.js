/**
* @swagger
* paths:
*   /associations/getAssociations:
*     get:
*       description: ''
*       summary: getAssociations
*       tags:
*       - Associations
*       operationId: GetAssociationsGet
*       deprecated: false
*       produces:
*       - application/json
*       parameters: []
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /associations/getAssociationsByBu:
*     get:
*       description: ''
*       summary: getAssociationsByBu?bu=bu1
*       tags:
*       - Associations
*       operationId: GetAssociationsByBuGet
*       deprecated: false
*       produces:
*       - application/json
*       parameters:
*       - name: bu
*         in: query
*         required: true
*         type: string
*         description: ''
*         default: application/json
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /associations/createAssociationsByJson:
*     post:
*       description: ''
*       summary: createAssociationsByJson
*       tags:
*       - Associations
*       operationId: CreateAssociationsByJsonPost
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
*           $ref: '#/definitions/createAssociationsByJsonRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /associations/createAssociationsByNode:
*     post:
*       description: ''
*       summary: createAssociationsByNode
*       tags:
*       - Associations
*       operationId: CreateAssociationsByNodePost
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
*           $ref: '#/definitions/createAssociationsByNodeRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /associations/updateAssociationsByNode:
*     patch:
*       description: ''
*       summary: UpdateAssociationsByNode
*       tags:
*       - Associations
*       operationId: UpdateAssociationsByNodePatch
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
*           $ref: '#/definitions/UpdateAssociationsByNodeRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /associations/deleteAssociationsByNode:
*     delete:
*       description: ''
*       summary: deleteAssociationsByNode
*       tags:
*       - Associations
*       operationId: DeleteAssociationsByNodeDelete
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
*           $ref: '#/definitions/deleteAssociationsByNodeRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
* definitions:
*   createAssociationsByJsonRequest:
*     title: createAssociationsByJsonRequest
*     example:
*       associationJson:
*       - id: 16
*         parent_id: 
*         parent_node: Bu1
*         node: Bu1
*         node_orig_id: 2
*         node_type: Business Unit
*         node_path: 16
*         children:
*         - id: 17
*           parent_id: 16
*           parent_node: Bu1
*           node: App1
*           node_orig_id: 2
*           node_type: Application
*           node_path: 16.17
*           depth: 1
*           children:
*           - id: 24
*             parent_id: 17
*             parent_node: App1
*             node: Device1
*             node_orig_id: 1
*             node_type: Device
*             node_path: 16.17.24
*             depth: 2
*             children: []
*           - id: 21
*             parent_id: 17
*             parent_node: App1
*             node: User1
*             node_orig_id: 1
*             node_type: User
*             node_path: 16.17.21
*             depth: 2
*             children: []
*       - id: 18
*         parent_id: 
*         parent_node: Bu2
*         node: Bu2
*         node_orig_id: 3
*         node_type: Business Unit
*         node_path: 18
*         children:
*         - id: 19
*           parent_id: 18
*           parent_node: Bu2
*           node: App2
*           node_orig_id: 3
*           node_type: Application
*           node_path: 18.19
*           depth: 1
*           children:
*           - id: 23
*             parent_id: 19
*             parent_node: App2
*             node: Device2
*             node_orig_id: 2
*             node_type: Device
*             node_path: 18.19.23
*             depth: 2
*             children: []
*           - id: 22
*             parent_id: 19
*             parent_node: App2
*             node: Device1
*             node_orig_id: 1
*             node_type: Device
*             node_path: 18.19.22
*             depth: 2
*             children: []
*           - id: 20
*             parent_id: 19
*             parent_node: App2
*             node: User5
*             node_orig_id: 5
*             node_type: User
*             node_path: 18.19.20
*             depth: 2
*             children: []
*     type: object
*     properties:
*       associationJson:
*         type: array
*         items:
*           $ref: '#/definitions/AssociationJson'
*     required:
*     - associationJson
*   AssociationJson:
*     title: AssociationJson
*     example:
*       id: 16
*       parent_id: 
*       parent_node: Bu1
*       node: Bu1
*       node_orig_id: 2
*       node_type: Business Unit
*       node_path: 16
*       children:
*       - id: 17
*         parent_id: 16
*         parent_node: Bu1
*         node: App1
*         node_orig_id: 2
*         node_type: Application
*         node_path: 16.17
*         depth: 1
*         children:
*         - id: 24
*           parent_id: 17
*           parent_node: App1
*           node: Device1
*           node_orig_id: 1
*           node_type: Device
*           node_path: 16.17.24
*           depth: 2
*           children: []
*         - id: 21
*           parent_id: 17
*           parent_node: App1
*           node: User1
*           node_orig_id: 1
*           node_type: User
*           node_path: 16.17.21
*           depth: 2
*           children: []
*     type: object
*     properties:
*       id:
*         type: integer
*         format: int32
*       parent_id:
*         type: string
*       parent_node:
*         type: string
*       node:
*         type: string
*       node_orig_id:
*         type: integer
*         format: int32
*       node_type:
*         type: string
*       node_path:
*         type: string
*       children:
*         type: array
*         items:
*           $ref: '#/definitions/Child'
*     required:
*     - id
*     - parent_node
*     - node
*     - node_orig_id
*     - node_type
*     - node_path
*     - children
*   Child:
*     title: Child
*     example:
*       id: 17
*       parent_id: 16
*       parent_node: Bu1
*       node: App1
*       node_orig_id: 2
*       node_type: Application
*       node_path: 16.17
*       depth: 1
*       children:
*       - id: 24
*         parent_id: 17
*         parent_node: App1
*         node: Device1
*         node_orig_id: 1
*         node_type: Device
*         node_path: 16.17.24
*         depth: 2
*         children: []
*       - id: 21
*         parent_id: 17
*         parent_node: App1
*         node: User1
*         node_orig_id: 1
*         node_type: User
*         node_path: 16.17.21
*         depth: 2
*         children: []
*     type: object
*     properties:
*       id:
*         type: integer
*         format: int32
*       parent_id:
*         type: integer
*         format: int32
*       parent_node:
*         type: string
*       node:
*         type: string
*       node_orig_id:
*         type: integer
*         format: int32
*       node_type:
*         type: string
*       node_path:
*         type: string
*       depth:
*         type: integer
*         format: int32
*       children:
*         type: array
*         items:
*           $ref: '#/definitions/Child1'
*     required:
*     - id
*     - parent_id
*     - parent_node
*     - node
*     - node_orig_id
*     - node_type
*     - node_path
*     - depth
*     - children
*   Child1:
*     title: Child1
*     example:
*       id: 24
*       parent_id: 17
*       parent_node: App1
*       node: Device1
*       node_orig_id: 1
*       node_type: Device
*       node_path: 16.17.24
*       depth: 2
*       children: []
*     type: object
*     properties:
*       id:
*         type: integer
*         format: int32
*       parent_id:
*         type: integer
*         format: int32
*       parent_node:
*         type: string
*       node:
*         type: string
*       node_orig_id:
*         type: integer
*         format: int32
*       node_type:
*         type: string
*       node_path:
*         type: string
*       depth:
*         type: integer
*         format: int32
*       children:
*         type: array
*         items:
*           type: string
*     required:
*     - id
*     - parent_id
*     - parent_node
*     - node
*     - node_orig_id
*     - node_type
*     - node_path
*     - depth
*     - children
*   createAssociationsByNodeRequest:
*     title: createAssociationsByNodeRequest
*     example:
*       parentNode: App3
*       node: User7
*       nodeType: User
*     type: object
*     properties:
*       parentNode:
*         type: string
*       node:
*         type: string
*       nodeType:
*         type: string
*     required:
*     - parentNode
*     - node
*     - nodeType
*   UpdateAssociationsByNodeRequest:
*     title: UpdateAssociationsByNodeRequest
*     example:
*       node: Device_Sample
*       nodeOrigId: 1
*       nodeType: Device
*       parentNode: App1
*     type: object
*     properties:
*       node:
*         type: string
*       nodeOrigId:
*         type: integer
*         format: int32
*       nodeType:
*         type: string
*       parentNode:
*         type: string
*     required:
*     - node
*     - nodeOrigId
*     - nodeType
*     - parentNode
*   deleteAssociationsByNodeRequest:
*     title: deleteAssociationsByNodeRequest
*     example:
*       node: Bu1
*       nodeOrigId: 2
*       nodeType: Business Unit
*       parentNode: 
*     type: object
*     properties:
*       node:
*         type: string
*       nodeOrigId:
*         type: integer
*         format: int32
*       nodeType:
*         type: string
*       parentNode:
*         type: string
*     required:
*     - node
*     - nodeOrigId
*     - nodeType
* tags:
* - name: Associations
*   description: ''
*/ 
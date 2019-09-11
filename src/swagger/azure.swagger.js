/**
* @swagger
* paths:
*   /azure/getBlobStorageURL:
*     post:
*       description: ''
*       summary: getBlobStorageURL
*       tags:
*       - Azure
*       operationId: GetBlobStorageURLPost
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
*           $ref: '#/definitions/getBlobStorageURLRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /azure/uploadFileToBlobStorage:
*     post:
*       description: ''
*       summary: uploadImageToBlobStorage
*       tags:
*       - Azure
*       operationId: UploadFileToBlobStoragePost
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
*           $ref: '#/definitions/uploadImageToBlobStorageRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /azure/readFileFromBlobStorage:
*     post:
*       description: ''
*       summary: readFileFromBlobStorage
*       tags:
*       - Azure
*       operationId: ReadFileFromBlobStoragePost
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
*           $ref: '#/definitions/readFileFromBlobStorageRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /azure/deleteBlobStorage:
*     post:
*       description: ''
*       summary: deleteBlobStorage
*       tags:
*       - Azure
*       operationId: DeleteBlobStoragePost
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
*           $ref: '#/definitions/deleteBlobStorageRequest'
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /azure/fetchAccesstoken:
*     get:
*       description: ''
*       summary: fetchAccesstoken
*       tags:
*       - Azure
*       operationId: FetchAccesstokenGet
*       deprecated: false
*       produces:
*       - application/json
*       parameters: []
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /azure/fetchAccesstokenFromGraph:
*     get:
*       description: ''
*       summary: fetchAccesstokenFromGraph
*       tags:
*       - Azure
*       operationId: fetchAccesstokenFromGraph
*       deprecated: false
*       produces:
*       - application/json
*       parameters: []
*       responses:
*         200:
*           description: ''
*           headers: {}
*   /azure/getAzureResourceGroups:
*     get:
*       description: ''
*       summary: getAzureResourceGroups
*       tags:
*       - Azure
*       operationId: GetAzureResourceGroupsGet
*       deprecated: false
*       produces:
*       - application/json
*       parameters: []
*       responses:
*         200:
*           description: ''
*           headers: {}
* definitions:
*   getBlobStorageURLRequest:
*     title: getBlobStorageURLRequest
*     example:
*       blobName: BU_Business unit-1_Tue Jun 18 2019
*     type: object
*     properties:
*       blobName:
*         type: string
*     required:
*     - blobName
*   uploadImageToBlobStorageRequest:
*     title: uploadImageToBlobStorageRequest
*     example:
*       blobName: BU_Business unit-1_Wed Jun 19 2019
*       rawData: data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==
*     type: object
*     properties:
*       blobName:
*         type: string
*       rawData:
*         type: string
*     required:
*     - blobName
*     - rawData
*   readFileFromBlobStorageRequest:
*     title: readFileFromBlobStorageRequest
*     example:
*       blobName: TestBase64
*     type: object
*     properties:
*       blobName:
*         type: string
*     required:
*     - blobName
*   deleteBlobStorageRequest:
*     title: deleteBlobStorageRequest
*     example:
*       blobName: TestBase64
*     type: object
*     properties:
*       blobName:
*         type: string
*     required:
*     - blobName
* tags:
* - name: Azure
*   description: ''
*/ 
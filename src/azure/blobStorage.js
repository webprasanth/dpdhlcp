const azureStorage = require('azure-storage')
const request = require('request')

const { azureContainerName, azureStorageConnectionStr } =  require('../config')
const blobService = azureStorage.createBlobService(azureStorageConnectionStr)

const uploadToBlobStorage = async (filePath, blobName) => {
    try {
        return new Promise((resolve, reject) => {
            blobService.createBlockBlobFromLocalFile(azureContainerName, blobName, filePath, err => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    } catch (e) {
        throw e
    }
}

const deleteBlobStorage = async (blobName) => {
    try {
        return new Promise((resolve, reject) => {
            blobService.deleteBlobIfExists(azureContainerName, blobName, err => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    } catch (e) {
        throw e
    }
}

const getBlobStorageURL = async (blobName) => {
    try{ 
        const startDate = new Date();
        const expiryDate = new Date(startDate);
        expiryDate.setMinutes(startDate.getMinutes() + 100);
        startDate.setMinutes(startDate.getMinutes() - 100);
        
        const sharedAccessPolicy = {
            AccessPolicy: {
                Permissions: azureStorage.BlobUtilities.SharedAccessPermissions.READ,
                Start: startDate,
                Expiry: expiryDate
            }
        }
        
        const token = blobService.generateSharedAccessSignature(azureContainerName, blobName, sharedAccessPolicy);
        const url = blobService.getUrl(azureContainerName, blobName, token)
        
        return url

    } catch (e) {
        throw e
    }
}

const uploadFileToBlobStorage = async (rawdata, blobName) => {
    try {
        return new Promise((resolve, reject) => {
            const matches = rawdata.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
            const type = matches[1]
            //const buffer = Buffer.from(rawdata, 'base64')
            blobService.createBlockBlobFromText(azureContainerName, blobName, rawdata, {contentType:type}, (err, result, response) => {
                if (err) {
                    reject(err)
                }else{
                    resolve()
                }
            })
        })
    } catch (e) {
        throw e
    }
}

const readFileFromBlobStorage = async (blobName) => {
    try {
        return new Promise((resolve, reject) => {

            blobService.getBlobProperties(
                azureContainerName,
                blobName,
                function(err, properties, status) {
                    if (status.isSuccessful) {
                        blobService.getBlobToText(azureContainerName, blobName, (err1, text) => {
                            if(err1){
                                reject(err1)
                            } else {
                               //var data = JSON.parse(text)
                               resolve(text)
                            }
                        })
                    } else {
                        const text = ''
                        resolve(text)
                    }
                })
            
        })
    } catch (e) {
        throw e
    }
}

const fetchAccesstoken = async () => {
    return new Promise(async (resolve, reject) => {
        const options = {
            method: 'POST',
            url: 'https://login.microsoftonline.com/cd99fef8-1cd3-4a2a-9bdf-15531181d65e/oauth2/token',
            headers:
            {
                'content-type': 'application/x-www-form-urlencoded',
                accept: 'application/json'
            },
            form:
            {
                grant_type: 'client_credentials',
                client_id: 'de21588f-0dc0-4133-8530-22443ca5eadd',
                client_secret: 'x/S9opfi9zLKMKsey0ZHEAUqdm9H9REVAUTJOYwZMwA=',
                resource: 'https://management.azure.com'
            }
        };
    
        await request(options, function (error, response, body) { 
            if (error) {
                reject(error)
            } else {
                const data = JSON.parse(body)
                const accessToken = data.access_token
                resolve({ accessToken })
            }
        })
    })
}

const fetchAccesstokenFromGraph = async () => {
    return new Promise(async (resolve, reject) => {
        const options = {
            method: 'POST',
            url: 'https://login.microsoftonline.com/cd99fef8-1cd3-4a2a-9bdf-15531181d65e/oauth2/token',
            headers:
            {
                'content-type': 'application/x-www-form-urlencoded',
                accept: 'application/json'
            },
            form:
            {
                grant_type: 'client_credentials',
                client_id: 'de21588f-0dc0-4133-8530-22443ca5eadd',
                client_secret: 'x/S9opfi9zLKMKsey0ZHEAUqdm9H9REVAUTJOYwZMwA=',
                resource: 'https://graph.microsoft.com'
            }
        };
    
        await request(options, function (error, response, body) { 
            if (error) {
                reject(error)
            } else {
                const data = JSON.parse(body)
                const accessToken = data.access_token
                resolve({ accessToken })
            }
        })
    })
}

const getAzureResourceGroups = async () => {
    return new Promise(async (resolve, reject) => {
        await fetchAccesstoken().then(async(data) => {
            var queryParam = "https://management.azure.com/subscriptions/ed03d0f8-d22c-4c9d-b117-266f95c38df0/resourcegroups?api-version=2019-05-01"
            var options = {
                method: 'GET',
                url: queryParam,
                headers: {
                    "Authorization": "Bearer "+ data.accessToken,
                    "Content-Type": "application/json"
                }
            }

            await request(options, (error, response, body) => { 
                if (error) {
                    reject(error)

                } else {
                    const resourceGroup = []
                    const result = JSON.parse(body)
                    if(result.value) {
                        const filteredData = result.value.filter(obj => {
                            resourceGroup.push(obj.name)
                            return obj.name
                        })
                        resolve(resourceGroup)
                    }
                    resolve(resourceGroup)
                }
            })
    
        }).catch((e) => {
            reject(e)
        })
    })
}
 
module.exports = {
    uploadToBlobStorage,
    deleteBlobStorage,
    getBlobStorageURL,
    uploadFileToBlobStorage,
    readFileFromBlobStorage,
    fetchAccesstoken,
    fetchAccesstokenFromGraph,
    getAzureResourceGroups
}
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
const endpoint = process.env["AZURE_OPENAI_ENDPOINT"];
const azureApiKey = process.env["AZURE_OPENAI_KEY"];
const deploymentId = process.env["AZURE_DEPLOYMENT_ID"];

const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));

module.exports = {client,deploymentId};
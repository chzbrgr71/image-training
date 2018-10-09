const { events, Job, Group } = require('brigadier')

events.on("push", (brigadeEvent, project) => {
    
    // setup variables
    var acrName = project.secrets.acrName
    var azServicePrincipal = project.secrets.azServicePrincipal
    var azClientSecret = project.secrets.azClientSecret
    var azTenant = project.secrets.azTenant
    var slackWebhook = project.secrets.slackWebhook
    var gitPayload = JSON.parse(brigadeEvent.payload)
    var gitSHA = brigadeEvent.revision.commit.substr(0,7)
    var branch = getBranch(gitPayload)    
    var imageTag = branch + "-" + gitSHA

    console.log(`==> gitHub webook on ${branch} branch with commit ID ${gitSHA}`)
    console.log(`servprin=${azServicePrincipal}`)
    console.log(`secret=${azClientSecret}`)
    console.log(`tenant=${azTenant}`)

    // setup brigade job to build container images
    var acr = new Job("job-runner-acr-builder")
    acr.storage.enabled = false
    acr.image = "briaracr.azurecr.io/chzbrgr71/microsoft/azure-cli:2.0.46"
    acr.tasks = [
        `cd /src`,
        `az login --service-principal -u ${azServicePrincipal} -p ${azClientSecret} --tenant ${azTenant}`,
        `az acr build -t chzbrgr71/image-retrain:${imageTag} -r ${acrName} .`
    ]

    // setup brigade job deploying TFJob in Kubernetes
    var helm = new Job("job-runner-helm")
    helm.storage.enabled = false
    helm.image = "briaracr.azurecr.io/chzbrgr71/k8s-helm:v2.10.0"
    helm.tasks = [
        `helm install --name image-retrain --set imageTag=${imageTag} ./chart`
    ]

    // create a brigade group and run
    var pipeline = new Group()
    pipeline.add(acr)
    pipeline.add(helm)
    pipeline.runEach()

})

events.on("after", (event, proj) => {

    console.log("brigade pipeline finished successfully")
    
})

function getBranch (p) {
    if (p.ref) {
        return p.ref.substring(11)
    } else {
        return "PR"
    }
}
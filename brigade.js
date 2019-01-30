const { events, Job, Group } = require('brigadier')

events.on("push", (brigadeEvent, project) => {
    
    // setup variables
    var acrName = project.secrets.acrName
    var azServicePrincipal = project.secrets.azServicePrincipal
    var azClientSecret = project.secrets.azClientSecret
    var azTenant = project.secrets.azTenant
    var gitPayload = JSON.parse(brigadeEvent.payload)
    var gitSHA = brigadeEvent.revision.commit.substr(0,7)
    var branch = getBranch(gitPayload)
    var image = "chzbrgr71/image-retrain"
    var imageTag = gitSHA
    var jobIdentifier = gitSHA

    console.log(`==> gitHub webook on ${branch} branch with commit ID ${gitSHA}`)

    // setup brigade job to build container images
    var acr = new Job("job-runner-acr-task")
    acr.storage.enabled = false
    acr.image = "microsoft/azure-cli:2.0.55"
    acr.tasks = [
        `cd /src`,
        `az login --service-principal -u ${azServicePrincipal} -p ${azClientSecret} --tenant ${azTenant}`,
        `az acr build -t ${image}:${imageTag} -r ${acrName} .`
    ]
    
    // setup brigade job to run training job in kubernetes
    var helm = new Job("job-runner-helm")
    helm.storage.enabled = false
    helm.image = "lachlanevenson/k8s-helm:v2.12.3"
    helm.tasks = [
        `helm install --name tf-training --set name=${jobIdentifier},container.image=${image},container.imageTag=${imageTag} ./src/chart-deploy`
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
# image-training updated

helm install --name brig-proj-training brigade/brigade-project -f brig-proj-training.yaml

### To run a build manually
az acr run -r briar -f acr-task.yaml https://github.com/chzbrgr71/image-training.git

### Setup Github webhook

```bash
ACR_NAME=briar
GIT_PAT=
SLACK_WEBHOOK=

az acr task create \
    --registry $ACR_NAME \
    --name tf-image-training \
    --context https://github.com/chzbrgr71/image-training.git \
    --branch master \
    --file acr-task.yaml \
    --git-access-token $GIT_PAT \
    --set-secret SLACK_WEBHOOK=$SLACK_WEBHOOK
```

### Helm Commands

```
helm install --set container.image=briar.azurecr.io/chzbrgr71/image-retrain,container.imageTag=1.8-gpu,container.pvcName=azure-files-backup,tfjob.name=tfjob-image-training ./chart

helm install --set tensorboard.name=tensorboard-image-training,container.pvcName=azure-files-backup,container.subPath=tfjob-briar ./tensorboard-chart
```
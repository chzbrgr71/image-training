# image-training updated

helm install --name brig-proj-training brigade/brigade-project -f brig-proj-training.yaml

### To run a build manually
az acr run -r briaracr -f acr-task.yaml https://github.com/chzbrgr71/image-training.git

### Setup Github webhook

```bash
ACR_NAME=briaracr    
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
briaracr.azurecr.io/chzbrgr71/image-retrain:acr-task-ca12

helm install --name image-retrain --set image=briaracr.azurecr.io/chzbrgr71/image-retrain,imageTag=1.0 ./chart
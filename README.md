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

### Commands

* Run training

```
helm install --set container.image=briar.azurecr.io/chzbrgr71/image-retrain,container.imageTag=build-cb9,container.pvcName=azure-files,tfjob.name=tfjob-brianredmond ./chart

helm install --set tensorboard.name=tensorboard-brianredmond,container.pvcName=azure-files,container.subPath=tfjob-brianredmond ./tensorboard-chart
```

* Download model (while TB pod is running)

```bash        
# to download model from pod
PODNAME=
kubectl cp default/$PODNAME:/tmp/tensorflow/tf-output/retrained_graph.pb ~/Downloads/retrained_graph.pb
kubectl cp default/$PODNAME:/tmp/tensorflow/tf-output/retrained_labels.txt ~/Downloads/retrained_labels.txt
```
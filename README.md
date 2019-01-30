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

* Local machine

```bash
docker build -t chzbrgr71/tf-training .

docker run -d --name tf \
--volume /Users/brianredmond/gopath/src/github.com/chzbrgr71/image-training/output:/output \
chzbrgr71/tf-training \
--bottleneck_dir=bottlenecks \
--model_dir=/tmp/tensorflow/tf-output/inception \
--summaries_dir=/output/training_summaries/baseline \
--output_graph=/output/retrained_graph.pb \
--output_labels=/output/retrained_labels.txt \
--image_dir=images \
--learning_rate=0.01 \
--train_batch_size=100

# tensorboard
/usr/local/bin/tensorboard --logdir /tmp/tensorflow/tf-output/training_summaries/baseline

 docker run -d --name tensorboard \
 -p 6006:6006 \
 --volume /Users/brianredmond/gopath/src/github.com/chzbrgr71/image-training/output:/output \
 chzbrgr71/tensorboard:1.9 \
 --logdir=/output/training_summaries
```

### Testing without Kubeflow

* Setup storage

```bash
export RG_NAME=MC_briar-aks-east-100_briar-aks-east-100_eastus
export STORAGE=briartftraining

az storage account create --resource-group $RG_NAME --name $STORAGE --sku Standard_LRS
```

```bash
kubectl create -f ./k8s/sc.yaml
kubectl create -f ./k8s/pvc.yaml
```

* Deploy

```bash
helm install --name tf-training ./chart-deploy
```
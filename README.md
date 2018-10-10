# image-training updated

helm install --name brig-proj-training brigade/brigade-project -f brig-proj-training.yaml

az acr run -r briaracr -f acr-task.yaml https://github.com/chzbrgr71/image-training.git
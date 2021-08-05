# TODO: Find a way to make all targets phony by default
.PHONY: all blockchain bootstraper

all: blockchain bootstraper

blockchain:
	@echo "» Building deployment manager..."
	cd core/deployment-manager; ./mvnw spring-boot:build-image
	docker tag deployment-manager:0.0.1-SNAPSHOT gcr.io/alexis-de-la-torre/deployment-manager
	docker push gcr.io/alexis-de-la-torre/deployment-manager
	@echo "» Building bootstraper..."
	docker build -t gcr.io/alexis-de-la-torre/bootstraper core/bootstraper
	docker push gcr.io/alexis-de-la-torre/bootstraper
	@echo "» Deploying..."
	nomad job run jobs/blockchain.nomad

# TODO: Make building/deploying a generic function
bootstraper:
	@echo "» Building..."
	docker build -t gcr.io/alexis-de-la-torre/bootstraper core/bootstraper
	docker push gcr.io/alexis-de-la-torre/bootstraper
	@echo "» Deploying..."
	nomad job run jobs/bootstraper.nomad

clean:
	nomad job stop -purge bootstraper
	nomad job stop -purge blockchain
	nomad system reconcile summaries
# TODO: Find a way to make all targets phony by default
.PHONY: all blockchain

all: blockchain

blockchain:
	@echo "» Building deployment manager..."
	cd core/deployment-manager; mvn spring-boot:build-image
	docker tag deployment-manager:0.0.1-SNAPSHOT gcr.io/alexis-de-la-torre/deployment-manager
	docker push gcr.io/alexis-de-la-torre/deployment-manager
	@echo "» Building bootstraper..."
	docker build -t gcr.io/alexis-de-la-torre/bootstraper core/bootstraper
	docker push gcr.io/alexis-de-la-torre/bootstraper
	@echo "» Deploying..."
	nomad job run jobs/blockchain.nomad

frontend:
	@echo "» Building frontend..."
	docker build core/frontend -t gcr.io/alexis-de-la-torre/frontend
	docker push gcr.io/alexis-de-la-torre/frontend
	@echo "» Deploying..."
	nomad run jobs/frontend.nomad

clean:
	nomad job stop -purge bootstraper
	nomad job stop -purge blockchain
	nomad system reconcile summaries
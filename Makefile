all: blockchain blockchain-data-manager explorer frontend

clean:
	-nomad job stop -purge blockchain
	-nomad job stop -purge blockchain-data-manager
	-nomad job stop -purge explorer
	-nomad job stop -purge frontend
	-nomad system reconcile summaries

blockchain:
	@echo "» No building necessary for Blockchain"
	@echo "» Deploying Blockchain"
	nomad job run jobs/blockchain.nomad

blockchain-data-manager:
	@echo "» Building Blockchain Data Manager"
	cd components/blockchain-data-manager; mvn spring-boot:build-image
	docker tag blockchain-data-manager:0.0.1-SNAPSHOT gcr.io/alexis-de-la-torre/blockchain-data-manager
	docker push gcr.io/alexis-de-la-torre/blockchain-data-manager
	@echo "» Building Bootstraper"
	docker build -t gcr.io/alexis-de-la-torre/bootstraper components/bootstraper
	docker push gcr.io/alexis-de-la-torre/bootstraper
	@echo "» Deploying Blockchain Data Manager"
	nomad job run jobs/blockchain-data-manager.nomad

explorer:
	@echo "» Building Explorer"
	docker build -t gcr.io/alexis-de-la-torre/explorer components/explorer
	docker push gcr.io/alexis-de-la-torre/explorer
	@echo "» Deploying Explorer"
	nomad job run jobs/explorer.nomad

frontend:
	@echo "» Building Frontend"
	docker build -t gcr.io/alexis-de-la-torre/frontend components/frontend
	docker push gcr.io/alexis-de-la-torre/frontend
	@echo "» Deploying Frontend"
	nomad job run jobs/frontend.nomad

.PHONY: all blockchain blockchain-data-manager explorer frontend
